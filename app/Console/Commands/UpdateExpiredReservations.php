<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:update-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualizar reservas caducadas que no fueron completadas';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verificando reservas caducadas...');

        // Buscar reservas activas cuya fecha + hora ya pasaron
        $expiredReservations = Reservation::where('status', 'active')
            ->where(function ($query) {
                // Reservas cuya fecha ya pasó (más de 1 día)
                $query->whereDate('reservation_date', '<', now()->subDay()->toDateString())
                    ->orWhere(function ($q) {
                        // Reservas de hoy pero cuya hora ya pasó (más de 2 horas)
                        $q->whereDate('reservation_date', '=', now()->toDateString())
                            ->where(DB::raw("CONCAT(reservation_date, ' ', reservation_time)"), '<', now()->subHours(2));
                    });
            })
            ->get();

        if ($expiredReservations->isEmpty()) {
            $this->info('No hay reservas caducadas.');
            return 0;
        }

        $count = 0;
        foreach ($expiredReservations as $reservation) {
            $reservation->update([
                'status' => 'expired',
                'cancellation_comment' => 'Reserva caducada automáticamente - No se completó en el horario programado'
            ]);
            $count++;

            $this->line("Reserva #{$reservation->id} marcada como caducada");
        }

        $this->info("✅ {$count} reserva(s) actualizada(s) a estado 'expired'");

        return 0;
    }
}
