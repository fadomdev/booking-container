<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@reservas.com'],
            [
                'name' => 'Administrador Sistema',
                'rut' => '11111111-1',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        // Create transportista user
        User::firstOrCreate(
            ['email' => 'transportista@reservas.com'],
            [
                'name' => 'Juan Pérez',
                'rut' => '22222222-2',
                'password' => Hash::make('transportista123'),
                'role' => 'transportista',
            ]
        );

        $this->command->info('Usuarios de demostración creados:');
        $this->command->info('Admin - Email: admin@reservas.com, Password: admin123');
        $this->command->info('Transportista - Email: transportista@reservas.com, Password: transportista123');
    }
}
