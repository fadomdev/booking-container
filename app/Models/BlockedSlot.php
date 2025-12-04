<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlockedSlot extends Model
{
    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'reason',
        'is_recurring',
        'is_active',
    ];

    protected $casts = [
        'date' => 'date',
        'is_recurring' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Scope para obtener solo bloqueos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para obtener bloqueos que aplican a una fecha específica
     */
    public function scopeForDate($query, $date)
    {
        return $query->where(function ($q) use ($date) {
            $q->whereNull('date') // Bloqueos recurrentes (todos los días)
                ->orWhere('date', $date); // Bloqueos de ese día específico
        });
    }

    /**
     * Verifica si un horario específico está bloqueado
     * Un slot está bloqueado si empieza dentro del rango de bloqueo
     * Ejemplo: Bloqueo 13:00-14:00 bloqueará slots 13:00 y 13:30
     */
    public function blocksTime($time): bool
    {
        // Normalizar todos los tiempos a formato H:i (sin segundos) para comparación correcta
        // MySQL devuelve TIME como HH:MM:SS, pero los slots vienen como HH:MM
        $slotTime = substr($time, 0, 5); // "15:00" de "15:00" o "15:00:00"
        $startTime = substr($this->start_time, 0, 5); // "15:00" de "15:00:00"
        $endTime = substr($this->end_time, 0, 5); // "17:00" de "17:00:00"

        // Un tiempo está bloqueado si es >= start_time Y < end_time
        // Ejemplo: Bloqueo 15:00-17:00 bloquea 15:00, 15:30, 16:00, 16:30
        // pero NO bloquea 17:00 (porque 17:00 < 17:00 es falso)
        return $slotTime >= $startTime && $slotTime < $endTime;
    }

    /**
     * Obtener bloqueos que aplican a una fecha y están activos
     */
    public static function getActiveBlocksForDate($date)
    {
        return self::active()
            ->forDate($date)
            ->orderBy('start_time')
            ->get();
    }
}
