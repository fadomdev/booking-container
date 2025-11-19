<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ScheduleConfigController;
use App\Http\Controllers\Admin\BlockedDateController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Admin\CompanyController;

Route::get('/', function () {
    // Redirect to login if not authenticated, otherwise to dashboard
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();

        // Get active reservations count (confirmed reservations with future or today's date)
        $activeReservationsCount = \App\Models\Reservation::where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->whereDate('reservation_date', '>=', now()->toDateString())
            ->count();

        return Inertia::render('dashboard', [
            'activeReservationsCount' => $activeReservationsCount,
        ]);
    })->name('dashboard');

    // Reservations for all authenticated users
    Route::prefix('reservations')->name('reservations.')->group(function () {
        Route::get('/', [ReservationController::class, 'create'])->name('create');
        Route::post('/', [ReservationController::class, 'store'])->name('store');
        Route::get('/my-reservations', [ReservationController::class, 'myReservations'])->name('my-reservations');
        Route::post('/{reservation}/cancel', [ReservationController::class, 'cancel'])->name('cancel');
        Route::post('/validate-booking', [ReservationController::class, 'validateBooking'])->name('validate-booking');
        Route::post('/send-containers', [ReservationController::class, 'sendContainersToApi'])->name('send-containers');
    });
});

// Admin routes
Route::middleware(['auth', 'verified', App\Http\Middleware\EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', function () {
            return Inertia::render('admin/dashboard');
        })->name('dashboard');

        // User management
        Route::resource('users', UserController::class);

        // Company management
        Route::resource('companies', CompanyController::class);
        Route::post('/companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->name('companies.toggle-status');

        // Schedule configuration management
        Route::prefix('schedule-config')->name('schedule-config.')->group(function () {
            Route::get('/', [ScheduleConfigController::class, 'index'])->name('index');
            Route::get('/create', [ScheduleConfigController::class, 'create'])->name('create');
            Route::post('/', [ScheduleConfigController::class, 'store'])->name('store');
            Route::get('/{scheduleConfig}/edit', [ScheduleConfigController::class, 'edit'])->name('edit');
            Route::put('/{scheduleConfig}', [ScheduleConfigController::class, 'update'])->name('update');
            Route::delete('/{scheduleConfig}', [ScheduleConfigController::class, 'destroy'])->name('destroy');
            Route::post('/{scheduleConfig}/toggle-status', [ScheduleConfigController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Blocked dates management
        Route::prefix('blocked-dates')->name('blocked-dates.')->group(function () {
            Route::get('/', [BlockedDateController::class, 'index'])->name('index');
            Route::get('/create', [BlockedDateController::class, 'create'])->name('create');
            Route::post('/', [BlockedDateController::class, 'store'])->name('store');
            Route::get('/{blockedDate}/edit', [BlockedDateController::class, 'edit'])->name('edit');
            Route::put('/{blockedDate}', [BlockedDateController::class, 'update'])->name('update');
            Route::delete('/{blockedDate}', [BlockedDateController::class, 'destroy'])->name('destroy');
            Route::post('/{blockedDate}/toggle-status', [BlockedDateController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Reservation management
        Route::get('/reservations', [AdminReservationController::class, 'index'])->name('reservations.index');
    });

require __DIR__ . '/settings.php';
