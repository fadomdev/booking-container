# Prompt para Crear Sistema de Gestión de Reservas de Contenedores

## Contexto General

Necesito crear un sistema web completo de gestión de reservas para una empresa que maneja contenedores. El sistema debe permitir a los usuarios agendar citas para entregar/recoger contenedores en horarios específicos, con integración a una API externa y panel de administración completo.

## Stack Tecnológico Requerido

### Backend

- **Framework:** Laravel 11
- **PHP:** 8.3+
- **Base de datos:** MySQL
- **Autenticación:** Laravel Fortify con 2FA opcional
- **API Communication:** Guzzle HTTP Client

### Frontend

- **Framework:** React 18 con TypeScript
- **Metaframework:** Inertia.js (SSR)
- **UI Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **Icons:** Lucide React
- **Formularios:** React Hook Form con validaciones
- **Estado:** Hooks de React (useState, useEffect, useContext)

### Herramientas Adicionales

- **Build:** Vite
- **Validación RUT:** Librería rut.js (para RUT chilenos)
- **Fechas:** date-fns
- **Estilos:** Tailwind CSS con tema personalizable (dark mode)

## Modelos de Base de Datos

### 1. Users (usuarios)

```php
- id (bigint, PK)
- name (string)
- email (string, unique)
- password (string, hashed)
- rut (string, unique, validado con formato chileno)
- is_admin (boolean, default: false)
- company_id (bigint, FK nullable)
- email_verified_at (timestamp, nullable)
- two_factor_secret (text, nullable)
- two_factor_recovery_codes (text, nullable)
- two_factor_confirmed_at (timestamp, nullable)
- created_at, updated_at

Relaciones:
- belongsTo Company
- hasMany Reservations
```

### 2. Companies (empresas)

```php
- id (bigint, PK)
- name (string)
- rut (string, unique)
- email (string)
- phone (string)
- address (text, nullable)
- is_active (boolean, default: true)
- created_at, updated_at

Relaciones:
- hasMany Users
```

### 3. Reservations (reservas)

```php
- id (bigint, PK)
- user_id (bigint, FK)
- reservation_date (date)
- reservation_time (time)
- booking_number (string) // Número de Booking externo
- transportista_name (string)
- truck_plate (string, 6-10 caracteres)
- slots_reserved (integer) // Cupos reservados
- container_numbers (json array) // Números de contenedores
- status (enum: 'active', 'confirmed', 'cancelled', 'completed', 'expired')
- api_notes (text, nullable) // Resultado de envío a API
- file_info (text, nullable) // Información del file desde API
- cancelled_by (bigint, FK nullable)
- cancelled_at (timestamp, nullable)
- cancellation_comment (text, nullable)
- created_at, updated_at

Relaciones:
- belongsTo User (owner)
- belongsTo User (cancelled_by)

Validaciones:
- container_numbers: Formato ABCD1234567 (4 letras + 7 dígitos)
- No duplicados de contenedores por mismo booking_number
- Validar capacidad disponible antes de crear
```

### 4. ScheduleConfig (configuración de horarios)

```php
- id (bigint, PK)
- day_of_week (integer, 0=Domingo, 6=Sábado)
- start_time (time)
- end_time (time)
- interval_minutes (integer, ejemplo: 30)
- slots_per_interval (integer) // Capacidad por slot
- is_active (boolean, default: true)
- created_at, updated_at

Ejemplo: Lunes 08:00-18:00 cada 30min con 5 cupos
```

### 5. SpecialSchedule (horarios especiales)

```php
- id (bigint, PK)
- date (date)
- start_time (time)
- end_time (time)
- interval_minutes (integer)
- slots_per_interval (integer)
- reason (string, nullable)
- is_active (boolean, default: true)
- created_at, updated_at

Sobrescribe ScheduleConfig para fechas específicas
```

### 6. BlockedDate (fechas bloqueadas)

```php
- id (bigint, PK)
- date (date, unique)
- reason (string)
- is_active (boolean, default: true)
- created_at, updated_at

Bloquea completamente un día (feriados, mantenimiento)
```

### 7. BlockedSlot (horarios bloqueados)

```php
- id (bigint, PK)
- date (date, nullable) // null = aplica todos los días
- start_time (time)
- end_time (time)
- reason (string)
- is_recurring (boolean) // Si es recurrente (diario)
- is_active (boolean, default: true)
- created_at, updated_at

Bloquea rangos horarios específicos (ej: colación 13:00-14:00)
Validación: No permitir bloqueos solapados
```

