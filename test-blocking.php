<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BlockedSlot;

echo "=== Test de Bloqueo de Horarios ===" . PHP_EOL . PHP_EOL;

$block = BlockedSlot::where('start_time', 'like', '15:%')->first();

if (!$block) {
    echo "No se encontró bloqueo de 15:00" . PHP_EOL;
    exit;
}

echo "Bloqueo encontrado:" . PHP_EOL;
echo "  Inicio: {$block->start_time}" . PHP_EOL;
echo "  Fin: {$block->end_time}" . PHP_EOL;
echo "  Inicio (H:i): " . substr($block->start_time, 0, 5) . PHP_EOL;
echo "  Fin (H:i): " . substr($block->end_time, 0, 5) . PHP_EOL;
echo PHP_EOL;

$testTimes = ['14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

echo "Pruebas de bloqueo:" . PHP_EOL;
foreach ($testTimes as $time) {
    $isBlocked = $block->blocksTime($time);
    $status = $isBlocked ? '❌ BLOQUEADO' : '✅ DISPONIBLE';
    echo "  {$time}: {$status}" . PHP_EOL;
}
