<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ScheduleConfigController;
use App\Http\Controllers\Admin\SpecialScheduleController;
use App\Http\Controllers\Admin\BlockedDateController;
use App\Http\Controllers\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\Admin\ReservationStatusController;
use App\Http\Controllers\Admin\BlockedSlotController;

Route::get('/', function () {
    // Redirect to login if not authenticated, otherwise to dashboard
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

// Cron route for updating expired reservations
Route::get('/cron/update-expired-reservations', function () {
    $token = request()->query('token');
    $expectedToken = config('app.cron_token', 'your-secret-token-here');

    if ($token !== $expectedToken) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 401);
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('reservations:update-expired');
        $output = \Illuminate\Support\Facades\Artisan::output();

        return response()->json([
            'success' => true,
            'message' => 'Reservations updated successfully',
            'output' => $output
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error updating reservations',
            'error' => $e->getMessage()
        ], 500);
    }
})->name('cron.update-expired');

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
        Route::post('/validate-containers', [ReservationController::class, 'validateContainers'])->name('validate-containers');
        Route::post('/pre-validate', [ReservationController::class, 'preValidate'])->name('pre-validate');
    });
});

// Admin routes
Route::middleware(['auth', 'verified', App\Http\Middleware\EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', function () {
            return redirect()->route('admin.dashboard');
        });

        Route::get('/dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('dashboard');

        // ---- READ-ONLY routes (admin + consulta) ----

        // User management - read
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
        Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');

        // Company management - read
        Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
        Route::get('/companies/create', [CompanyController::class, 'create'])->name('companies.create');
        Route::get('/companies/{company}', [CompanyController::class, 'show'])->name('companies.show');
        Route::get('/companies/{company}/edit', [CompanyController::class, 'edit'])->name('companies.edit');

        // Schedule configuration - read
        Route::get('/schedule-config', [ScheduleConfigController::class, 'index'])->name('schedule-config.index');
        Route::get('/schedule-config/create', [ScheduleConfigController::class, 'create'])->name('schedule-config.create');
        Route::get('/schedule-config/{scheduleConfig}/edit', [ScheduleConfigController::class, 'edit'])->name('schedule-config.edit');

        // Blocked dates - read
        Route::get('/blocked-dates', [BlockedDateController::class, 'index'])->name('blocked-dates.index');
        Route::get('/blocked-dates/create', [BlockedDateController::class, 'create'])->name('blocked-dates.create');
        Route::get('/blocked-dates/{blockedDate}/edit', [BlockedDateController::class, 'edit'])->name('blocked-dates.edit');

        // Special schedules - read
        Route::get('/special-schedules', [SpecialScheduleController::class, 'index'])->name('special-schedules.index');
        Route::get('/special-schedules/create', [SpecialScheduleController::class, 'create'])->name('special-schedules.create');
        Route::get('/special-schedules/{specialSchedule}/edit', [SpecialScheduleController::class, 'edit'])->name('special-schedules.edit');

        // Blocked slots - read
        Route::get('/blocked-slots', [BlockedSlotController::class, 'index'])->name('blocked-slots.index');
        Route::get('/blocked-slots/create', [BlockedSlotController::class, 'create'])->name('blocked-slots.create');
        Route::get('/blocked-slots/{blockedSlot}/edit', [BlockedSlotController::class, 'edit'])->name('blocked-slots.edit');

        // Reservation management - read
        Route::get('/reservations', [AdminReservationController::class, 'index'])->name('reservations.index');
        Route::get('/reservations/search', [ReservationStatusController::class, 'index'])->name('reservations.search');
        Route::get('/reservations/{reservation}/show', [ReservationStatusController::class, 'show'])->name('reservations.show');

        // ---- WRITE routes (admin only) ----
        Route::middleware([App\Http\Middleware\EnsureUserCanModify::class])->group(function () {

            // User management - write
            Route::post('/users', [UserController::class, 'store'])->name('users.store');
            Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
            Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

            // Company management - write
            Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
            Route::put('/companies/{company}', [CompanyController::class, 'update'])->name('companies.update');
            Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy');
            Route::post('/companies/{company}/toggle-status', [CompanyController::class, 'toggleStatus'])->name('companies.toggle-status');

            // Schedule configuration - write
            Route::post('/schedule-config', [ScheduleConfigController::class, 'store'])->name('schedule-config.store');
            Route::put('/schedule-config/{scheduleConfig}', [ScheduleConfigController::class, 'update'])->name('schedule-config.update');
            Route::delete('/schedule-config/{scheduleConfig}', [ScheduleConfigController::class, 'destroy'])->name('schedule-config.destroy');
            Route::post('/schedule-config/{scheduleConfig}/toggle-status', [ScheduleConfigController::class, 'toggleStatus'])->name('schedule-config.toggle-status');

            // Blocked dates - write
            Route::post('/blocked-dates', [BlockedDateController::class, 'store'])->name('blocked-dates.store');
            Route::put('/blocked-dates/{blockedDate}', [BlockedDateController::class, 'update'])->name('blocked-dates.update');
            Route::delete('/blocked-dates/{blockedDate}', [BlockedDateController::class, 'destroy'])->name('blocked-dates.destroy');
            Route::post('/blocked-dates/{blockedDate}/toggle-status', [BlockedDateController::class, 'toggleStatus'])->name('blocked-dates.toggle-status');

            // Special schedules - write
            Route::post('/special-schedules', [SpecialScheduleController::class, 'store'])->name('special-schedules.store');
            Route::put('/special-schedules/{specialSchedule}', [SpecialScheduleController::class, 'update'])->name('special-schedules.update');
            Route::delete('/special-schedules/{specialSchedule}', [SpecialScheduleController::class, 'destroy'])->name('special-schedules.destroy');
            Route::post('/special-schedules/{specialSchedule}/toggle-status', [SpecialScheduleController::class, 'toggleStatus'])->name('special-schedules.toggle-status');

            // Blocked slots - write
            Route::post('/blocked-slots', [BlockedSlotController::class, 'store'])->name('blocked-slots.store');
            Route::put('/blocked-slots/{blockedSlot}', [BlockedSlotController::class, 'update'])->name('blocked-slots.update');
            Route::delete('/blocked-slots/{blockedSlot}', [BlockedSlotController::class, 'destroy'])->name('blocked-slots.destroy');
            Route::post('/blocked-slots/{blockedSlot}/toggle-active', [BlockedSlotController::class, 'toggleActive'])->name('blocked-slots.toggle-active');

            // Reservation status - write
            Route::post('/reservations/search', [ReservationStatusController::class, 'search'])->name('reservations.search.post');
            Route::post('/reservations/{reservation}/complete', [ReservationStatusController::class, 'markAsCompleted'])->name('reservations.complete');
        });
    });

