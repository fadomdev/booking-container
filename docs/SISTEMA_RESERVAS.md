# Sistema de Reservas de Horarios

Sistema completo para gestión de reservas de horarios con cupos para transportistas.

## Características Implementadas

### Panel de Administración

- ✅ CRUD completo de usuarios (Nombre, RUT, Email, Contraseña, Rol)
- ✅ **Configuración de Horarios y Cupos** (sistema dinámico basado en plantillas)
    - Definir horario de inicio y término
    - Configurar intervalos personalizados (15-120 minutos)
    - Establecer cupos por intervalo
    - Seleccionar días de la semana activos
    - Activar/desactivar configuraciones sin eliminarlas
- ✅ **Gestión de Fechas Bloqueadas**
    - Bloquear fechas específicas (feriados, mantención, etc.)
    - Categorizar bloqueos: Feriado, Mantención, Otro
    - Razón descriptiva para cada bloqueo
    - Activar/desactivar bloqueos temporalmente
- ✅ Vista de todas las reservas del sistema
- ✅ Generación dinámica de horarios disponibles según configuración

### Panel de Transportista

- ✅ Crear nuevas reservas
- ✅ Ver horarios disponibles dinámicamente
- ✅ Ver mis reservas
- ✅ Cancelar reservas propias
- ✅ Sistema de validación de booking
- ✅ Reserva de hasta 2 cupos si el booking existe

### Sistema de Reservas (Nueva Arquitectura)

- ✅ **Generación dinámica de slots** basada en configuraciones activas
- ✅ Capacidad configurable por plantilla de horario
- ✅ Respeto de fechas bloqueadas
- ✅ Validación de número de booking
- ✅ Si el booking existe, permite reservar hasta 2 cupos
- ✅ Si el booking no existe, solo permite 1 cupo
- ✅ Campos requeridos:
    - Fecha y hora seleccionada
    - Nombre transportista
    - Patente camión
    - Número de Booking

## Arquitectura del Sistema

### Modelo de Configuración Dinámica

El sistema NO genera registros individuales de time slots. En su lugar:

1. **ScheduleConfig**: Define plantillas de horarios reutilizables
    - Hora inicio/término
    - Intervalo en minutos
    - Cupos por intervalo
    - Días de semana activos (0=Domingo, 1=Lunes...6=Sábado)

2. **BlockedDate**: Bloquea fechas específicas que anulan cualquier configuración

3. **Reservation**: Almacena reservas con fecha y hora directamente (desnormalizado)
    - No depende de una tabla de time_slots
    - Los slots se generan en tiempo real al consultar

## Instalación

### 1. Ejecutar Migraciones

```bash
php artisan migrate
```

### 2. Crear Usuario Administrador (Opcional)

Puedes crear un usuario administrador usando tinker:

```bash
php artisan tinker
```

Luego ejecuta:

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

