<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedSlot;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlockedSlotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $blockedSlots = BlockedSlot::orderBy('date', 'desc')
            ->orderBy('start_time')
            ->paginate(20);

        return Inertia::render('admin/blocked-slots/index', [
            'blockedSlots' => $blockedSlots,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/blocked-slots/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'nullable|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:255',
            'is_recurring' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Validación anti-solapamiento
        $overlapping = $this->checkOverlapping($validated);

        if ($overlapping) {
            return back()->withErrors([
                'start_time' => 'Ya existe un bloqueo activo que se solapa con este horario. Por favor, verifica los horarios existentes.',
            ])->withInput();
        }

        BlockedSlot::create($validated);

        return redirect()
            ->route('admin.blocked-slots.index')
            ->with('success', 'Horario bloqueado creado exitosamente');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BlockedSlot $blockedSlot)
    {
        return Inertia::render('admin/blocked-slots/edit', [
            'blockedSlot' => $blockedSlot,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BlockedSlot $blockedSlot)
    {
        $validated = $request->validate([
            'date' => 'nullable|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'reason' => 'required|string|max:255',
            'is_recurring' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Validación anti-solapamiento (excluyendo el registro actual)
        $overlapping = $this->checkOverlapping($validated, $blockedSlot->id);

        if ($overlapping) {
            return back()->withErrors([
                'start_time' => 'Ya existe un bloqueo activo que se solapa con este horario. Por favor, verifica los horarios existentes.',
            ])->withInput();
        }

        $blockedSlot->update($validated);

        return redirect()
            ->route('admin.blocked-slots.index')
            ->with('success', 'Horario bloqueado actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BlockedSlot $blockedSlot)
    {
        $blockedSlot->delete();

        return redirect()
            ->route('admin.blocked-slots.index')
            ->with('success', 'Horario bloqueado eliminado exitosamente');
    }

    /**
     * Toggle active status
     */
    public function toggleActive(BlockedSlot $blockedSlot)
    {
        $blockedSlot->update([
            'is_active' => !$blockedSlot->is_active,
        ]);

        return back()->with('success', 'Estado actualizado exitosamente');
    }

    /**
     * Check if a blocked slot overlaps with existing ones
     */
    private function checkOverlapping(array $data, ?int $excludeId = null): bool
    {
        $query = BlockedSlot::where('is_active', true)
            ->where(function ($q) use ($data) {
                // Filtrar por fecha
                if (!empty($data['date'])) {
                    // Si el nuevo bloqueo tiene fecha específica, buscar:
                    // 1. Bloqueos recurrentes (sin fecha)
                    // 2. Bloqueos de la misma fecha
                    $q->where(function ($subQ) use ($data) {
                        $subQ->whereNull('date')
                            ->orWhere('date', $data['date']);
                    });
                } else {
                    // Si el nuevo bloqueo es recurrente, solo buscar otros recurrentes
                    $q->whereNull('date');
                }
            })
            ->where(function ($q) use ($data) {
                // Verificar solapamiento de horarios usando 3 casos:
                $q->where(function ($subQ) use ($data) {
                    // Caso 1: El nuevo bloqueo empieza durante un bloqueo existente
                    $subQ->where('start_time', '<=', $data['start_time'])
                        ->where('end_time', '>', $data['start_time']);
                })->orWhere(function ($subQ) use ($data) {
                    // Caso 2: El nuevo bloqueo termina durante un bloqueo existente
                    $subQ->where('start_time', '<', $data['end_time'])
                        ->where('end_time', '>=', $data['end_time']);
                })->orWhere(function ($subQ) use ($data) {
                    // Caso 3: El nuevo bloqueo envuelve completamente un bloqueo existente
                    $subQ->where('start_time', '>=', $data['start_time'])
                        ->where('end_time', '<=', $data['end_time']);
                });
            });

        // Excluir el registro actual al editar
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
