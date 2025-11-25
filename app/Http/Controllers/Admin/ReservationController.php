<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Response;

class ReservationController extends Controller
{
    /**
     * Display a listing of all reservations.
     */
    public function index(Request $request)
    {
        $query = Reservation::with(['user'])
            ->orderBy('reservation_date', 'desc')
            ->orderBy('reservation_time', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->where('reservation_date', $request->date);
        }

        // Check if export to Excel is requested
        if ($request->has('export') && $request->export === 'excel') {
            return $this->exportToExcel($query);
        }

        // Get per_page value from request, default to 20, max 100
        $perPage = min((int) $request->get('per_page', 20), 100);

        $reservations = $query->paginate($perPage)->appends($request->except('page'));

        return Inertia::render('admin/reservations/index', [
            'reservations' => $reservations,
            'filters' => $request->only(['status', 'date', 'per_page']),
        ]);
    }

    /**
     * Export reservations to Excel format (CSV).
     */
    private function exportToExcel($query)
    {
        $reservations = $query->get();

        $filename = 'reservas_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($reservations) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel UTF-8 compatibility
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header row
            fputcsv($file, [
                'ID',
                'Fecha',
                'Hora',
                'Transportista',
                'Patente',
                'Booking',
                'Cupos',
                'Contenedores',
                'File Info',
                'Usuario',
                'Email Usuario',
                'Estado',
                'Creada',
                'Comentario Cancelación'
            ], ';');

            // Data rows
            foreach ($reservations as $reservation) {
                fputcsv($file, [
                    $reservation->id,
                    $reservation->reservation_date ? date('d-m-Y', strtotime($reservation->reservation_date)) : '',
                    $reservation->reservation_time,
                    $reservation->transportista_name,
                    $reservation->truck_plate,
                    $reservation->booking_number ?? '',
                    $reservation->slots_reserved,
                    $reservation->container_numbers ? implode(', ', $reservation->container_numbers) : '',
                    $reservation->file_info ?? '',
                    $reservation->user?->name ?? '',
                    $reservation->user?->email ?? '',
                    $this->getStatusLabel($reservation->status),
                    $reservation->created_at ? $reservation->created_at->format('d-m-Y H:i') : '',
                    $reservation->cancellation_comment ?? ''
                ], ';');
            }

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Get status label in Spanish.
     */
    private function getStatusLabel($status)
    {
        return match ($status) {
            'active' => 'Activa',
            'completed' => 'Completada',
            'cancelled' => 'Cancelada',
            default => $status,
        };
    }
}
