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
            return redirect()->route('admin.dashboard');
        });

        Route::get('/dashboard', function () {
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

        // Special schedules management
        Route::prefix('special-schedules')->name('special-schedules.')->group(function () {
            Route::get('/', [SpecialScheduleController::class, 'index'])->name('index');
            Route::get('/create', [SpecialScheduleController::class, 'create'])->name('create');
            Route::post('/', [SpecialScheduleController::class, 'store'])->name('store');
            Route::get('/{specialSchedule}/edit', [SpecialScheduleController::class, 'edit'])->name('edit');
            Route::put('/{specialSchedule}', [SpecialScheduleController::class, 'update'])->name('update');
            Route::delete('/{specialSchedule}', [SpecialScheduleController::class, 'destroy'])->name('destroy');
            Route::post('/{specialSchedule}/toggle-status', [SpecialScheduleController::class, 'toggleStatus'])->name('toggle-status');
        });

        // Blocked slots management
        Route::prefix('blocked-slots')->name('blocked-slots.')->group(function () {
            Route::get('/', [BlockedSlotController::class, 'index'])->name('index');
            Route::get('/create', [BlockedSlotController::class, 'create'])->name('create');
            Route::post('/', [BlockedSlotController::class, 'store'])->name('store');
            Route::get('/{blockedSlot}/edit', [BlockedSlotController::class, 'edit'])->name('edit');
            Route::put('/{blockedSlot}', [BlockedSlotController::class, 'update'])->name('update');
            Route::delete('/{blockedSlot}', [BlockedSlotController::class, 'destroy'])->name('destroy');
            Route::post('/{blockedSlot}/toggle-active', [BlockedSlotController::class, 'toggleActive'])->name('toggle-active');
        });

        // Reservation management
        Route::get('/reservations', [AdminReservationController::class, 'index'])->name('reservations.index');

        // Reservation status management (marcar como completadas)
        Route::prefix('reservations')->name('reservations.')->group(function () {
            Route::get('/search', [ReservationStatusController::class, 'index'])->name('search');
            Route::post('/search', [ReservationStatusController::class, 'search']);
            Route::get('/{reservation}/show', [ReservationStatusController::class, 'show'])->name('show');
            Route::post('/{reservation}/complete', [ReservationStatusController::class, 'markAsCompleted'])->name('complete');
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