User::create([
    'name' => 'Administrador',
    'rut' => '12345678-9',
    'email' => 'admin@reservas.com',
    'password' => Hash::make('password'),
    'role' => 'admin',
]);
```

### 3. Compilar Assets Frontend

```bash
npm install
npm run dev
```

O para producción:

```bash
npm run build
```

### 4. Iniciar Servidor

```bash
php artisan serve
```

## Estructura de Base de Datos

### Tabla `users`

- Campos: id, name, rut, email, password, role (admin/transportista)

### Tabla `bookings`

- Campos: id, booking_number, is_active, notes

### Tabla `time_slots`

- Campos: id, date, time, total_capacity, available_capacity, is_active

### Tabla `reservations`

- Campos: id, user_id, time_slot_id, booking_id, transportista_name, truck_plate, slots_reserved, status, cancelled_at

## Rutas Principales

### Rutas Públicas

- `/` - Página de inicio

### Rutas Autenticadas

- `/dashboard` - Dashboard principal
- `/reservations` - Crear nueva reserva
- `/reservations/my-reservations` - Ver mis reservas
- `POST /reservations/{id}/cancel` - Cancelar reserva

### Rutas de Administrador

- `/admin` - Dashboard de administración
- `/admin/users` - Gestión de usuarios
- `/admin/users/create` - Crear usuario
- `/admin/users/{id}/edit` - Editar usuario
- `/admin/time-slots` - Gestión de horarios
- `POST /admin/time-slots/generate` - Generar horarios para una fecha
- `/admin/reservations` - Ver todas las reservas

## Uso del Sistema

### Como Administrador

1. **Crear Usuarios:**
    - Ir a "Panel Admin" → "Usuarios" → "Nuevo Usuario"
    - Completar: Nombre, RUT, Email, Contraseña, Rol
    - Los usuarios pueden ser Admin o Transportista

2. **Generar Horarios:**
    - Ir a "Horarios y Cupos"
    - Seleccionar fecha
    - Hacer clic en "Generar Horarios"
    - Se crearán slots de 30 minutos desde las 8:00 hasta las 18:00

3. **Gestionar Cupos:**
    - Ver horarios disponibles
    - Activar/desactivar horarios
    - Ajustar capacidad de cupos por horario

4. **Ver Reservas:**
    - Consultar todas las reservas del sistema
    - Filtrar por estado (activa/cancelada)
    - Filtrar por fecha

### Como Transportista

1. **Crear Reserva:**
    - Ir a "Nueva Reserva"
    - Seleccionar fecha
    - Ingresar número de booking (se validará automáticamente)
    - Si el booking existe: puedes reservar hasta 2 cupos
    - Si el booking no existe: solo puedes reservar 1 cupo
    - Completar datos del transportista y patente
    - Seleccionar horario disponible
    - Crear reserva

2. **Ver Mis Reservas:**
    - Consultar todas tus reservas
    - Ver detalles: fecha, hora, transportista, patente, booking

3. **Cancelar Reserva:**
    - En "Mis Reservas"
    - Hacer clic en "Cancelar Reserva"
    - Confirmar cancelación
    - Los cupos se liberan automáticamente

## Reglas de Negocio

1. **Capacidad de Horarios:**
    - Cada slot tiene 2 cupos por defecto
    - Los cupos se reducen al hacer reserva
    - Los cupos se liberan al cancelar reserva

2. **Sistema de Booking:**
    - Si el número de booking existe en el sistema: permite reservar 1 o 2 cupos
    - Si el número de booking NO existe: crea un nuevo booking y solo permite 1 cupo
    - Los bookings se pueden reutilizar en múltiples reservas

3. **Cancelación de Reservas:**
    - Solo el usuario que creó la reserva puede cancelarla
    - Los administradores también pueden cancelar cualquier reserva
    - Al cancelar, los cupos regresan al horario automáticamente

4. **Horarios:**
    - Se generan desde las 8:00 hasta las 18:00 (10 horas)
    - Intervalos de 30 minutos = 20 slots por día
    - Solo se pueden generar horarios para fechas futuras o el día actual

## Modelos y Relaciones

- **User** → hasMany → **Reservation**
- **TimeSlot** → hasMany → **Reservation**
- **Booking** → hasMany → **Reservation**
- **Reservation** → belongsTo → **User**, **TimeSlot**, **Booking**

## Middleware y Permisos

- `EnsureUserIsAdmin` - Middleware para proteger rutas de admin
- Verificación de rol en User: `isAdmin()`, `isTransportista()`

## Componentes Frontend

### Páginas

- `/pages/dashboard.tsx` - Dashboard principal
- `/pages/admin/dashboard.tsx` - Dashboard admin
- `/pages/admin/users/index.tsx` - Lista de usuarios
- `/pages/admin/users/create.tsx` - Crear usuario
- `/pages/reservations/create.tsx` - Crear reserva
- `/pages/reservations/my-reservations.tsx` - Mis reservas

### Layouts

- `AppLayout` - Layout principal de la aplicación

## Próximos Pasos (Opcional)

- [ ] Crear página de edición de usuarios (`/admin/users/{id}/edit`)
- [ ] Crear página de gestión de horarios (`/admin/time-slots/index`)
- [ ] Crear página de listado de reservas admin (`/admin/reservations/index`)
- [ ] Agregar notificaciones en tiempo real
- [ ] Exportar reportes en PDF/Excel
- [ ] Sistema de notificaciones por email

## Tecnologías Utilizadas

- **Backend:** Laravel 11, PHP 8.2+
- **Frontend:** React 18, TypeScript, Inertia.js
- **UI:** Tailwind CSS, shadcn/ui components
- **Base de Datos:** MySQL/PostgreSQL/SQLite
- **Autenticación:** Laravel Fortify

## Notas Importantes

- Asegúrate de configurar correctamente el archivo `.env` con la base de datos
- Los horarios se generan manualmente por el admin para cada fecha
- El RUT se almacena como string, no se valida formato (puedes agregar validación)
- Las patentes se convierten automáticamente a mayúsculas
- El sistema usa middleware de autenticación de Laravel Fortify
