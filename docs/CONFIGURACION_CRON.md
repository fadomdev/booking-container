# Configuración de Cron Jobs en cPanel para Sistema de Reservas

## 📋 Resumen

Este documento explica cómo configurar los cron jobs necesarios para el funcionamiento automático del sistema de gestión de reservas.

## 🎯 ¿Qué hacen los comandos?

### 1. `reservations:update-expired` (Cada 6 horas)

- **Función:** Marca automáticamente como "expiradas" las reservas que no fueron completadas
- **Criterios:**
    - Reservas con status `confirmed`
    - Con fecha anterior a ayer (-1 día)
    - O con fecha de hoy pero con más de 2 horas de retraso desde su hora programada
- **Resultado:** Cambia status a `expired` y agrega un comentario automático

### 2. `reservations:update-completed` (Cada hora)

- **Función:** Marca como "completadas" las reservas activas cuyo tiempo ya pasó
- **Nota:** Este comando ya existía en el sistema

---

## ⚙️ Configuración en cPanel

### Paso 1: Acceder a Cron Jobs

1. Ingresa a tu panel de cPanel
2. Busca y haz clic en **"Cron Jobs"** (generalmente en la sección "Avanzado")

### Paso 2: Configurar el Cron Principal de Laravel

Laravel requiere UN SOLO cron job que ejecute el schedule runner cada minuto. Este se encarga de ejecutar todos los comandos programados.

**Configuración:**

- **Minuto:** `*`
- **Hora:** `*`
- **Día:** `*`
- **Mes:** `*`
- **Día de la semana:** `*`
- **Comando:**
    ```bash
    cd /home/teparatr/public_html/bcms_reservas && php artisan schedule:run >> /dev/null 2>&1
    ```

### Explicación del Comando

```bash
cd /home/teparatr/public_html/bcms_reservas  # Navega al directorio del proyecto
&&                                           # Y luego...
php artisan schedule:run                     # Ejecuta el scheduler de Laravel
>> /dev/null 2>&1                           # Suprime la salida (opcional)
```

**⚠️ IMPORTANTE:** Verifica la ruta completa de tu proyecto. Si no estás seguro:

1. Conéctate vía FTP o File Manager
2. Navega hasta tu proyecto
3. Copia la ruta completa que aparece en la barra de direcciones

---

## 🔍 ¿Cómo funciona?

Una vez configurado, el flujo es el siguiente:

```
Cada minuto:
  ├─ cPanel ejecuta: php artisan schedule:run
  │
  ├─ Laravel revisa qué comandos deben ejecutarse en ese momento:
  │  │
  │  ├─ Cada hora (en punto):
  │  │  └─ Ejecuta: reservations:update-completed
  │  │
  │  └─ Cada 6 horas (00:00, 06:00, 12:00, 18:00):
  │     └─ Ejecuta: reservations:update-expired
  │
  └─ Termina (hasta el próximo minuto)
```

---

## 📊 Programación de Comandos

Los comandos están programados en `routes/console.php`:

```php
// Cada hora: marca completadas las reservas activas pasadas
Schedule::command('reservations:update-completed')->hourly();

// Cada 6 horas: marca expiradas las reservas no completadas
Schedule::command('reservations:update-expired')->everySixHours();
```

### Horarios de Ejecución

**reservations:update-expired** se ejecutará a:

- 00:00 (medianoche)
- 06:00 (mañana)
- 12:00 (mediodía)
- 18:00 (tarde)

**reservations:update-completed** se ejecutará cada hora en punto:

- 00:00, 01:00, 02:00, ..., 23:00

---

## ✅ Verificación

### 1. Verificar que el cron esté activo

En cPanel, deberías ver tu cron job listado así:

```
*  *  *  *  *  cd /home/teparatr/public_html/bcms_reservas && php artisan schedule:run >> /dev/null 2>&1
```

### 2. Probar manualmente (vía SSH o terminal de cPanel)

Si tienes acceso SSH, puedes ejecutar manualmente:

```bash
cd /home/teparatr/public_html/bcms_reservas
php artisan reservations:update-expired
php artisan reservations:update-completed
```

### 3. Ver el log de Laravel

Los comandos deberían dejar registro en:

```
storage/logs/laravel.log
```

### 4. Verificar en la base de datos

Después de algunas horas, revisa la tabla `reservations`:

- Deberían aparecer reservas con status `expired`
- El campo `cancellation_comment` debería contener: "Reserva caducada automáticamente..."

---

## 🐛 Solución de Problemas

### El cron no se ejecuta

**Problema:** Las reservas no cambian de estado automáticamente.

**Soluciones:**

1. Verifica que la ruta en el comando sea correcta
2. Asegúrate de que el usuario de cPanel tenga permisos de ejecución
3. Revisa los logs de cPanel (si están disponibles)
4. Prueba el comando manualmente vía SSH

### Error de permisos

**Problema:** `Permission denied` al ejecutar el comando.

**Solución:**

```bash
cd /home/teparatr/public_html/bcms_reservas
chmod -R 755 storage bootstrap/cache
```

### Comandos no encontrados

**Problema:** `Command "reservations:update-expired" is not defined`

**Solución:**

1. Verifica que los archivos de comandos existan:
    - `app/Console/Commands/UpdateExpiredReservations.php`
    - `app/Console/Commands/UpdateCompletedReservations.php`
2. Ejecuta: `php artisan list` para ver todos los comandos disponibles

---

## 📝 Alternativa: Cron Jobs Individuales (NO RECOMENDADO)

Si por alguna razón no puedes usar `schedule:run`, puedes configurar crons individuales:

**Cada 6 horas (expiradas):**

```
0 */6 * * * cd /home/teparatr/public_html/bcms_reservas && php artisan reservations:update-expired >> /dev/null 2>&1
```

**Cada hora (completadas):**

```
0 * * * * cd /home/teparatr/public_html/bcms_reservas && php artisan reservations:update-completed >> /dev/null 2>&1
```

**⚠️ NOTA:** Esta opción NO es recomendada porque:

- Requiere múltiples cron jobs
- Es más difícil de mantener
- Laravel está diseñado para usar un solo cron job con `schedule:run`

---

## 🎓 Entendiendo la sintaxis del cron

```
*  *  *  *  *  comando
│  │  │  │  │
│  │  │  │  └─── Día de la semana (0-7, 0 y 7 = Domingo)
│  │  │  └────── Mes (1-12)
│  │  └───────── Día del mes (1-31)
│  └──────────── Hora (0-23)
└─────────────── Minuto (0-59)
```

**Ejemplos:**

- `* * * * *` = Cada minuto
- `0 * * * *` = Cada hora en punto
- `0 */6 * * *` = Cada 6 horas (00:00, 06:00, 12:00, 18:00)
- `0 0 * * *` = Una vez al día a medianoche
- `0 0 * * 0` = Una vez a la semana (domingos a medianoche)

---

## 📞 Contacto y Soporte

Si tienes problemas con la configuración:

1. Revisa los logs en `storage/logs/laravel.log`
2. Verifica que tu hosting permita cron jobs
3. Contacta al soporte de tu hosting para confirmar la ruta correcta de PHP y permisos

---

**Última actualización:** Diciembre 3, 2025
