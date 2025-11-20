# Sistema de Horarios Especiales

## Descripción

El sistema de **Horarios Especiales** permite definir horarios personalizados para fechas específicas, con la opción de restringir el acceso solo a transportistas autorizados.

## Casos de Uso

### 1. Horario Extendido con Acceso Restringido

**Ejemplo:** Viernes 21 de noviembre - horario extendido hasta las 20:00 solo para transportistas autorizados.

## Instalación

### 1. Ejecutar Migración

```bash
php artisan migrate
```

### 2. (Opcional) Ejecutar Seeder de Ejemplo

```bash
php artisan db:seed --class=SpecialScheduleSeeder
```

## Uso desde Panel de Administración

### Crear Horario Especial

1. Ir a **Admin → Horarios Especiales**
2. Clic en **Crear Horario Especial**
3. Completar el formulario:
    - **Fecha:** Seleccionar fecha específica (ej: 21/11/2025)
    - **Hora Inicio:** 08:00
    - **Hora Fin:** 20:00
    - **Intervalo (minutos):** 60
    - **Cupos por intervalo:** 2
    - **Acceso Restringido:** ✓ Activar
    - **Descripción:** "Horario extendido viernes 21"
    - **Transportistas Autorizados:** Seleccionar usuarios de la lista

### Características

#### ✅ Acceso Restringido

- Si está **activado**: Solo los transportistas seleccionados verán y podrán reservar estos horarios
- Si está **desactivado**: Todos los usuarios pueden acceder (horario extendido público)

#### ✅ Prioridad sobre Horarios Regulares

- Los horarios especiales tienen **prioridad** sobre la configuración de horarios regulares
- Si existe un horario especial para una fecha, el sistema usa solo ese horario

#### ✅ Gestión Flexible

- Activar/Desactivar horarios sin eliminarlos
- Modificar lista de transportistas autorizados
- Editar horarios y capacidades

## Funcionamiento Técnico

### Backend (ReservationController)

```php
// El sistema verifica primero si existe un horario especial
$specialSchedule = SpecialSchedule::getForDate($date);

if ($specialSchedule) {
    // Verificar autorización del usuario
    $isAuthorized = $specialSchedule->isUserAuthorized($user);

    // Si es restringido y el usuario no está autorizado, no ve los slots
    if ($specialSchedule->restricted_access && !$isAuthorized) {
        // No mostrar slots
    }
}
```

### Modelos

#### SpecialSchedule

- `date`: Fecha específica
- `start_time`: Hora inicio
- `end_time`: Hora fin
- `interval_minutes`: Intervalo entre slots
- `slots_per_interval`: Cupos por slot
- `is_active`: Estado activo/inactivo
- `restricted_access`: Si requiere autorización
- `description`: Descripción del horario

#### Relación con Usuarios

```php
// Muchos a muchos
SpecialSchedule->authorizedUsers()
```

## Ejemplo: Configurar Viernes 21

### Opción 1: Desde Panel Admin (Recomendado)

1. Login como admin
2. Ir a `/admin/special-schedules/create`
3. Configurar:
    ```
    Fecha: 21/11/2025
    Inicio: 08:00
    Fin: 20:00
    Intervalo: 60 minutos
    Cupos: 2 por slot
    Acceso Restringido: ✓ Sí
    Transportistas: [Seleccionar de la lista]
    ```

### Opción 2: Por Código (Manual)

```php
use App\Models\SpecialSchedule;
use App\Models\User;

// Crear horario especial
$specialSchedule = SpecialSchedule::create([
    'date' => '2025-11-21',
    'start_time' => '08:00',
    'end_time' => '20:00',
    'interval_minutes' => 60,
    'slots_per_interval' => 2,
    'is_active' => true,
    'restricted_access' => true,
    'description' => 'Horario extendido viernes 21',
]);

// Asignar transportistas autorizados
$transportistas = User::whereIn('id', [1, 5, 8, 12])->get();
$specialSchedule->authorizedUsers()->attach($transportistas);
```

## Vista del Usuario

### Usuario Autorizado

- Ve **todos** los horarios: 08:00 - 20:00
- Puede reservar en cualquier slot disponible

### Usuario No Autorizado

- **No ve** los horarios extendidos
- Solo ve horarios regulares (si los hay para otros días)
- Para el 21/11, si solo hay horario especial restringido, no verá ningún horario

## Validaciones

### Backend

✅ Solo usuarios autorizados pueden reservar horarios restringidos
✅ Validación en `store()` de ReservationController
✅ Verificación de capacidad disponible

### Frontend

✅ Horarios restringidos no aparecen para usuarios no autorizados
✅ UI clara y consistente

## Gestión de Transportistas

### Agregar Transportista a Horario Existente

1. Ir a **Editar** horario especial
2. Marcar checkbox del nuevo transportista
3. Guardar

### Remover Transportista

1. Ir a **Editar** horario especial
2. Desmarcar checkbox del transportista
3. Guardar

## Notas Importantes

⚠️ **Un horario especial sobrescribe completamente los horarios regulares para esa fecha**

⚠️ **Si no hay horario especial para una fecha, se usan los horarios regulares del día de la semana**

⚠️ **Los horarios especiales tienen fecha única** - no se puede crear más de uno para la misma fecha

✅ **Se pueden crear múltiples horarios especiales para diferentes fechas**

## Rutas de Administración

```
GET    /admin/special-schedules              # Listar
GET    /admin/special-schedules/create       # Formulario crear
POST   /admin/special-schedules              # Guardar
GET    /admin/special-schedules/{id}/edit    # Formulario editar
PUT    /admin/special-schedules/{id}         # Actualizar
DELETE /admin/special-schedules/{id}         # Eliminar
POST   /admin/special-schedules/{id}/toggle-status  # Activar/Desactivar
```

## Próximos Pasos

Para usar el sistema ahora:

1. **Ejecutar migración:**

    ```bash
    php artisan migrate
    ```

2. **Crear interfaz de administración** (opcional - se puede hacer por código mientras tanto)

3. **Configurar horario para el viernes 21:**

    ```bash
    php artisan tinker
    ```

    Luego ejecutar el código del ejemplo manual arriba.

4. **Asignar transportistas autorizados** según tus necesidades
