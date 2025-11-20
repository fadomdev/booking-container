<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\SpecialSchedule;
use App\Models\User;

// Crear horario especial para viernes 21
$schedule = SpecialSchedule::create([
    'date' => '2025-11-21',
    'start_time' => '08:00',
    'end_time' => '20:00',
    'interval_minutes' => 60,
    'slots_per_interval' => 2,
    'is_active' => true,
    'restricted_access' => true,
    'description' => 'Horario extendido viernes 21 - Solo transportistas autorizados'
]);

echo "✅ Horario especial creado (ID: {$schedule->id})\n";
echo "   Fecha: {$schedule->date->format('d/m/Y')}\n";
echo "   Horario: {$schedule->start_time} - {$schedule->end_time}\n";
echo "   Acceso restringido: " . ($schedule->restricted_access ? 'Sí' : 'No') . "\n\n";

// Obtener tu usuario actual (asumiendo que eres el primer usuario)
$user = User::first();
if ($user) {
    $schedule->authorizedUsers()->attach($user->id);
    echo "✅ Usuario autorizado: {$user->name} ({$user->email})\n\n";
}

echo "📋 Para autorizar más usuarios, ejecuta:\n";
echo "   php artisan tinker\n";
echo "   \$schedule = \\App\\Models\\SpecialSchedule::find({$schedule->id});\n";
echo "   \$user = \\App\\Models\\User::where('email', 'email@example.com')->first();\n";
echo "   \$schedule->authorizedUsers()->attach(\$user->id);\n";
