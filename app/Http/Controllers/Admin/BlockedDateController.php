<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlockedDateController extends Controller
{
    /**
     * Display a listing of blocked dates.
     */
    public function index(Request $request)
    {
        $query = BlockedDate::orderBy('date', 'desc');

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $blockedDates = $query->paginate(20);

        return Inertia::render('admin/blocked-dates/index', [
            'blockedDates' => $blockedDates,
            'filters' => $request->only(['type']),
        ]);
    }

    /**
     * Show the form for creating a new blocked date.
     */
    public function create()
    {
        return Inertia::render('admin/blocked-dates/create');
    }

    /**
     * Store a newly created blocked date.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => ['required', 'date', 'after_or_equal:today'],
            'reason' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:holiday,maintenance,other'],
        ]);

        // Check if date is already blocked
        $existing = BlockedDate::where('date', $validated['date'])
            ->where('is_active', true)
            ->first();

        if ($existing) {
            return back()->withErrors(['date' => 'Esta fecha ya está bloqueada.']);
        }

        BlockedDate::create($validated);

        return redirect()->route('admin.blocked-dates.index')
            ->with('success', 'Fecha bloqueada agregada exitosamente.');
    }

    /**
     * Show the form for editing the specified blocked date.
     */
    public function edit(BlockedDate $blockedDate)
    {
        return Inertia::render('admin/blocked-dates/edit', [
            'blockedDate' => $blockedDate,
        ]);
    }

    /**
     * Update the specified blocked date.
     */
    public function update(Request $request, BlockedDate $blockedDate)
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'reason' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:holiday,maintenance,other'],
        ]);

        $blockedDate->update($validated);

        return redirect()->route('admin.blocked-dates.index')
            ->with('success', 'Fecha bloqueada actualizada exitosamente.');
    }

    /**
     * Remove the specified blocked date.
     */
    public function destroy(BlockedDate $blockedDate)
    {
        $blockedDate->delete();

        return redirect()->route('admin.blocked-dates.index')
            ->with('success', 'Fecha bloqueada eliminada exitosamente.');
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(BlockedDate $blockedDate)
    {
        $blockedDate->update(['is_active' => !$blockedDate->is_active]);

        $status = $blockedDate->is_active ? 'activada' : 'desactivada';
        return back()->with('success', "Bloqueo {$status} exitosamente.");
    }
}
