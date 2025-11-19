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
        // Primero modificar tabla reservations para eliminar dependencia de time_slots
        Schema::table('reservations', function (Blueprint $table) {
            // Primero eliminar foreign key
            $table->dropForeign(['time_slot_id']);

            // Luego eliminar índice compuesto si existe
            $table->dropIndex(['time_slot_id', 'status']);

            // Eliminar columna
            $table->dropColumn('time_slot_id');

            // Agregar campos directos
            $table->date('reservation_date')->after('user_id');
            $table->time('reservation_time')->after('reservation_date');

            $table->index(['reservation_date', 'reservation_time', 'status']);
        });

        // Ahora sí eliminar la tabla time_slots (ya no tiene foreign keys)
        Schema::dropIfExists('time_slots');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('time');
            $table->integer('total_capacity')->default(2);
            $table->integer('available_capacity')->default(2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['date', 'time']);
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['reservation_date', 'reservation_time']);
            $table->foreignId('time_slot_id')->after('user_id')->constrained()->onDelete('cascade');
        });
    }
};
