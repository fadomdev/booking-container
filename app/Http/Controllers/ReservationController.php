<?php

namespace App\Http\Controllers;

use App\Models\ScheduleConfig;
use App\Models\SpecialSchedule;
use App\Models\BlockedDate;
use App\Models\BlockedSlot;
use App\Models\Reservation;
use App\Mail\ReservationCancelled;
use App\Services\BookingValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Carbon\Carbon;

class ReservationController extends Controller
{
    /**
     * Display the reservation form.
     */
    public function create(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        // Get all blocked dates (active ones, from today onwards)
        $blockedDates = BlockedDate::where('is_active', true)
            ->where('date', '>=', now()->format('Y-m-d'))
            ->pluck('date')
            ->map(fn($d) => $d->format('Y-m-d'))
            ->toArray();

        // Check if date is blocked
        if (BlockedDate::isDateBlocked($date)) {
            $blockedDate = BlockedDate::getBlockedDate($date);
            return Inertia::render('reservations/create', [
                'timeSlots' => [],
                'selectedDate' => $date,
                'isBlocked' => true,
                'blockReason' => $blockedDate->reason ?? 'Fecha no disponible',
                'blockedDates' => $blockedDates,
            ]);
        }

        // Get available time slots from active configurations
        $timeSlots = $this->getAvailableTimeSlots($date);

        return Inertia::render('reservations/create', [
            'timeSlots' => $timeSlots,
            'selectedDate' => $date,
            'isBlocked' => false,
            'blockedDates' => $blockedDates,
        ]);
    }

    /**
     * Get available time slots for a specific date.
     */
    private function getAvailableTimeSlots(string $date): array
    {
        $user = request()->user();
        $allSlots = [];
        $now = now();
        $isToday = $date === $now->format('Y-m-d');

        // Get blocked slots for this date
        $blockedSlots = BlockedSlot::getActiveBlocksForDate($date);

        // STEP 1: Generate regular schedule slots (everyone sees these)
        // Pass blocked slots to generateSlotsForDate so it can restart from block end times
        $configs = ScheduleConfig::where('is_active', true)->get();

        foreach ($configs as $config) {
            $slots = $config->generateSlotsForDate($date, $blockedSlots);
            foreach ($slots as $slot) {
                // Skip past time slots if it's today
                if ($isToday) {
                    $slotDateTime = Carbon::createFromFormat('Y-m-d H:i', $date . ' ' . $slot['time']);
                    if ($slotDateTime->isPast()) {
                        continue;
                    }
                }

                $availableCapacity = Reservation::getAvailableCapacity(
                    $date,
                    $slot['time'],
                    $slot['total_capacity']
                );

                if ($availableCapacity > 0) {
                    $allSlots[] = [
                        'time' => $slot['time'],
                        'total_capacity' => $slot['total_capacity'],
                        'available_capacity' => $availableCapacity,
                        'config_id' => $slot['config_id'],
                        'is_special' => false,
                        'is_past' => false,
                    ];
                }
            }
        }

        // STEP 2: Add special schedule extended hours
        $specialSchedule = SpecialSchedule::getForDate($date);

        if ($specialSchedule) {
            // Check if user can see this special schedule
            $canSeeSpecialSchedule = !$specialSchedule->restricted_access ||
                $specialSchedule->isUserAuthorized($user);

            if ($canSeeSpecialSchedule) {
                // Get all special slots
                $specialSlots = $specialSchedule->generateSlots();

                // Get the last regular slot time (not end_time, but the last actual slot)
                $lastRegularSlotTime = null;
                if (!empty($allSlots)) {
                    // Get the maximum time from already generated normal slots
                    $lastRegularSlotTime = max(array_column($allSlots, 'time'));
                }

                // Only add slots that extend beyond the last regular slot
                foreach ($specialSlots as $slot) {
                    // If no regular slots exist, add all special slots
                    // Otherwise, only add slots that are after the last regular slot
                    $shouldAdd = $lastRegularSlotTime === null || $slot['time'] > $lastRegularSlotTime;

                    if ($shouldAdd) {
                        // Skip past time slots if it's today
                        if ($isToday) {
                            $slotDateTime = Carbon::createFromFormat('Y-m-d H:i', $date . ' ' . $slot['time']);
                            if ($slotDateTime->isPast()) {
                                continue;
                            }
                        }

                        // Skip blocked time slots
                        $isBlocked = $blockedSlots->contains(function ($blockedSlot) use ($slot) {
                            return $blockedSlot->blocksTime($slot['time']);
                        });

                        if ($isBlocked) {
                            continue;
                        }

                        $availableCapacity = Reservation::getAvailableCapacity(
                            $date,
                            $slot['time'],
                            $slot['total_capacity']
                        );

                        if ($availableCapacity > 0) {
                            $allSlots[] = [
                                'time' => $slot['time'],
                                'total_capacity' => $slot['total_capacity'],
                                'available_capacity' => $availableCapacity,
                                'special_schedule_id' => $slot['special_schedule_id'],
                                'is_special' => true,
                                'is_past' => false,
                            ];
                        }
                    }
                }
            }
        }

        // Sort by time
        usort($allSlots, fn($a, $b) => strcmp($a['time'], $b['time']));

        return $allSlots;
    }

