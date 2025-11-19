<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class TimeSlotController extends Controller
{
    /**
     * Display a listing of time slots.
     */
    public function index(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $timeSlots = TimeSlot::where('date', $date)
            ->orderBy('time')
            ->with(['activeReservations.user', 'activeReservations.booking'])
            ->get();

        return Inertia::render('admin/time-slots/index', [
            'timeSlots' => $timeSlots,
            'selectedDate' => $date,
        ]);
    }

    /**
     * Generate time slots for a specific date.
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
        ]);

        $date = Carbon::parse($validated['date']);

        // Check if slots already exist for this date
        $existingCount = TimeSlot::where('date', $date->format('Y-m-d'))->count();

        if ($existingCount > 0) {
            return back()->with('error', 'Ya existen horarios para esta fecha.');
        }

        // Generate slots every 30 minutes starting from 8:00
        $startTime = Carbon::parse($date->format('Y-m-d') . ' 08:00:00');
        $endTime = Carbon::parse($date->format('Y-m-d') . ' 18:00:00'); // Until 6 PM

        $currentTime = $startTime->copy();
        $created = 0;

        while ($currentTime->lessThan($endTime)) {
            TimeSlot::create([
                'date' => $date->format('Y-m-d'),
                'time' => $currentTime->format('H:i:s'),
                'total_capacity' => 2,
                'available_capacity' => 2,
                'is_active' => true,
            ]);

            $currentTime->addMinutes(30);
            $created++;
        }

        return back()->with('success', "Se crearon {$created} horarios exitosamente.");
    }

    /**
     * Toggle time slot active status.
     */
    public function toggleStatus(TimeSlot $timeSlot)
    {
        $timeSlot->update(['is_active' => !$timeSlot->is_active]);

        $status = $timeSlot->is_active ? 'activado' : 'desactivado';
        return back()->with('success', "Horario {$status} exitosamente.");
    }

    /**
     * Update time slot capacity.
     */
    public function updateCapacity(Request $request, TimeSlot $timeSlot)
    {
        $validated = $request->validate([
            'total_capacity' => ['required', 'integer', 'min:0', 'max:10'],
        ]);

        $reservedSlots = $timeSlot->activeReservations()->sum('slots_reserved');
        $newAvailable = $validated['total_capacity'] - $reservedSlots;

        if ($newAvailable < 0) {
            return back()->with('error', 'La capacidad no puede ser menor que las reservas actuales.');
        }

        $timeSlot->update([
            'total_capacity' => $validated['total_capacity'],
            'available_capacity' => $newAvailable,
        ]);

        return back()->with('success', 'Capacidad actualizada exitosamente.');
    }
}
