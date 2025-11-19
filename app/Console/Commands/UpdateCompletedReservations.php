<?php

namespace App\Console\Commands;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdateCompletedReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:update-completed';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update active reservations to completed when their date and time have passed';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $driver = config('database.default');

        // Find all active reservations where the date/time has passed
        $reservations = Reservation::where('status', 'active')
            ->where(function ($query) use ($now, $driver) {
                // Reservations with past date
                $query->where('reservation_date', '<', $now->format('Y-m-d'))
                    // OR reservations today with past time
                    ->orWhere(function ($q) use ($now, $driver) {
                        $q->where('reservation_date', '=', $now->format('Y-m-d'));

                        if ($driver === 'sqlite') {
                            // SQLite uses strftime
                            $q->whereRaw("strftime('%H:%M', reservation_time) < ?", [$now->format('H:i')]);
                        } else {
                            // MySQL TIME field stores HH:MM:SS, compare with seconds
                            $q->whereTime('reservation_time', '<', $now->format('H:i:s'));
                        }
                    });
            })
            ->get();

        $count = $reservations->count();

        if ($count === 0) {
            $this->info('No reservations to update.');
            return 0;
        }

        // Update each reservation to completed
        foreach ($reservations as $reservation) {
            $reservation->update(['status' => 'completed']);
        }

        $this->info("Updated {$count} reservation(s) to completed status.");
        return 0;
    }
}
