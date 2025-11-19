<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class ScheduleConfig extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'day_of_week',
        'start_time',
        'end_time',
        'interval_minutes',
        'slots_per_interval',
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
            'day_of_week' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Generate time slots for a specific date based on this configuration.
     * This configuration applies only if the date's day_of_week matches.
     *
     * @param string $date Date in Y-m-d format
     * @return array Array of time slots
     */
    public function generateSlotsForDate(string $date): array
    {
        $dateObj = Carbon::parse($date);
        $dayOfWeek = $dateObj->dayOfWeek; // 0 = Sunday, 1 = Monday, etc.

        // Check if this configuration is for the requested day
        if ($this->day_of_week !== $dayOfWeek) {
            return [];
        }

        // If not active, return empty
        if (!$this->is_active) {
            return [];
        }

        $slots = [];
        // Ensure start_time and end_time are in H:i format (strings)
        $startTime = is_string($this->start_time) ? $this->start_time : $this->start_time->format('H:i');
        $endTime = is_string($this->end_time) ? $this->end_time : $this->end_time->format('H:i');

        $currentTime = Carbon::parse($date . ' ' . $startTime);
        $endDateTime = Carbon::parse($date . ' ' . $endTime);

        while ($currentTime->lessThan($endDateTime)) {
            $slots[] = [
                'time' => $currentTime->format('H:i'),
                'total_capacity' => $this->slots_per_interval,
                'config_id' => $this->id,
            ];
            $currentTime->addMinutes($this->interval_minutes);
        }

        return $slots;
    }

    /**
     * Get the Spanish name for this day of week.
     *
     * @return string
     */
    public function getDayName(): string
    {
        $dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return $dayNames[$this->day_of_week] ?? '';
    }

    /**
     * Get configuration for a specific day of week.
     *
     * @param int $dayOfWeek 0=Sunday, 1=Monday, etc.
     * @return ScheduleConfig|null
     */
    public static function getForDay(int $dayOfWeek): ?ScheduleConfig
    {
        return self::where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();
    }
}
