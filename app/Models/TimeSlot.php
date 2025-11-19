<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TimeSlot extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'date',
        'time',
        'total_capacity',
        'available_capacity',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'time' => 'datetime:H:i',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the reservations for this time slot.
     */
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    /**
     * Get active reservations for this time slot.
     */
    public function activeReservations()
    {
        return $this->hasMany(Reservation::class)->where('status', 'active');
    }

    /**
     * Check if slot has available capacity.
     */
    public function hasCapacity(int $requestedSlots = 1): bool
    {
        return $this->is_active && $this->available_capacity >= $requestedSlots;
    }

    /**
     * Decrease available capacity.
     */
    public function decreaseCapacity(int $slots = 1): void
    {
        $this->available_capacity = max(0, $this->available_capacity - $slots);
        $this->save();
    }

    /**
     * Increase available capacity.
     */
    public function increaseCapacity(int $slots = 1): void
    {
        $this->available_capacity = min($this->total_capacity, $this->available_capacity + $slots);
        $this->save();
    }
}
