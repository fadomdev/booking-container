<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Display a listing of all reservations.
     */
    public function index(Request $request)
    {
        $query = Reservation::with(['user', 'booking'])
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

        // Get per_page value from request, default to 20, max 100
        $perPage = min((int) $request->get('per_page', 20), 100);

        $reservations = $query->paginate($perPage)->appends($request->except('page'));

        return Inertia::render('admin/reservations/index', [
            'reservations' => $reservations,
            'filters' => $request->only(['status', 'date', 'per_page']),
        ]);
    }
}
