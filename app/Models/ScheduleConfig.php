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
     * When blocked slots are provided, the method will:
     * 1. Generate slots until hitting a blocked period
     * 2. Skip to the end of the blocked period
     * 3. Resume generating slots from the block's end time
     *
     * @param string $date Date in Y-m-d format
     * @param \Illuminate\Support\Collection|null $blockedSlots Collection of BlockedSlot models
     * @return array Array of time slots
     */
    public function generateSlotsForDate(string $date, $blockedSlots = null): array
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

        // Sort blocked slots by start_time if provided
        $sortedBlocks = $blockedSlots ? $blockedSlots->sortBy('start_time')->values() : collect();

        while ($currentTime->lessThan($endDateTime)) {
            $currentTimeStr = $currentTime->format('H:i');

            // Check if current time falls within any blocked period
            $activeBlock = null;
            foreach ($sortedBlocks as $block) {
                $blockStart = substr($block->start_time, 0, 5);
                $blockEnd = substr($block->end_time, 0, 5);

                // If current time is within the blocked range
                if ($currentTimeStr >= $blockStart && $currentTimeStr < $blockEnd) {
                    $activeBlock = $block;
                    break;
                }
            }

            if ($activeBlock) {
                // Jump to the end of the blocked period and restart slot generation from there
                $blockEnd = substr($activeBlock->end_time, 0, 5);
                $currentTime = Carbon::parse($date . ' ' . $blockEnd);
                continue;
            }

            $slots[] = [
                'time' => $currentTimeStr,
                'total_capacity' => $this->slots_per_interval,
                'config_id' => $this->id,
            ];
            $currentTime->addMinutes($this->interval_minutes);
        }

        return $slots;
    }
}
