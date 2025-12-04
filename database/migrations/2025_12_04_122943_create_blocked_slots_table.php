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
        Schema::create('blocked_slots', function (Blueprint $table) {
            $table->id();
            $table->date('date')->nullable()->comment('Si es null, aplica todos los días');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('reason')->comment('Motivo del bloqueo: Colación, Mantenimiento, etc.');
            $table->boolean('is_recurring')->default(false)->comment('Si el bloqueo se repite diariamente');
            $table->boolean('is_active')->default(true)->comment('Permite desactivar sin eliminar');
            $table->timestamps();

            // Índices para mejorar performance
            $table->index('date');
            $table->index(['start_time', 'end_time']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blocked_slots');
    }
};
