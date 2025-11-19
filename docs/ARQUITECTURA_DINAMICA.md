# Arquitectura de Horarios Dinámicos

## Descripción General

El sistema utiliza un enfoque de **generación dinámica de slots** en lugar de almacenar registros individuales de horarios. Esto permite:

- ✅ Configuraciones reutilizables
- ✅ Fácil gestión de horarios
- ✅ Menor carga en base de datos
- ✅ Flexibilidad para cambios futuros

## Componentes Principales

### 1. ScheduleConfig (Configuración de Horarios)

Tabla: `schedule_configs`

**Campos:**

- `name`: Nombre descriptivo de la configuración
- `start_time`: Hora de inicio (ej. 08:00)
- `end_time`: Hora de término (ej. 17:00)
- `interval_minutes`: Intervalo entre slots (15, 30, 60, 120 minutos)
- `slots_per_interval`: Cupos disponibles por cada slot
- `active_days`: Array JSON con días activos (0=Domingo, 1=Lunes...6=Sábado)
- `is_active`: Estado activo/inactivo

**Ejemplo:**

```json
{
    "name": "Horario Regular Lunes a Viernes",
    "start_time": "08:00",
    "end_time": "17:00",
    "interval_minutes": 30,
    "slots_per_interval": 2,
    "active_days": [1, 2, 3, 4, 5],
    "is_active": true
}
```

Esta configuración genera automáticamente slots de 8:00 a 17:00 cada 30 minutos, con 2 cupos cada uno, solo de lunes a viernes.

**Método clave: `generateSlotsForDate()`**

```php
public function generateSlotsForDate(string $date): array
{
    $dateObj = Carbon::parse($date);
    $dayOfWeek = $dateObj->dayOfWeek; // 0=Domingo, 1=Lunes...

    // Verificar si el día está activo en esta configuración
    if (!in_array($dayOfWeek, $this->active_days)) {
        return [];
    }

    $slots = [];
    $currentTime = Carbon::parse($date . ' ' . $this->start_time);
    $endTime = Carbon::parse($date . ' ' . $this->end_time);

    while ($currentTime->lessThan($endTime)) {
        $slots[] = [
            'time' => $currentTime->format('H:i'),
            'total_capacity' => $this->slots_per_interval,
            'config_id' => $this->id,
        ];
        $currentTime->addMinutes($this->interval_minutes);
    }

    return $slots;
}
```

### 2. BlockedDate (Fechas Bloqueadas)

Tabla: `blocked_dates`

**Campos:**

- `date`: Fecha a bloquear (YYYY-MM-DD)
- `reason`: Razón del bloqueo (ej. "Feriado Nacional", "Mantención")
- `type`: Tipo de bloqueo ('holiday', 'maintenance', 'other')
- `is_active`: Estado activo/inactivo

**Función:** Anular cualquier configuración de horario para fechas específicas.

**Método clave: `isDateBlocked()`**

```php
public static function isDateBlocked(string $date): bool
{
    return self::where('date', $date)
        ->where('is_active', true)
        ->exists();
}
```

### 3. Reservation (Reservas)

Tabla: `reservations`

**Cambios arquitectónicos:**

- ❌ **ELIMINADO**: `time_slot_id` (foreign key a time_slots)
- ✅ **AGREGADO**: `reservation_date` (fecha de la reserva)
- ✅ **AGREGADO**: `reservation_time` (hora de la reserva)

**Ventajas:**

- Desnormalización intencional para simplificar queries
- No depende de registros de time_slots
- Mayor flexibilidad al cambiar configuraciones

**Método clave: `getAvailableCapacity()`**

```php
public static function getAvailableCapacity(
    string $date,
    string $time,
    int $configCapacity
): int {
    $reservedCount = self::where('reservation_date', $date)
        ->where('reservation_time', $time)
        ->where('status', 'active')
        ->count();

    return max(0, $configCapacity - $reservedCount);
}
```

## Flujo de Reserva

### 1. Usuario solicita horarios disponibles para una fecha

