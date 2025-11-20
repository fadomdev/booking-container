<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SpecialSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'interval_minutes',
        'slots_per_interval',
        'is_active',
        'restricted_access',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_active' => 'boolean',
            'restricted_access' => 'boolean',
        ];
    }

    /**
     * Usuarios autorizados para este horario especial
     */
    public function authorizedUsers()
    {
        return $this->belongsToMany(User::class, 'special_schedule_authorized_users');
    }

    /**
     * Verificar si un usuario está autorizado para este horario
     */
    public function isUserAuthorized(User $user): bool
    {
        // Si no es acceso restringido, todos pueden acceder
        if (!$this->restricted_access) {
            return true;
        }

        // Verificar si el usuario está en la lista de autorizados
        return $this->authorizedUsers()->where('user_id', $user->id)->exists();
    }

    /**
     * Generar slots de tiempo para este horario especial
     */
    public function generateSlots(): array
    {
        if (!$this->is_active) {
            return [];
        }

        $slots = [];
        $startTime = is_string($this->start_time) ? $this->start_time : $this->start_time->format('H:i');
        $endTime = is_string($this->end_time) ? $this->end_time : $this->end_time->format('H:i');

        $currentTime = Carbon::parse($this->date->format('Y-m-d') . ' ' . $startTime);
        $endDateTime = Carbon::parse($this->date->format('Y-m-d') . ' ' . $endTime);

        while ($currentTime->lessThan($endDateTime)) {
            $slots[] = [
                'time' => $currentTime->format('H:i'),
                'total_capacity' => $this->slots_per_interval,
                'special_schedule_id' => $this->id,
                'is_special' => true,
                'restricted' => $this->restricted_access,
            ];
            $currentTime->addMinutes($this->interval_minutes);
        }

        return $slots;
    }

    /**
     * Obtener horario especial para una fecha específica
     */
    public static function getForDate(string $date): ?self
    {
        return self::where('date', $date)
            ->where('is_active', true)
            ->first();
    }
}
