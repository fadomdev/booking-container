<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScheduleConfig;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ScheduleConfigController extends Controller
{
    /**
     * Display a listing of schedule configurations (one per day of week).
     */
    public function index()
    {
        // Obtener las 7 configuraciones ordenadas por día de semana
        $configs = ScheduleConfig::orderBy('day_of_week')->get();

        return Inertia::render('admin/schedule-config/index', [
            'configs' => $configs,
        ]);
    }

    /**
     * Show the form for creating a new schedule configuration.
     */
    public function create()
    {
        return Inertia::render('admin/schedule-config/create');
    }

    /**
     * Store a newly created schedule configuration.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'day_of_week' => ['required', 'integer', 'min:0', 'max:6', Rule::unique('schedule_configs', 'day_of_week')],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'interval_minutes' => ['required', 'integer', 'min:15', 'max:120'],
            'slots_per_interval' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        ScheduleConfig::create($validated);

        return redirect()->route('admin.schedule-config.index')
            ->with('success', 'Configuración de horarios creada exitosamente.');
    }

    /**
     * Show the form for editing the specified configuration.
     */
    public function edit(ScheduleConfig $scheduleConfig)
    {
        return Inertia::render('admin/schedule-config/edit', [
            'config' => $scheduleConfig,
        ]);
    }

    /**
     * Update the specified configuration.
     */
    public function update(Request $request, ScheduleConfig $scheduleConfig)
    {
        $validated = $request->validate([
            'day_of_week' => ['required', 'integer', 'min:0', 'max:6', Rule::unique('schedule_configs', 'day_of_week')->ignore($scheduleConfig->id)],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'interval_minutes' => ['required', 'integer', 'min:15', 'max:120'],
            'slots_per_interval' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $scheduleConfig->update($validated);

        return redirect()->route('admin.schedule-config.index')
            ->with('success', 'Configuración actualizada exitosamente.');
    }

    /**
     * Remove the specified configuration.
     */
    public function destroy(ScheduleConfig $scheduleConfig)
    {
        $scheduleConfig->delete();

        return redirect()->route('admin.schedule-config.index')
            ->with('success', 'Configuración eliminada exitosamente.');
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(ScheduleConfig $scheduleConfig)
    {
        $scheduleConfig->update(['is_active' => !$scheduleConfig->is_active]);

        $status = $scheduleConfig->is_active ? 'activada' : 'desactivada';
        return back()->with('success', "Configuración {$status} exitosamente.");
    }
}
