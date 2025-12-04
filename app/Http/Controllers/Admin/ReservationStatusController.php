<?php

namespace App\Http\Controllers\Admin;

use App\Models\Reservation;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ReservationStatusController extends Controller
{
    /**
     * Marcar una reserva como completada
     */
    public function markAsCompleted(Reservation $reservation)
    {
        // Verificar que la reserva esté activa
        if ($reservation->status !== 'active') {
            return back()->with('error', 'Solo se pueden marcar como completadas las reservas activas.');
        }

        $reservation->update([
            'status' => 'completed',
            'completed_at' => now(),
            'completed_by' => auth()->id(),
        ]);

        return back()->with('success', 'Reserva marcada como completada exitosamente.');
    }

    /**
     * Búsqueda de reserva por booking number, patente o RUT
     */
    public function search(Request $request)
    {
        $search = $request->input('search');

        if (empty($search)) {
            return back()->with('error', 'Debes ingresar un criterio de búsqueda.');
        }

        // Buscar por booking number o truck_plate
        $reservation = Reservation::where('status', 'active')
            ->where(function ($query) use ($search) {
                $query->where('booking_number', 'like', "%{$search}%")
                    ->orWhere('truck_plate', 'like', "%{$search}%")
                    ->orWhere('transportista_name', 'like', "%{$search}%");
            })
            ->whereDate('reservation_date', now()->toDateString()) // Solo reservas de hoy
            ->first();

        if (!$reservation) {
            return back()->with('error', 'No se encontró ninguna reserva activa para hoy con ese criterio.');
        }

        return redirect()
            ->route('admin.reservations.show', $reservation)
            ->with('success', 'Reserva encontrada.');
    }

    /**
     * Mostrar formulario de búsqueda
     */
    public function index()
    {
        return inertia('admin/reservations/search');
    }

    /**
     * Ver detalle de una reserva con opción de marcar como completada
     */
    public function show(Reservation $reservation)
    {
        return inertia('admin/reservations/show', [
            'reservation' => $reservation->load('user.company'),
        ]);
    }
}
