<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class BlockedDate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'date',
        'reason',
        'type',
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
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if a specific date is blocked.
     *
     * @param string $date Date in Y-m-d format
     * @return bool
     */
    public static function isDateBlocked(string $date): bool
    {
        return self::where('date', $date)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Get blocked date for a specific date if exists.
     *
     * @param string $date
     * @return BlockedDate|null
     */
    public static function getBlockedDate(string $date): ?BlockedDate
    {
        return self::where('date', $date)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get type label in Spanish.
     *
     * @return string
     */
    public function getTypeLabel(): string
    {
        return match ($this->type) {
            'holiday' => 'Día Festivo',
            'maintenance' => 'Mantenimiento',
            'other' => 'Otro',
            default => 'Otro',
        };
    }
}
