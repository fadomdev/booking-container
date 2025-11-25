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
            // Add booking_number column
            $table->string('booking_number')->after('reservation_time');

            // Remove foreign key constraint and booking_id column
            $table->dropForeign(['booking_id']);
            $table->dropColumn('booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            // Re-add booking_id column
            $table->foreignId('booking_id')->nullable()->after('reservation_time')->constrained()->onDelete('set null');

            // Remove booking_number column
            $table->dropColumn('booking_number');
        });
    }
};
