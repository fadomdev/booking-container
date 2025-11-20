<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "🔧 Creando usuarios...\n\n";

// 1. Usuario Admin
$admin = User::create([
    'name' => 'Administrador',
    'email' => 'admin@hillebrand.com',
    'password' => Hash::make('admin123'),
    'role' => 'admin',
    'rut' => '12345678-9',
    'email_verified_at' => now(),
]);
echo "✅ Admin creado:\n";
echo "   Email: {$admin->email}\n";
echo "   Password: admin123\n";
echo "   Rol: {$admin->role}\n\n";

// 2. Transportista 1
$transportista1 = User::create([
    'name' => 'Juan Pérez Salazar',
    'email' => 'juan.perez@transporte.com',
    'password' => Hash::make('trans123'),
    'role' => 'user',
    'rut' => '16789012-3',
    'email_verified_at' => now(),
]);
echo "✅ Transportista 1 creado:\n";
echo "   Nombre: {$transportista1->name}\n";
echo "   Email: {$transportista1->email}\n";
echo "   Password: trans123\n";
echo "   Rol: {$transportista1->role}\n\n";

// 3. Transportista 2
$transportista2 = User::create([
    'name' => 'María González López',
    'email' => 'maria.gonzalez@transporte.com',
    'password' => Hash::make('trans123'),
    'role' => 'user',
    'rut' => '17890123-4',
    'email_verified_at' => now(),
]);
echo "✅ Transportista 2 creado:\n";
echo "   Nombre: {$transportista2->name}\n";
echo "   Email: {$transportista2->email}\n";
echo "   Password: trans123\n";
echo "   Rol: {$transportista2->role}\n\n";

// Autorizar transportistas para el horario especial del viernes 21
$specialSchedule = \App\Models\SpecialSchedule::find(1);
if ($specialSchedule) {
    $specialSchedule->authorizedUsers()->attach([
        $transportista1->id,
        $transportista2->id
    ]);

    echo "🔐 Transportistas autorizados para horario especial viernes 21:\n";
    echo "   ✓ {$transportista1->name}\n";
    echo "   ✓ {$transportista2->name}\n\n";
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "📋 RESUMEN DE USUARIOS CREADOS\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

echo "👤 ADMIN:\n";
echo "   Email: admin@hillebrand.com\n";
echo "   Pass:  admin123\n\n";

echo "🚛 TRANSPORTISTA 1:\n";
echo "   Email: juan.perez@transporte.com\n";
echo "   Pass:  trans123\n";
echo "   ✓ Autorizado para viernes 21 (08:00-20:00)\n\n";

echo "🚛 TRANSPORTISTA 2:\n";
echo "   Email: maria.gonzalez@transporte.com\n";
echo "   Pass:  trans123\n";
echo "   ✓ Autorizado para viernes 21 (08:00-20:00)\n\n";

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