```php
// ReservationController@create
public function create(Request $request)
{
    $selectedDate = $request->input('date', now()->format('Y-m-d'));

    // Verificar si la fecha está bloqueada
    if (BlockedDate::isDateBlocked($selectedDate)) {
        return Inertia::render('reservations/create', [
            'timeSlots' => [],
            'selectedDate' => $selectedDate,
            'dateBlocked' => true,
        ]);
    }

    $slots = $this->getAvailableTimeSlots($selectedDate);

    return Inertia::render('reservations/create', [
        'timeSlots' => $slots,
        'selectedDate' => $selectedDate,
    ]);
}
```

### 2. Sistema genera slots dinámicamente

```php
private function getAvailableTimeSlots(string $date): array
{
    // Obtener todas las configuraciones activas
    $configs = ScheduleConfig::where('is_active', true)->get();

    $allSlots = [];

    foreach ($configs as $config) {
        // Cada configuración genera sus slots
        $slots = $config->generateSlotsForDate($date);

        foreach ($slots as $slot) {
            // Calcular capacidad disponible
            $availableCapacity = Reservation::getAvailableCapacity(
                $date,
                $slot['time'],
                $slot['total_capacity']
            );

            if ($availableCapacity > 0) {
                $allSlots[] = [
                    'time' => $slot['time'],
                    'total_capacity' => $slot['total_capacity'],
                    'available_capacity' => $availableCapacity,
                    'config_id' => $slot['config_id'],
                ];
            }
        }
    }

    // Ordenar por hora
    usort($allSlots, fn($a, $b) => strcmp($a['time'], $b['time']));

    return $allSlots;
}
```

### 3. Usuario hace reserva

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'reservation_date' => 'required|date|after_or_equal:today',
        'reservation_time' => 'required',
        'transporter_name' => 'required|string',
        'truck_plate' => 'required|string',
        'booking_number' => 'required|string',
    ]);

    // Verificar que la fecha no esté bloqueada
    if (BlockedDate::isDateBlocked($validated['reservation_date'])) {
        return back()->with('error', 'Fecha no disponible');
    }

    // Verificar capacidad disponible
    // ... validación de booking, etc.

    Reservation::create([
        'user_id' => auth()->id(),
        'reservation_date' => $validated['reservation_date'],
        'reservation_time' => $validated['reservation_time'],
        // ... otros campos
    ]);
}
```

## Ventajas del Sistema Dinámico

### ✅ Rendimiento

- No genera miles de registros en time_slots
- Generación bajo demanda solo cuando se necesita
- Menor uso de espacio en base de datos

### ✅ Flexibilidad

- Cambiar horarios sin regenerar datos
- Activar/desactivar configuraciones fácilmente
- Múltiples configuraciones pueden coexistir

### ✅ Mantenimiento

- Fácil agregar nuevos horarios
- Bloquear fechas sin afectar configuraciones
- Gestión centralizada de capacidades

### ✅ Escalabilidad

- Soporta configuraciones complejas
- Fácil agregar reglas de negocio
- Adaptable a cambios futuros

## Casos de Uso

### Caso 1: Horario Regular

```
Configuración:
- Lunes a Viernes: 8:00 - 17:00
- Intervalos: 30 minutos
- Cupos: 2 por slot

Resultado:
08:00 (2 cupos), 08:30 (2 cupos), 09:00 (2 cupos)...
Solo en días laborables
```

### Caso 2: Horario Especial Sábados

```
Configuración adicional:
- Sábados: 9:00 - 13:00
- Intervalos: 30 minutos
- Cupos: 1 por slot

Resultado:
Lunes-Viernes: configuración regular
Sábados: 09:00 (1 cupo), 09:30 (1 cupo)...
```

### Caso 3: Feriado Nacional

```
Fecha bloqueada:
- Fecha: 2025-12-25
- Tipo: holiday
- Razón: "Navidad"

Resultado:
Ningún slot disponible ese día, independiente de configuraciones
```

## Migración desde Sistema Estático

Si tenías un sistema antiguo con tabla `time_slots`:

1. Se eliminó la tabla `time_slots`
2. Se eliminó `time_slot_id` de `reservations`
3. Se agregaron `reservation_date` y `reservation_time` a `reservations`
4. Las reservas existentes deben migrarse manualmente o el sistema comenzar desde cero

## Conclusión

Este sistema dinámico proporciona flexibilidad sin sacrificar rendimiento, permitiendo gestionar horarios complejos de forma simple y escalable.