    /**
     * Validate booking number with external API.
     */
    public function validateBooking(Request $request)
    {
        $request->validate([
            'booking_number' => ['required', 'string', 'max:255'],
        ]);

        if (!config('services.booking_api.enabled')) {
            return response()->json([
                'valid' => true,
                'message' => 'Validación deshabilitada',
            ]);
        }

        $validationService = new BookingValidationService();
        $result = $validationService->validateBooking($request->booking_number);

        return response()->json($result);
    }

    /**
     * Pre-validate ALL reservation conditions BEFORE sending containers to external API.
     * This prevents orphaned containers in the external system.
     * Validates: date blocking, time availability, capacity, container format/duplicates
     */
    public function preValidate(Request $request)
    {
        $validated = $request->validate([
            'reservation_date' => ['required', 'date', 'after_or_equal:today'],
            'reservation_time' => ['required', 'date_format:H:i'],
            'booking_number' => ['required', 'string', 'max:255'],
            'slots_requested' => ['required', 'integer', 'min:1'],
            'container_numbers' => ['required', 'array'],
            'container_numbers.*' => ['required', 'string', 'max:20'],
        ]);

        // 1. Check if date is blocked
        if (BlockedDate::isDateBlocked($validated['reservation_date'])) {
            return response()->json([
                'valid' => false,
                'message' => 'Esta fecha no está disponible para reservas.',
            ]);
        }

        // 2. Validate that time slot is not in the past
        $slotDateTime = Carbon::createFromFormat(
            'Y-m-d H:i',
            $validated['reservation_date'] . ' ' . $validated['reservation_time']
        );
        if ($slotDateTime->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'No se puede reservar un horario que ya pasó.',
            ]);
        }

        // 3. Get configuration and check capacity
        $configs = ScheduleConfig::where('is_active', true)->get();
        $blockedSlots = BlockedSlot::getActiveBlocksForDate($validated['reservation_date']);
        $configCapacity = 0;

        // Check regular schedule configurations
        foreach ($configs as $config) {
            $slots = $config->generateSlotsForDate($validated['reservation_date'], $blockedSlots);
            foreach ($slots as $slot) {
                if ($slot['time'] === $validated['reservation_time']) {
                    $configCapacity = $slot['total_capacity'];
                    break 2;
                }
            }
        }

        // If not found in regular schedules, check special schedules
        if ($configCapacity === 0) {
            $specialSchedule = SpecialSchedule::getForDate($validated['reservation_date']);
            if ($specialSchedule) {
                $specialSlots = $specialSchedule->generateSlots();
                foreach ($specialSlots as $slot) {
                    if ($slot['time'] === $validated['reservation_time']) {
                        $configCapacity = $slot['total_capacity'];
                        break;
                    }
                }
            }
        }

        if ($configCapacity === 0) {
            return response()->json([
                'valid' => false,
                'message' => 'Este horario no está disponible.',
            ]);
        }

        // 4. Validate slot limit based on schedule capacity
        if ($validated['slots_requested'] > $configCapacity) {
            return response()->json([
                'valid' => false,
                'message' => 'No puedes reservar más de ' . $configCapacity . ' cupos para este horario.',
            ]);
        }

        // 5. Check real-time capacity (race condition protection)
        $availableCapacity = Reservation::getAvailableCapacity(
            $validated['reservation_date'],
            $validated['reservation_time'],
            $configCapacity
        );

        if ($availableCapacity < $validated['slots_requested']) {
            return response()->json([
                'valid' => false,
                'message' => 'No hay suficientes cupos disponibles. Los cupos se han agotado.',
            ]);
        }

        // 6. Validate container numbers (format and duplicates)
        $result = $this->validateContainerNumbers(
            $validated['container_numbers'],
            $validated['booking_number']
        );

        if (!$result['valid']) {
            return response()->json([
                'valid' => false,
                'message' => implode(' ', $result['errors']),
            ]);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Todas las validaciones pasaron correctamente',
        ]);
    }

    /**
     * Pre-validate containers before sending to external API.
     * Checks for duplicates in existing reservations.
     */
    public function validateContainers(Request $request)
    {
        $validated = $request->validate([
            'booking_number' => ['required', 'string', 'max:255'],
            'container_numbers' => ['required', 'array'],
            'container_numbers.*' => ['required', 'string', 'max:20'],
        ]);

        $result = $this->validateContainerNumbers(
            $validated['container_numbers'],
            $validated['booking_number']
        );

        if (!$result['valid']) {
            return response()->json([
                'valid' => false,
                'errors' => $result['errors'],
            ]);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Contenedores válidos',
        ]);
    }

    /**
     * Validate container numbers format and check for duplicates.
     * Returns ['valid' => bool, 'errors' => array, 'clean_numbers' => array]
     */
    private function validateContainerNumbers(array $containerNumbers, string $bookingNumber): array
    {
        // Clean container numbers
        $cleanContainerNumbers = array_map(function ($number) {
            return strtoupper(str_replace(' ', '', $number));
        }, $containerNumbers);

        // Validate container number format
        $formatErrors = [];
        foreach ($cleanContainerNumbers as $index => $containerNumber) {
            if (!Reservation::validateContainerNumber($containerNumber)) {
                $formatErrors[] = "Contenedor #" . ($index + 1) . ": Formato inválido. Debe ser 4 letras seguidas de 7 dígitos (ej: ABCD1234567).";
            }
        }

        if (!empty($formatErrors)) {
            return [
                'valid' => false,
                'errors' => $formatErrors,
                'clean_numbers' => $cleanContainerNumbers,
            ];
        }

        // Check for duplicates in existing reservations with same booking number
        $existingReservations = Reservation::where('booking_number', $bookingNumber)
            ->whereIn('status', ['active', 'confirmed', 'completed'])
            ->get();

        $duplicateErrors = [];

        foreach ($existingReservations as $existingReservation) {
            $existingContainers = is_array($existingReservation->container_numbers)
                ? $existingReservation->container_numbers
                : json_decode($existingReservation->container_numbers, true) ?? [];

            $duplicates = array_intersect($cleanContainerNumbers, $existingContainers);

            if (!empty($duplicates)) {
                foreach ($duplicates as $duplicate) {
                    $duplicateErrors[] = "El contenedor {$duplicate} ya está registrado para el Booking #{$bookingNumber}";
                }
            }
        }

        if (!empty($duplicateErrors)) {
            return [
                'valid' => false,
                'errors' => array_unique($duplicateErrors),
                'clean_numbers' => $cleanContainerNumbers,
            ];
        }

        return [
            'valid' => true,
            'errors' => [],
            'clean_numbers' => $cleanContainerNumbers,
        ];
    }

    /**
     * Store a newly created reservation.
     *
     * Flujo atómico:
     *  1. Validar request localmente.
     *  2. Iniciar transacción DB y crear registro de reserva.
     *  3. Llamar API externa BCMS para registrar contenedores.
     *  4a. BCMS falla  → rollback DB (sin reserva huérfana) → error al usuario.
     *  4b. BCMS OK     → commit DB → éxito.
     *
     * Garantiza que los contenedores en BCMS y las reservas locales siempre estén en sync.
     * Elimina el problema de contenedores huérfanos en BCMS cuando falla la creación local.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_date'    => ['required', 'date', 'after_or_equal:today'],
            'reservation_time'    => ['required', 'date_format:H:i'],
            'booking_number'      => ['required', 'string', 'max:255'],
            'transporter_name'    => ['required', 'string', 'max:255'],
            'truck_plate'         => ['required', 'string', 'max:10'],
            'slots_requested'     => ['required', 'integer', 'min:1'],
            'container_numbers'   => ['required', 'array'],
            'container_numbers.*' => ['required', 'string', 'max:20'],
            'flexitank_code'      => ['nullable', 'string', 'max:100'],
            'file_info'           => ['nullable', 'string'],
        ]);

        if (count($validated['container_numbers']) !== $validated['slots_requested']) {
            return back()
                ->withErrors(['container_numbers' => 'Debes ingresar ' . $validated['slots_requested'] . ' número(s) de contenedor.'])
                ->withInput();
        }

        $cleanContainerNumbers = array_map(
            fn($n) => strtoupper(str_replace(' ', '', $n)),
            $validated['container_numbers']
        );

        $reservationTime = strlen($validated['reservation_time']) === 5
            ? $validated['reservation_time'] . ':00'
            : $validated['reservation_time'];

        $bcmsApiUrl      = config('services.booking_api.url');
        $truckingCompany = $request->user()->company?->name ?? 'Sin empresa';

        DB::beginTransaction();

        try {
            // PASO 1: Crear reserva en BD local (aún no confirmada – dentro de transacción)
            $reservation = Reservation::create([
                'user_id'           => $request->user()->id,
                'reservation_date'  => $validated['reservation_date'],
                'reservation_time'  => $reservationTime,
                'booking_number'    => $validated['booking_number'],
                'transportista_name' => $validated['transporter_name'],
                'truck_plate'       => strtoupper($validated['truck_plate']),
                'slots_reserved'    => $validated['slots_requested'],
                'container_numbers' => $cleanContainerNumbers,
                'flexitank_code'    => $validated['flexitank_code'] ?? null,
                'file_info'         => $validated['file_info'] ?? null,
                'status'            => 'active',
            ]);

            // PASO 2: Registrar contenedores en BCMS
            // Si BCMS falla → rollback automático; ningún sistema queda en estado inconsistente
            if (empty($bcmsApiUrl)) {
                Log::warning('BOOKING_API_URL no configurada – contenedores NO registrados en BCMS', [
                    'booking'    => $validated['booking_number'],
                    'containers' => $cleanContainerNumbers,
                ]);
            } else {
                $bcmsResponse = Http::connectTimeout(10)->timeout(30)->post($bcmsApiUrl, [
                    'action'            => 'crear_contenedor',
                    'booking_number'    => $validated['booking_number'],
                    'container_numbers' => $cleanContainerNumbers,
                    'transporter_name'  => $validated['transporter_name'],
                    'truck_plate'       => strtoupper($validated['truck_plate']),
                    'trucking_company'  => $truckingCompany,
                ]);

                $bcmsData = $bcmsResponse->json() ?? [];

                Log::info('BCMS crear_contenedor', [
                    'http_status' => $bcmsResponse->status(),
                    'booking'     => $validated['booking_number'],
                    'containers'  => $cleanContainerNumbers,
                    'success'     => $bcmsData['success'] ?? false,
                ]);

                if (!$bcmsResponse->successful() || !($bcmsData['success'] ?? false)) {
                    DB::rollBack();

                    $bcmsErrors = [];
                    if (!empty($bcmsData['validation_errors']) && is_array($bcmsData['validation_errors'])) {
                        foreach ($bcmsData['validation_errors'] as $err) {
                            foreach (($err['errors'] ?? []) as $msg) {
                                $bcmsErrors[] = $msg;
                            }
                        }
                    } elseif (!empty($bcmsData['message'])) {
                        $bcmsErrors[] = $bcmsData['message'];
                    } else {
                        $bcmsErrors[] = 'Error HTTP ' . $bcmsResponse->status() . ' al comunicarse con sistema externo.';
                    }

                    Log::warning('BCMS rechazó contenedores – reserva revertida', [
                        'booking'    => $validated['booking_number'],
                        'containers' => $cleanContainerNumbers,
                        'errors'     => $bcmsErrors,
                    ]);

                    return back()
                        ->withErrors(['container_numbers' => implode("\n", $bcmsErrors)])
                        ->withInput();
                }

                // Guardar respuesta BCMS en api_notes
                $reservation->update([
                    'api_notes' => json_encode([
                        'timestamp'     => now()->toISOString(),
                        'booking'       => $validated['booking_number'],
                        'containers'    => $cleanContainerNumbers,
                        'success'       => true,
                        'bcms_response' => $bcmsData,
                    ]),
                ]);
            }

            // PASO 3: Confirmar transacción – ambos sistemas están en sync
            DB::commit();

            return back()->with([
                'success' => true,
                'reservation' => [
                    'id'                => $reservation->id,
                    'reservation_date'  => $reservation->reservation_date->format('Y-m-d'),
                    'reservation_time'  => $reservation->reservation_time,
                    'booking_number'    => $reservation->booking_number,
                    'transporter_name'  => $reservation->transportista_name,
                    'truck_plate'       => $reservation->truck_plate,
                    'slots_reserved'    => $reservation->slots_reserved,
                    'container_numbers' => $reservation->container_numbers,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // ALERTA: Si BCMS ya aceptó los contenedores pero el commit falló,
            // los contenedores quedan en BCMS sin reserva local.
            // Se loguea como CRITICAL para resolución manual.
            Log::critical('POSIBLE INCONSISTENCIA: Error tras llamar BCMS', [
                'error'      => $e->getMessage(),
                'booking'    => $validated['booking_number'] ?? null,
                'containers' => $cleanContainerNumbers ?? [],
                'action'     => 'Verificar si los contenedores fueron creados en BCMS y eliminarlos manualmente si no hay reserva.',
            ]);

            return back()
                ->withErrors(['container_numbers' => 'Error al procesar la reserva. Por favor intente nuevamente.'])
                ->withInput();
        }
    }



    /**
     * Display user's reservations.
     */
    public function myReservations(Request $request)
    {
        $query = Reservation::query()
            ->where('user_id', $request->user()->id);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date') && $request->date) {
            $query->where('reservation_date', $request->date);
        }

        $reservations = $query
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('reservations/my-reservations', [
            'reservations' => $reservations,
            'filters' => $request->only(['status', 'date']),
        ]);
    }

    /**
     * Cancel a reservation.
     */
    public function cancel(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        // Check if user owns the reservation
        if ($reservation->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'No tienes permisos para cancelar esta reserva.');
        }

        if ($reservation->status === 'cancelled') {
            return back()->with('error', 'Esta reserva ya está cancelada.');
        }

        $validated = $request->validate([
            'cancellation_comment' => ['nullable', 'string', 'max:1000'],
        ]);

        // Cancel the reservation
        $reservation->cancel(
            $validated['cancellation_comment'] ?? null,
            $user->id
        );

        // Load relationships for email
        $reservation->load(['user', 'cancelledBy']);

        // Determine if this is an admin cancellation
        $isAdminCancellation = $user->isAdmin() && $reservation->user_id !== $user->id;

        // Send email notification
        if ($isAdminCancellation) {
            // Admin cancelled: notify the client if they have email
            if ($reservation->user->email) {
                Mail::to($reservation->user->email)
                    ->send(new ReservationCancelled(
                        $reservation,
                        $user,
                        true
                    ));
            }
        } else {
            // Client cancelled: notify admin
            // Get first admin user
            $admin = \App\Models\User::where('role', 'admin')->first();
            if ($admin && $admin->email) {
                Mail::to($admin->email)
                    ->send(new ReservationCancelled(
                        $reservation,
                        $user,
                        false
                    ));
            }
        }

        return back()->with('success', 'Reserva anulada exitosamente.');
    }
}
