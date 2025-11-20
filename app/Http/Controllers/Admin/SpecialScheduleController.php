<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SpecialSchedule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialScheduleController extends Controller
{
    /**
     * Display a listing of special schedules.
     */
    public function index()
    {
        $schedules = SpecialSchedule::with('authorizedUsers:id,name,email')
            ->withCount('authorizedUsers')
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('admin/special-schedules/index', [
            'schedules' => $schedules,
        ]);
    }

    /**
     * Show the form for creating a new special schedule.
     */
    public function create()
    {
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('admin/special-schedules/create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created special schedule.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today', 'unique:special_schedules,date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'interval_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'slots_per_interval' => ['required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['boolean'],
            'restricted_access' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'authorized_user_ids' => ['nullable', 'array'],
            'authorized_user_ids.*' => ['exists:users,id'],
        ]);

        $specialSchedule = SpecialSchedule::create([
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'interval_minutes' => $validated['interval_minutes'],
            'slots_per_interval' => $validated['slots_per_interval'],
            'is_active' => $validated['is_active'] ?? true,
            'restricted_access' => $validated['restricted_access'] ?? false,
            'description' => $validated['description'] ?? null,
        ]);

        // Attach authorized users if restricted access
        if ($specialSchedule->restricted_access && isset($validated['authorized_user_ids'])) {
            $specialSchedule->authorizedUsers()->attach($validated['authorized_user_ids']);
        }

        return redirect()->route('admin.special-schedules.index')
            ->with('success', 'Horario especial creado exitosamente.');
    }

    /**
     * Show the form for editing the specified special schedule.
     */
    public function edit(SpecialSchedule $specialSchedule)
    {
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        $specialSchedule->load('authorizedUsers:id,name,email');

        return Inertia::render('admin/special-schedules/edit', [
            'schedule' => $specialSchedule,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified special schedule.
     */
    public function update(Request $request, SpecialSchedule $specialSchedule)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today', 'unique:special_schedules,date,' . $specialSchedule->id],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'interval_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'slots_per_interval' => ['required', 'integer', 'min:1', 'max:50'],
            'is_active' => ['boolean'],
            'restricted_access' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'authorized_user_ids' => ['nullable', 'array'],
            'authorized_user_ids.*' => ['exists:users,id'],
        ]);

        $specialSchedule->update([
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'interval_minutes' => $validated['interval_minutes'],
            'slots_per_interval' => $validated['slots_per_interval'],
            'is_active' => $validated['is_active'] ?? true,
            'restricted_access' => $validated['restricted_access'] ?? false,
            'description' => $validated['description'] ?? null,
        ]);

        // Sync authorized users
        if ($specialSchedule->restricted_access && isset($validated['authorized_user_ids'])) {
            $specialSchedule->authorizedUsers()->sync($validated['authorized_user_ids']);
        } else {
            $specialSchedule->authorizedUsers()->detach();
        }

        return redirect()->route('admin.special-schedules.index')
            ->with('success', 'Horario especial actualizado exitosamente.');
    }

    /**
     * Remove the specified special schedule.
     */
    public function destroy(SpecialSchedule $specialSchedule)
    {
        $specialSchedule->delete();

        return redirect()->route('admin.special-schedules.index')
            ->with('success', 'Horario especial eliminado exitosamente.');
    }

    /**
     * Toggle the active status of a special schedule.
     */
    public function toggleStatus(SpecialSchedule $specialSchedule)
    {
        $specialSchedule->update([
            'is_active' => !$specialSchedule->is_active,
        ]);

        return back()->with('success', 'Estado actualizado exitosamente.');
    }
}
