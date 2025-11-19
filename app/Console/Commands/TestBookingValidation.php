<?php

namespace App\Console\Commands;

use App\Services\BookingValidationService;
use Illuminate\Console\Command;

class TestBookingValidation extends Command
{
    protected $signature = 'test:booking {booking_number}';
    protected $description = 'Test booking validation with external API';

    public function handle()
    {
        $bookingNumber = $this->argument('booking_number');

        $this->info("Testing booking validation for: {$bookingNumber}");
        $this->info("API URL: " . config('services.booking_api.url'));
        $this->info("API Enabled: " . (config('services.booking_api.enabled') ? 'Yes' : 'No'));
        $this->newLine();

        $service = new BookingValidationService();
        $result = $service->validateBooking($bookingNumber);

        $this->info("Result:");
        $this->line("Valid: " . ($result['valid'] ? 'Yes' : 'No'));
        $this->line("Message: " . $result['message']);

        if ($result['data']) {
            $this->newLine();
            $this->info("Data:");
            $this->line(json_encode($result['data'], JSON_PRETTY_PRINT));
        }

        return 0;
    }
}