require __DIR__ . '/settings.php';

// ⚠️ RUTAS DE MANTENIMIENTO - SOLO PARA EMERGENCIAS
// COMENTAR O ELIMINAR DESPUÉS DE USAR EN PRODUCCIÓN
if (config('app.env') !== 'production' || config('app.debug') === true) {
    Route::prefix('maintenance')->name('maintenance.')->group(function () {

        // Limpiar cachés
        Route::get('/clear-cache', function () {
            try {
                \Illuminate\Support\Facades\Artisan::call('config:clear');
                \Illuminate\Support\Facades\Artisan::call('cache:clear');
                \Illuminate\Support\Facades\Artisan::call('route:clear');
                \Illuminate\Support\Facades\Artisan::call('view:clear');
                \Illuminate\Support\Facades\Artisan::call('optimize:clear');

                return response()->json([
                    'success' => true,
                    'message' => 'Todos los cachés han sido limpiados correctamente.',
                    'commands' => [
                        'config:clear' => 'OK',
                        'cache:clear' => 'OK',
                        'route:clear' => 'OK',
                        'view:clear' => 'OK',
                        'optimize:clear' => 'OK',
                    ]
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al limpiar cachés',
                    'error' => $e->getMessage()
                ], 500);
            }
        })->name('clear-cache');

        // Ver estado del sistema
        Route::get('/status', function () {
            $status = [
                'app_name' => config('app.name'),
                'app_env' => config('app.env'),
                'app_debug' => config('app.debug'),
                'php_version' => phpversion(),
                'laravel_version' => app()->version(),
                'database' => [
                    'connection' => config('database.default'),
                    'host' => config('database.connections.' . config('database.default') . '.host'),
                    'database' => config('database.connections.' . config('database.default') . '.database'),
                ],
                'cache_config_exists' => file_exists(base_path('bootstrap/cache/config.php')),
                'cache_routes_exists' => file_exists(base_path('bootstrap/cache/routes.php')),
            ];

            return response()->json($status);
        })->name('status');

        // Ejecutar migraciones
        Route::get('/migrate', function () {
            if (config('app.env') === 'production') {
                return response()->json([
                    'success' => false,
                    'message' => 'Las migraciones en producción deben ejecutarse manualmente por seguridad.'
                ], 403);
            }

            try {
                \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
                $output = \Illuminate\Support\Facades\Artisan::output();

                return response()->json([
                    'success' => true,
                    'message' => 'Migraciones ejecutadas',
                    'output' => $output
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al ejecutar migraciones',
                    'error' => $e->getMessage()
                ], 500);
            }
        })->name('migrate');
    });
}
