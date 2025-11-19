<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'reservation_date',
        'reservation_time',
        'booking_id',
        'transportista_name',
        'truck_plate',
        'slots_reserved',
        'container_numbers',
        'api_notes',
        'status',
        'cancelled_at',
        'cancellation_comment',
        'cancelled_by',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reservation_date' => 'date',
            'cancelled_at' => 'datetime',
            'container_numbers' => 'array',
        ];
    }

    /**
     * Get the user that owns the reservation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the booking associated with this reservation.
     */
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Get the user who cancelled the reservation.
     */
    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    /**
     * Check if reservation is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Cancel the reservation.
     */
    public function cancel(?string $comment = null, ?int $cancelledBy = null): void
    {
        $this->status = 'cancelled';
        $this->cancelled_at = now();
        $this->cancellation_comment = $comment;
        $this->cancelled_by = $cancelledBy;
        $this->save();
    }

    /**
     * Validate container number format.
     * Format: 4 letters + 7 digits (e.g., ABCD1234567)
     */
    public static function validateContainerNumber(string $containerNumber): bool
    {
        // Remove spaces and convert to uppercase
        $containerNumber = strtoupper(str_replace(' ', '', $containerNumber));

        // Check format: 4 letters + 7 digits
        return preg_match('/^[A-Z]{4}\d{7}$/', $containerNumber) === 1;
    }

    /**
     * Get available capacity for a specific date/time slot.
     *
     * @param string $date
     * @param string $time
     * @param int $configCapacity
     * @return int
     */
    public static function getAvailableCapacity(string $date, string $time, int $configCapacity): int
    {
        // Ensure time is in H:i format (e.g., "09:00")
        $time = substr($time, 0, 5);

        // Add :00 seconds to match TIME format in database (HH:MM:SS)
        $timeWithSeconds = $time . ':00';

        // Use different SQL based on database driver
        $driver = config('database.default');
        $query = self::whereDate('reservation_date', $date)->where('status', 'active');

        if ($driver === 'sqlite') {
            // SQLite uses strftime
            $query->whereRaw("strftime('%H:%M', reservation_time) = ?", [$time]);
        } else {
            // MySQL TIME field stores HH:MM:SS, so we need to compare with seconds
            $query->whereTime('reservation_time', $timeWithSeconds);
        }

        $reservedSlots = $query->sum('slots_reserved');

        return max(0, $configCapacity - $reservedSlots);
    }
}
