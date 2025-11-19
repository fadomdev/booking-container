<?php

namespace App\Http\Controllers;

use App\Models\ScheduleConfig;
use App\Models\BlockedDate;
use App\Models\Booking;
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
        $configs = ScheduleConfig::where('is_active', true)->get();
        $allSlots = [];
        $now = now();
        $isToday = $date === $now->format('Y-m-d');

        foreach ($configs as $config) {
            $slots = $config->generateSlotsForDate($date);
            foreach ($slots as $slot) {
                // Skip past time slots if it's today
                if ($isToday) {
                    $slotDateTime = Carbon::createFromFormat('Y-m-d H:i', $date . ' ' . $slot['time']);
                    if ($slotDateTime->isPast()) {
                        continue; // Skip this slot, it's in the past
                    }
                }

                $availableCapacity = Reservation::getAvailableCapacity(
                    $date,
                    $slot['time'],
                    $slot['total_capacity']
                );

                // Only include slots with available capacity
                if ($availableCapacity > 0) {
                    $allSlots[] = [
                        'time' => $slot['time'],
                        'total_capacity' => $slot['total_capacity'],
                        'available_capacity' => $availableCapacity,
                        'config_id' => $slot['config_id'],
                        'is_past' => false, // Already filtered out past slots
                    ];
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
     * Send containers to external API before creating reservation.
     */
    public function sendContainersToApi(Request $request)
    {
        $validated = $request->validate([
            'booking_number' => ['required', 'string', 'max:255'],
            'container_numbers' => ['required', 'array'],
            'container_numbers.*' => ['required', 'string', 'max:20'],
            'transporter_name' => ['required', 'string', 'max:255'],
            'truck_plate' => ['required', 'string', 'max:10'],
        ]);

        $user = $request->user();

        // Load company relationship
        if (!$user->relationLoaded('company')) {
            $user->load('company');
        }

        $companyName = $user->company ? $user->company->name : 'Sin empresa';
        $results = [];
        $errors = [];
        $notes = [];

        try {
            $totalContainers = count($validated['container_numbers']);
            $apiUrl = config('services.booking_api.url');

            foreach ($validated['container_numbers'] as $index => $containerNumber) {
                $cleanNumber = strtoupper(str_replace(' ', '', $containerNumber));

                $data = [
                    'action' => 'crear_contenedor',
                    'booking_number' => $validated['booking_number'],
                    'container_numbers' => [$cleanNumber],
                    'transporter_name' => $validated['transporter_name'],
                    'truck_plate' => strtoupper($validated['truck_plate']),
                    'trucking_company' => $companyName,
                    'usuario_id' => $user->id,
                ];

                Log::info('Sending container to external API', [
                    'user_id' => $user->id,
                    'container' => $cleanNumber,
                    'booking' => $validated['booking_number'],
                    'api_url' => $apiUrl,
                ]);

                $response = Http::timeout(10)->post($apiUrl, $data);

                $responseData = $response->json();

                if ($response->successful() && isset($responseData['success']) && $responseData['success']) {
                    $results[] = [
                        'container' => $cleanNumber,
                        'success' => true,
                        'data' => $responseData['data'] ?? null,
                    ];

                    $notes[] = "✓ Contenedor {$cleanNumber}: Guardado exitosamente en la API externa";

                    Log::info('Container sent to external API from frontend', [
                        'user_id' => $user->id,
                        'container' => $cleanNumber,
                        'booking' => $validated['booking_number'],
                        'response' => $responseData,
                    ]);
                } else {
                    $errorMessage = $responseData['message'] ?? 'Error desconocido';

                    // Check for specific error types
                    if (strpos($errorMessage, 'ya existe') !== false || strpos($errorMessage, 'duplicado') !== false) {
                        $errorType = 'Duplicado';
                    } elseif (strpos($errorMessage, 'máxima') !== false || strpos($errorMessage, 'capacidad') !== false) {
                        $errorType = 'Capacidad excedida';
                    } elseif (strpos($errorMessage, 'formato') !== false || strpos($errorMessage, 'inválido') !== false) {
                        $errorType = 'Formato inválido';
                    } elseif (strpos($errorMessage, 'verificador') !== false) {
                        $errorType = 'Dígito verificador incorrecto';
                    } else {
                        $errorType = 'Error';
                    }

                    $errors[] = [
                        'container' => $cleanNumber,
                        'message' => $errorMessage,
                        'type' => $errorType,
                    ];

                    $notes[] = "✗ Contenedor {$cleanNumber}: {$errorType} - {$errorMessage}";

                    Log::warning('External API returned error for container from frontend', [
                        'user_id' => $user->id,
                        'container' => $cleanNumber,
                        'booking' => $validated['booking_number'],
                        'error' => $errorMessage,
                        'error_type' => $errorType,
                    ]);
                }
            }

            $successCount = count($results);
            $errorCount = count($errors);

            // Build summary message
            if ($errorCount === 0) {
                $summaryMessage = "Todos los contenedores ({$totalContainers}) fueron guardados exitosamente en la API externa";
            } elseif ($successCount === 0) {
                $summaryMessage = "Ningún contenedor pudo ser guardado en la API externa ({$errorCount} error(es))";
            } else {
                $summaryMessage = "{$successCount} de {$totalContainers} contenedores guardados exitosamente en la API externa ({$errorCount} error(es))";
            }

            // Create structured notes in JSON format for better display
            $structuredNotes = [
                'timestamp' => now()->format('Y-m-d H:i:s'),
                'booking_number' => $validated['booking_number'],
                'total_containers' => $totalContainers,
                'successful' => $successCount,
                'failed' => $errorCount,
                'api_url' => $apiUrl,
                'results' => $results,
                'errors' => $errors,
                'summary' => $summaryMessage,
            ];

            $notesJson = json_encode($structuredNotes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

            // Always return success with notes, even if there were errors
            // The reservation should be created regardless of API result
            return response()->json([
                'success' => true,
                'message' => $summaryMessage,
                'results' => $results,
                'errors' => $errors,
                'notes' => $notesJson,
                'has_errors' => count($errors) > 0,
                'success_count' => $successCount,
                'error_count' => $errorCount,
            ]);
        } catch (\Exception $e) {
            $structuredErrorNotes = [
                'timestamp' => now()->format('Y-m-d H:i:s'),
                'booking_number' => $validated['booking_number'] ?? 'N/A',
                'total_containers' => count($validated['container_numbers'] ?? []),
                'successful' => 0,
                'failed' => count($validated['container_numbers'] ?? []),
                'api_url' => config('services.booking_api.url'),
                'results' => [],
                'errors' => [[
                    'container' => 'N/A',
                    'message' => 'Error de conexión: ' . $e->getMessage(),
                    'type' => 'Error de Conexión',
                ]],
                'summary' => 'Error al conectar con la API externa: ' . $e->getMessage(),
            ];

            $notesJson = json_encode($structuredErrorNotes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

            Log::error('Failed to send containers to external API from frontend', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al conectar con la API externa: ' . $e->getMessage(),
                'notes' => $notesJson,
            ], 500);
        }
    }

    /**
     * Store a newly created reservation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_date' => ['required', 'date', 'after_or_equal:today'],
            'reservation_time' => ['required', 'date_format:H:i'],
            'booking_number' => ['required', 'string', 'max:255'],
            'transporter_name' => ['required', 'string', 'max:255'],
            'truck_plate' => ['required', 'string', 'max:10'],
            'slots_requested' => ['required', 'integer', 'min:1', 'max:2'],
            'container_numbers' => ['required', 'array'],
            'container_numbers.*' => ['required', 'string', 'max:20'],
            'api_notes' => ['nullable', 'string'],
        ]);

        // Validate container numbers count matches slots requested
        if (count($validated['container_numbers']) !== $validated['slots_requested']) {
            return back()
                ->withErrors(['container_numbers' => 'Debes ingresar ' . $validated['slots_requested'] . ' número(s) de contenedor.'])
                ->withInput();
        }

        // Validate each container number format
        foreach ($validated['container_numbers'] as $index => $containerNumber) {
            $cleanNumber = strtoupper(str_replace(' ', '', $containerNumber));
            if (!Reservation::validateContainerNumber($cleanNumber)) {
                return back()
                    ->withErrors(['container_numbers.' . $index => 'Formato inválido. Debe ser 4 letras seguidas de 7 dígitos (ej: ABCD1234567).'])
                    ->withInput();
            }
        }

        return DB::transaction(function () use ($validated, $request) {
            $redirectRoute = route('reservations.create', ['date' => $validated['reservation_date']]);

            // Check if date is blocked
            if (BlockedDate::isDateBlocked($validated['reservation_date'])) {
                return redirect($redirectRoute)
                    ->withErrors(['reservation_date' => 'Esta fecha no está disponible para reservas.'])
                    ->withInput();
            }

            // Validate that time slot is not in the past
            $slotDateTime = Carbon::createFromFormat('Y-m-d H:i', $validated['reservation_date'] . ' ' . $validated['reservation_time']);
            if ($slotDateTime->isPast()) {
                return redirect($redirectRoute)
                    ->withErrors(['reservation_time' => 'No se puede reservar un horario que ya pasó.'])
                    ->withInput();
            }

            // Find or create booking
            $booking = Booking::firstOrCreate(
                ['booking_number' => $validated['booking_number']],
                ['is_active' => true]
            );

            if (!$booking->is_active) {
                return redirect($redirectRoute)
                    ->withErrors(['booking_number' => 'Este número de booking no está activo.'])
                    ->withInput();
            }

            // Check if booking exists and validate slot limit
            $slotsRequested = $validated['slots_requested'];
            $bookingWasJustCreated = $booking->wasRecentlyCreated;

            if ($slotsRequested > 1 && $bookingWasJustCreated) {
                return redirect($redirectRoute)
                    ->withErrors(['slots_requested' => 'Solo puedes reservar 2 cupos si el booking ya existe.'])
                    ->withInput();
            }

            // Get configuration and check capacity
            $configs = ScheduleConfig::where('is_active', true)->get();
            $configCapacity = 0;

            foreach ($configs as $config) {
                $slots = $config->generateSlotsForDate($validated['reservation_date']);
                foreach ($slots as $slot) {
                    if ($slot['time'] === $validated['reservation_time']) {
                        $configCapacity = $slot['total_capacity'];
                        break 2;
                    }
                }
            }

            if ($configCapacity === 0) {
                return redirect($redirectRoute)
                    ->withErrors(['reservation_time' => 'Este horario no está disponible.'])
                    ->withInput();
            }

            // Re-check capacity in real-time (race condition protection)
            $availableCapacity = Reservation::getAvailableCapacity(
                $validated['reservation_date'],
                $validated['reservation_time'],
                $configCapacity
            );

            if ($availableCapacity < $slotsRequested) {
                return redirect()->route('reservations.create', ['date' => $validated['reservation_date']])
                    ->withErrors(['slots_requested' => 'No hay suficientes cupos disponibles en este horario. Los cupos se han agotado.'])
                    ->withInput();
            }

            // Clean and format container numbers
            $cleanContainerNumbers = array_map(function ($number) {
                return strtoupper(str_replace(' ', '', $number));
            }, $validated['container_numbers']);

            // Ensure time is in HH:MM:SS format for MySQL TIME field
            $reservationTime = strlen($validated['reservation_time']) === 5
                ? $validated['reservation_time'] . ':00'
                : $validated['reservation_time'];

            // Create reservation
            $reservation = Reservation::create([
                'user_id' => $request->user()->id,
                'reservation_date' => $validated['reservation_date'],
                'reservation_time' => $reservationTime,
                'booking_id' => $booking->id,
                'transportista_name' => $validated['transporter_name'],
                'truck_plate' => strtoupper($validated['truck_plate']),
                'slots_reserved' => $slotsRequested,
                'container_numbers' => $cleanContainerNumbers,
                'api_notes' => $validated['api_notes'] ?? null,
                'status' => 'active',
            ]);

            // NOTE: Containers are now sent from frontend via sendContainersToApi() before reservation creation
            // This ensures immediate feedback to the user if there are any issues with the external API
            // No need to send containers here again

            // Return success with reservation data to show in modal
            return back()->with([
                'success' => true,
                'reservation' => [
                    'id' => $reservation->id,
                    'reservation_date' => $reservation->reservation_date->format('Y-m-d'),
                    'reservation_time' => $reservation->reservation_time,
                    'booking_number' => $booking->booking_number,
                    'transporter_name' => $reservation->transportista_name,
                    'truck_plate' => $reservation->truck_plate,
                    'slots_reserved' => $reservation->slots_reserved,
                    'container_numbers' => $reservation->container_numbers,
                ],
            ]);
        });
    }

    /**
     * Send container data to external API.
     */
    private function sendContainersToExternalApi(Reservation $reservation, $user)
    {
        try {
            // Load company and booking relationships if not loaded
            if (!$user->relationLoaded('company')) {
                $user->load('company');
            }

            if (!$reservation->relationLoaded('booking')) {
                $reservation->load('booking');
            }

            // Get company name
            $companyName = $user->company ? $user->company->name : 'Sin empresa';

            // Get booking number
            $bookingNumber = $reservation->booking ? $reservation->booking->booking_number : '';

            // Prepare data for each container
            foreach ($reservation->container_numbers as $containerNumber) {
                $data = [
                    'action' => 'crear_contenedor',
                    'codigo' => $containerNumber,
                    'booking' => $bookingNumber,
                    'empresa' => $companyName,
                    'nombre_conductor' => $reservation->transportista_name,
                    'patente' => $reservation->truck_plate,
                    'empresa_transporte' => $companyName,
                    'usuario_id' => $user->id,
                    // Campos opcionales para sello y flexitank
                    'sello' => '',
                    'sello_armado' => '',
                    'tipo_flexi' => '',
                    'numero_flexi' => '',
                    'sello_flexi' => '',
                    'rut_conductor' => '',
                    'telefono_conductor' => '',
                ];

                // Send to external API
                $response = Http::timeout(10)->post(
                    config('services.booking_api.url'),
                    $data
                );

                // Check if response was successful
                $responseData = $response->json();

                if ($response->successful() && isset($responseData['success']) && $responseData['success']) {
                    Log::info('Container successfully sent to external API', [
                        'reservation_id' => $reservation->id,
                        'container' => $containerNumber,
                        'booking' => $bookingNumber,
                        'response' => $responseData,
                    ]);
                } else {
                    Log::warning('External API returned error for container', [
                        'reservation_id' => $reservation->id,
                        'container' => $containerNumber,
                        'booking' => $bookingNumber,
                        'status' => $response->status(),
                        'response' => $responseData,
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Log error but don't fail the reservation
            Log::error('Failed to send containers to external API', [
                'reservation_id' => $reservation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Display user's reservations.
     */
    public function myReservations(Request $request)
    {
        $query = Reservation::with(['booking'])
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
        $reservation->load(['user', 'booking', 'cancelledBy']);

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

    /**
     * Verify if a booking number exists.
     */
    public function verifyBooking(Request $request)
    {
        $validated = $request->validate([
            'booking_number' => ['required', 'string'],
        ]);

        $booking = Booking::where('booking_number', $validated['booking_number'])
            ->where('is_active', true)
            ->first();

        return response()->json([
            'exists' => $booking !== null,
            'can_book_multiple' => $booking !== null,
        ]);
    }
}