## Funcionalidades por Rol

### Usuario Regular

#### 1. Dashboard

- Ver contador de reservas activas
- Acceso rápido a "Nueva Reserva" y "Mis Reservas"

#### 2. Crear Reserva (Wizard de 4 pasos)

**Paso 1: Fecha y Horario**

- Calendario para seleccionar fecha (deshabilitar fechas bloqueadas)
- Lista de horarios disponibles con capacidad en tiempo real
- Validar que no sea fecha pasada
- Mostrar razón si fecha está bloqueada

**Paso 2: Datos del Booking**

- Número de Booking (requerido)
- Validar Booking contra API externa (botón "Validar Booking")
- Mostrar información del File si existe
- Nombre transportista (autocompletar con nombre del usuario)
- Patente camión (historial de patentes usadas)
- Cupos solicitados (máximo según capacidad del slot)

**Paso 3: Contenedores**

- Inputs dinámicos según cupos solicitados
- Validación formato: 4 letras + 7 dígitos (ABCD1234567)
- No permitir duplicados en mismo booking
- Autocompletar mayúsculas

**Paso 4: Confirmación**

- Resumen de todos los datos
- Enviar contenedores a API externa antes de guardar
- Mostrar errores de API si los hay
- Crear reserva solo si API responde OK

**Post-Creación:**

- Modal de éxito con número de reserva
- Opción de descargar PDF (futuro)
- Guardar patente en historial

#### 3. Mis Reservas

- Tabla con filtros: Todas, Activas, Completadas, Expiradas, Canceladas
- Badges de colores por estado
- Botón "Anular" solo para activas/confirmadas
- Modal de confirmación para cancelación
- Enviar email al cancelar

### Administrador

#### 1. Dashboard Admin

- Estadísticas generales
- Acceso a todos los módulos

#### 2. Gestión de Usuarios

- CRUD completo
- Asignar rol admin
- Activar/desactivar
- Asignar a empresa

#### 3. Gestión de Empresas

- CRUD completo
- Validación RUT chileno
- Activar/desactivar

#### 4. Configuración de Horarios

- CRUD de ScheduleConfig
- Vista por día de la semana
- Toggle activo/inactivo

#### 5. Horarios Especiales

- CRUD de SpecialSchedule
- Buscar por fecha
- Sobrescribir horarios regulares

#### 6. Fechas Bloqueadas

- CRUD de BlockedDate
- Calendario visual
- Razón del bloqueo (feriado, mantenimiento)

#### 7. Horarios Bloqueados

- CRUD de BlockedSlot
- Bloqueos recurrentes o específicos
- Validación anti-solapamiento
- Ej: Colación 13:00-14:00 diaria

#### 8. Reservas

- Vista completa de todas las reservas
- Filtros: estado, fecha, usuario, booking
- Búsqueda por número de booking o contenedor
- Dropdown de acciones: Ver, Completar, Exportar
- Ver información del File en modal
- Mostrar fecha de creación

#### 9. Marcar Reservas como Completadas

- Búsqueda por booking o contenedor
- Ver detalles completos
- Botón "Marcar como Completada"
- Agregar comentario opcional

## Integración con API Externa

### Endpoints

**1. Validar Booking**

```
POST https://bcms.tp3developers.cl/services/agenda.php
Body: {
  "id_tipo": "1",
  "numero_booking": "ABC123"
}

Response Success: {
  "mensaje": "Datos del Booking",
  "data": {
    "numero_file": "FILE-123",
    "tipo_flexitank": "BB240 cbm MFV"
  }
}

Response Error: {
  "mensaje": "Booking no encontrado"
}
```

**2. Enviar Contenedores**

```
POST https://bcms.tp3developers.cl/services/agenda.php
Body: {
  "id_tipo": "2",
  "numero_booking": "ABC123",
  "numero_contenedor": "ABCD1234567",
  "fecha_agenda": "2025-12-10",
  "hora": "14:30",
  "patente": "ABCD12"
}

Response Success: {
  "mensaje": "1 de 1 contenedores registrados exitosamente"
}

Response Error: {
  "mensaje": "0 de 1 contenedores registrados exitosamente",
  "error": "Contenedor ya registrado"
}
```

