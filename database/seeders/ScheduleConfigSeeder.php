<?php

namespace Database\Seeders;

use App\Models\ScheduleConfig;
use Illuminate\Database\Seeder;

class ScheduleConfigSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Configuración para Lunes a Viernes (días 1-5)
        for ($day = 1; $day <= 5; $day++) {
            ScheduleConfig::updateOrCreate(
                ['day_of_week' => $day],
                [
                    'start_time' => '08:00',
                    'end_time' => '17:00',
                    'interval_minutes' => 30,
                    'slots_per_interval' => 2,
                    'is_active' => true,
                ]
            );
        }

        // Configuración para Sábado (día 6)
        ScheduleConfig::updateOrCreate(
            ['day_of_week' => 6],
            [
                'start_time' => '09:00',
                'end_time' => '13:00',
                'interval_minutes' => 30,
                'slots_per_interval' => 1,
                'is_active' => true,
            ]
        );

        // Domingo desactivado (día 0)
        ScheduleConfig::updateOrCreate(
            ['day_of_week' => 0],
            [
                'start_time' => '00:00',
                'end_time' => '00:00',
                'interval_minutes' => 30,
                'slots_per_interval' => 0,
                'is_active' => false,
            ]
        );
    }
}
