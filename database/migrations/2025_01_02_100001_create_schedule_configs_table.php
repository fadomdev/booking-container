<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedule_configs', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nombre de la configuración, ej: "Horario Principal"
            $table->time('start_time'); // Hora de inicio, ej: 08:00
            $table->time('end_time'); // Hora de término, ej: 18:00
            $table->integer('interval_minutes')->default(30); // Intervalo en minutos
            $table->integer('slots_per_interval')->default(2); // Cupos por intervalo
            $table->json('active_days'); // Array de días: [1,2,3,4,5] = Lun-Vie
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_configs');
    }
};