### Manejo de Respuestas

- Guardar respuesta completa en `api_notes` (JSON)
- Mostrar errores al usuario si la API falla
- Permitir crear reserva aunque API falle (registro local)
- Logs detallados en `storage/logs/laravel.log`

## Comandos Artisan (Cron Jobs)

### 1. Actualizar Reservas Expiradas

```php
php artisan reservations:update-expired

Lógica:
- Buscar reservas con status 'confirmed'
- Fecha < ayer (-1 día) O (fecha=hoy Y hora+2h < ahora)
- Cambiar status a 'expired'
- Agregar comentario: "Reserva caducada automáticamente..."

Cron: Cada 6 horas (00:00, 06:00, 12:00, 18:00)
```

### 2. Ruta HTTP para Cron (alternativa)

```
GET /cron/update-expired-reservations?token={CRON_TOKEN}

Protegido con token secreto en .env
Ejecuta el comando internamente
Retorna JSON con resultado
```

## Reglas de Negocio Importantes

### Capacidad y Slots

1. Cada slot tiene capacidad definida en ScheduleConfig/SpecialSchedule
2. Al reservar, validar capacidad disponible en tiempo real
3. Prevenir race conditions usando transacciones DB
4. Mostrar "agotado" si capacidad = 0

### Bloqueos de Horarios

1. BlockedDate bloquea día completo
2. BlockedSlot bloquea rango horario específico
3. Lógica: `slot_time >= start_time && slot_time < end_time`
4. Ejemplo: 15:00-17:00 bloquea slots 15:00, 15:30, 16:00, 16:30 pero NO 17:00

### Validación de Contenedores

1. Formato estricto: 4 letras + 7 dígitos
2. No duplicados en mismo booking_number (activas/confirmadas/completadas)
3. Array en JSON en DB
4. Normalizar a mayúsculas sin espacios

### Estados de Reserva

- **active:** Recién creada
- **confirmed:** Confirmada (igual que active por ahora)
- **cancelled:** Anulada por usuario
- **completed:** Completada manualmente por admin
- **expired:** Expirada automáticamente por cron

### Validaciones de Fecha/Hora

1. No permitir reservar en pasado
2. Verificar que slot no esté bloqueado
3. Verificar capacidad disponible
4. Respetar horarios de ScheduleConfig/SpecialSchedule

## Diseño UI/UX

### Tema y Colores

- **Primary:** #ffcc00 (amarillo corporativo)
- **Danger:** #d40511 (rojo corporativo)
- **Info:** Azul
- **Success:** Verde
- Dark mode compatible

### Componentes shadcn/ui Usados

- Button, Card, Input, Textarea, Label
- Select, Checkbox, Badge, Dialog, Popover
- Table, Tabs, Calendar, Separator
- DropdownMenu, AlertDialog, Toast

### Layout

- Sidebar izquierdo (AppLayout)
- Navegación con iconos Lucide
- Responsive para móvil
- Logo corporativo en header

### Indicadores Visuales

- Badges de estado con colores
- Iconos contextuales
- Loading states
- Error messages con AlertCircle
- Success messages con CheckCircle

## Emails

### 1. Reserva Cancelada

```
Para: usuario que creó la reserva
Asunto: Reserva Cancelada - #{id}
Contenido:
- Número de reserva
- Fecha y hora
- Booking number
- Razón de cancelación
- Fecha de cancelación
```

## Archivos de Configuración Importantes

### .env

```env
APP_NAME="Sistema de Reservas"
APP_URL=https://agenda.teparatres.cl
DB_CONNECTION=mysql
DB_DATABASE=teparatr_bcms_reservas
CRON_TOKEN=token-secreto-aleatorio
BOOKING_API_ENABLED=true
BOOKING_API_URL=https://bcms.tp3developers.cl/services/agenda.php
MAIL_FROM_ADDRESS=noreply@teparatres.cl
```

### config/services.php

```php
'booking_api' => [
    'enabled' => env('BOOKING_API_ENABLED', true),
    'url' => env('BOOKING_API_URL'),
],
```

## Estructura de Carpetas Frontend

