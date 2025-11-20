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
        Schema::create('special_schedules', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique()->comment('Fecha específica para horario especial');
            $table->time('start_time')->comment('Hora de inicio (ej: 08:00)');
            $table->time('end_time')->comment('Hora de fin (ej: 20:00)');
            $table->integer('interval_minutes')->default(60)->comment('Intervalo entre slots en minutos');
            $table->integer('slots_per_interval')->default(2)->comment('Cupos disponibles por slot');
            $table->boolean('is_active')->default(true);
            $table->boolean('restricted_access')->default(false)->comment('Si es true, solo transportistas autorizados pueden reservar');
            $table->text('description')->nullable()->comment('Descripción del horario especial');
            $table->timestamps();
        });

        Schema::create('special_schedule_authorized_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('special_schedule_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['special_schedule_id', 'user_id'], 'special_schedule_user_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('special_schedule_authorized_users');
        Schema::dropIfExists('special_schedules');
    }
};
