<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule the reservation update command to run every hour
Schedule::command('reservations:update-completed')->hourly();

// Schedule the expired reservations update to run every 6 hours
Schedule::command('reservations:update-expired')->everySixHours();