```
resources/js/
├── components/
│   ├── ui/ (shadcn/ui components)
│   ├── app-sidebar.tsx
│   └── reservations/
│       ├── ReservationSuccessModal.tsx
│       ├── PlateHistoryDialog.tsx
│       └── steps/
│           ├── DateTimeStep.tsx
│           ├── BookingDataStep.tsx
│           ├── ContainersStep.tsx
│           └── ConfirmationStep.tsx
├── hooks/
│   └── reservations/
│       ├── useBookingValidation.ts
│       ├── useContainerSubmission.ts
│       └── usePlateHistory.ts
├── layouts/
│   ├── app-layout.tsx
│   └── auth-layout.tsx
├── pages/
│   ├── dashboard.tsx
│   ├── auth/ (login, register, etc.)
│   ├── reservations/
│   │   ├── create.tsx (wizard)
│   │   └── my-reservations.tsx
│   └── admin/
│       ├── dashboard.tsx
│       ├── users/
│       ├── companies/
│       ├── schedule-config/
│       ├── special-schedules/
│       ├── blocked-dates/
│       ├── blocked-slots/
│       └── reservations/
└── types/
    └── index.d.ts
```

## Seguridad

### Autenticación y Autorización

- Laravel Fortify para auth
- Middleware `EnsureUserIsAdmin` para rutas admin
- Verificación de email opcional
- 2FA opcional para usuarios

### Validaciones Backend

- Todas las validaciones críticas en backend
- Sanitización de inputs
- Transacciones DB para operaciones críticas
- Rate limiting en API routes

### Protección CSRF

- Token CSRF en todos los formularios
- Verificación automática de Inertia

## Testing

### Tests a Incluir

1. **ReservationTest:**
    - Crear reserva con datos válidos
    - Validar capacidad insuficiente
    - Validar fecha bloqueada
    - Validar contenedores duplicados

2. **ScheduleTest:**
    - Generar slots correctamente
    - Respetar horarios especiales
    - Bloqueos funcionando

3. **CommandTest:**
    - Comando update-expired funciona
    - Actualiza solo reservas correctas

## Deployment (cPanel)

### Checklist

1. Subir código a `/home/teparatr/public_html/bcms_reservas`
2. Configurar .env con datos de producción
3. Ejecutar migraciones: `php artisan migrate --force`
4. Compilar assets: `npm run build`
5. Cachear config: `php artisan optimize`
6. Configurar cron job:
    ```bash
    curl -s "https://agenda.teparatres.cl/cron/update-expired-reservations?token={TOKEN}"
    ```
7. Permisos: `chmod -R 755 storage bootstrap/cache`
8. Eliminar archivo `public/hot` si existe

## Documentación Adicional

Crear archivos MD en `docs/`:

- RESUMEN_IMPLEMENTACION.md (features implementadas)
- CONFIGURACION_CRON.md (setup de cron jobs)
- API_EXTERNA.md (documentación de integración)
- MANUAL_USUARIO.md (guía para usuarios finales)

## Próximas Mejoras (Futuras)

1. Exportar reservas a Excel/PDF
2. Dashboard con gráficos (Chart.js)
3. Notificaciones push
4. SMS para confirmaciones
5. QR codes para check-in
6. App móvil con React Native
7. Integración con Google Calendar
8. Reportes avanzados

---

## Notas Importantes para el Desarrollador

1. **Normalización de datos:** Todo a mayúsculas sin espacios (contenedores, patentes, RUT)
2. **Zona horaria:** America/Santiago (Chile)
3. **Validación RUT:** Usar librería `rut.js` o similar
4. **Logs detallados:** Usar `Log::info()` para operaciones críticas
5. **UX del wizard:** Guardar estado en cada paso, permitir volver atrás
6. **Manejo de errores:** Mensajes claros en español
7. **Responsive:** Probar en móvil, tablet y desktop
8. **Accesibilidad:** Labels correctos, ARIA attributes
9. **Performance:** Lazy loading, code splitting con Vite
10. **Cache:** Cachear configuraciones que no cambian frecuentemente

## Comandos Útiles para Desarrollo

```bash
# Iniciar servidor
php artisan serve

# Compilar assets (dev)
npm run dev

# Compilar assets (producción)
npm run build

# Limpiar cachés
php artisan optimize:clear

# Ejecutar migraciones
php artisan migrate

# Crear seeders de prueba
php artisan db:seed

# Ejecutar tests
php artisan test
```

---

Este prompt debe ser suficiente para que otro modelo de IA o desarrollador pueda recrear el sistema completo con todas sus funcionalidades.
