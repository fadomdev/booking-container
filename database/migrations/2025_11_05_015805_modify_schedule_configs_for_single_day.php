<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Eliminar datos existentes
        DB::table('schedule_configs')->truncate();

        Schema::table('schedule_configs', function (Blueprint $table) {
            // Eliminar campos que ya no se necesitan
            $table->dropColumn(['name', 'active_days']);

            // Agregar campo day_of_week (0=Domingo, 1=Lunes, ..., 6=Sábado)
            $table->integer('day_of_week')->after('id')->comment('0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado');

            // Hacer que day_of_week sea único
            $table->unique('day_of_week');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedule_configs', function (Blueprint $table) {
            $table->dropUnique(['day_of_week']);
            $table->dropColumn('day_of_week');
            $table->string('name')->after('id');
            $table->json('active_days')->after('slots_per_interval');
        });
    }
};
