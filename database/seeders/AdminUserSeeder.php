<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@reservas.com',
            'password' => Hash::make('admin123'),
            'rut' => '11111111-1',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Usuario administrador creado:');
        $this->command->info('   Email: admin@reservas.com');
        $this->command->info('   Password: admin123');
    }
}
