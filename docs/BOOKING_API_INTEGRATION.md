# Integración con API de Validación de Booking

## Descripción

Este sistema incluye validación opcional de números de booking contra una API externa antes de crear reservas. La validación se realiza en el **frontend** cuando el usuario ingresa el número de booking, proporcionando feedback inmediato. Esto asegura que solo se permitan reservas con números de booking válidos y activos.

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# URL base de la API externa para validar números de booking
BOOKING_API_URL=https://api.example.com/v1

# Clave de API (Bearer token) para autenticación
BOOKING_API_KEY=your_api_key_here

# Timeout en segundos para las solicitudes HTTP (por defecto: 10)
BOOKING_API_TIMEOUT=10

# Habilitar/deshabilitar la validación de booking (true/false)
BOOKING_API_ENABLED=false
```

### Habilitar la Validación

Para activar la validación de booking:

1. Obtén las credenciales de la API externa (URL y token)
2. Configura las variables de entorno
3. Cambia `BOOKING_API_ENABLED=true`

## Formato de la API Externa

### Endpoint Esperado

```
GET {BOOKING_API_URL}/bookings/{booking_number}
Authorization: Bearer {BOOKING_API_KEY}
```

### Respuesta Esperada

La API debe retornar una respuesta JSON con un campo `status`:

```json
{
    "status": "active",
    "booking_number": "BK123456",
    "other_data": "..."
}
```

### Estados Válidos

El booking se considera válido si `status` es:

- `"active"` - Booking activo
- `"confirmed"` - Booking confirmado

Cualquier otro valor de status será rechazado.

### Códigos de Error

- **404 Not Found**: El booking no existe en el sistema externo
- **Otros errores**: Se loguean pero la reserva se permite (fail-open)

## Comportamiento

### Validación en el Frontend

La validación se ejecuta automáticamente cuando el usuario:

1. Ingresa el número de booking
2. Hace blur del campo (pierde el foco)

El sistema muestra **feedback en tiempo real**:

- 🔵 **"Validando..."** - Mientras se consulta la API
- ✅ **"Booking válido"** - El booking existe y está activo
- ❌ **"Booking no válido"** - Muestra el mensaje de error específico

El botón de "Crear Reserva" se **deshabilita automáticamente** si:

- El booking está siendo validado
- El booking no es válido
- No se ha ingresado un número de booking

### Estrategia Fail-Open

Por diseño, si la API externa no está disponible o tiene problemas:

- La validación retorna `valid: true`
- Se registra un warning en los logs
- La reserva se permite proceder

Esto previene que problemas en el sistema externo bloqueen completamente las reservas.

### Mensajes de Error

Si el booking no es válido, el usuario verá en tiempo real:

- **Booking no encontrado**: "El número de booking no existe en el sistema externo."
- **Status inválido**: "El número de booking no está activo o confirmado."
- **API deshabilitada**: La validación retorna `valid: true` automáticamente.

## Logging

Todos los intentos de validación se registran en los logs de Laravel:

```php
// Error crítico (API caída)
Log::error('Error al validar booking', [
    'booking_number' => 'BK123456',
    'error' => 'mensaje de error'
]);

// Warning (API respondió pero booking inválido)
Log::warning('Booking validation failed', [
    'booking_number' => 'BK123456',
    'status' => 'inactive'
]);
```

## Seguridad

- ✅ Autenticación con Bearer token
- ✅ Timeout configurable para prevenir requests colgados
- ✅ Feature toggle para habilitar/deshabilitar
- ✅ Fail-open para resiliencia
- ✅ Logging completo para auditoría

## Testing

### Desarrollo Local

Para desarrollo sin API externa:

```env
BOOKING_API_ENABLED=false
```

### Testing con API de Staging

```env
BOOKING_API_URL=https://staging-api.example.com/v1
BOOKING_API_KEY=test_token_here
BOOKING_API_TIMEOUT=5
BOOKING_API_ENABLED=true
```

### Testing de Timeout

Reduce el timeout para testear comportamiento con API lenta:

```env
BOOKING_API_TIMEOUT=1
```

## Personalización

### Cambiar a Fail-Closed

Si prefieres rechazar reservas cuando la API está caída, edita `app/Services/BookingValidationService.php`:

```php
// En el método validateBooking(), cambia el catch block:
catch (\Exception $e) {
    Log::error('Error al validar booking', [
        'booking_number' => $bookingNumber,
        'error' => $e->getMessage()
    ]);

    return [
        'valid' => false,  // Cambiar de true a false
        'message' => 'No se pudo validar el booking. Intente más tarde.',
        'data' => null
    ];
}
```

### Agregar Retry Logic

Para reintentar en caso de falla temporal:

```php
use Illuminate\Support\Facades\Http;

// En validateBooking(), cambia la petición:
$response = Http::timeout($timeout)
    ->retry(3, 100)  // Reintentar 3 veces con 100ms entre intentos
    ->withHeaders([
        'Authorization' => "Bearer {$apiKey}",
        'Accept' => 'application/json',
    ])
    ->get("{$apiUrl}/bookings/{$bookingNumber}");
```

## Monitoreo

### Métricas Recomendadas

- Número de validaciones exitosas por día
- Número de bookings rechazados
- Número de errores de API
- Tiempo promedio de respuesta de la API

### Alertas Sugeridas

- Alert si tasa de error > 10%
- Alert si tiempo de respuesta > 5 segundos
- Alert si API retorna muchos 404 (posible problema de sincronización)

## Soporte

Para problemas con la validación de booking:

1. Verifica los logs en `storage/logs/laravel.log`
2. Confirma que `BOOKING_API_ENABLED=true`
3. Verifica conectividad a la API externa
4. Valida el formato del token de autenticación
5. Prueba el endpoint directamente con curl:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.example.com/v1/bookings/BK123456
```
