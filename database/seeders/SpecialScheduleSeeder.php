<?php

namespace Database\Seeders;

use App\Models\SpecialSchedule;
use App\Models\User;
use Illuminate\Database\Seeder;

class SpecialScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ejemplo: Horario extendido para el viernes 21 de noviembre de 2025
        $specialSchedule = SpecialSchedule::create([
            'date' => '2025-11-21',
            'start_time' => '08:00',
            'end_time' => '20:00', // Horario extendido hasta las 20:00
            'interval_minutes' => 60,
            'slots_per_interval' => 2,
            'is_active' => true,
            'restricted_access' => true, // Solo transportistas autorizados
            'description' => 'Horario extendido viernes 21 - Solo transportistas autorizados',
        ]);

        // Asignar transportistas autorizados (ejemplo)
        // Obtener usuarios específicos por email o crear lógica personalizada
        $authorizedUsers = User::whereIn('email', [
            'juan@example.com',
            'maria@example.com',
            // Agregar más emails de transportistas autorizados
        ])->get();

        if ($authorizedUsers->isNotEmpty()) {
            $specialSchedule->authorizedUsers()->attach($authorizedUsers->pluck('id'));
        }

        $this->command->info('Horario especial creado para el 2025-11-21 con ' . $authorizedUsers->count() . ' transportistas autorizados.');
    }
}
