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
        Schema::table('reservations', function (Blueprint $table) {
            // Agregar campos para tracking de completado
            $table->timestamp('completed_at')->nullable()->after('updated_at');
            $table->foreignId('completed_by')->nullable()->constrained('users')->after('completed_at');
        });

        // Actualizar el enum de status para incluir 'completed' y 'expired'
        // Mantiene 'active' como status por defecto para compatibilidad
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('active', 'cancelled', 'completed', 'expired') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['completed_by']);
            $table->dropColumn(['completed_at', 'completed_by']);
        });

        // Revertir el enum de status
        DB::statement("ALTER TABLE reservations MODIFY COLUMN status ENUM('active', 'cancelled') NOT NULL DEFAULT 'active'");
    }
};
