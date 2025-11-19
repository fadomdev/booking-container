# 📸 EJEMPLOS DE USO - Sistema de Reservas

## 🎬 Escenarios de Uso

### Escenario 1: Administrador Configura el Sistema

**Paso 1: Login como Admin**

```
URL: http://localhost:8000/login
Email: admin@reservas.com
Password: admin123
```

**Paso 2: Crear Usuario Transportista**

1. Dashboard → "Panel Admin" → "Usuarios" → "Nuevo Usuario"
2. Completar formulario:
    - Nombre: "Carlos González"
    - RUT: "16789012-3"
    - Email: "carlos@transporte.com"
    - Contraseña: "carlos123"
    - Rol: "Transportista"
3. Click "Crear Usuario"
4. ✅ Usuario creado exitosamente

**Paso 3: Generar Horarios para Hoy**

1. Dashboard → "Panel Admin" → "Horarios y Cupos"
2. Fecha: Seleccionar hoy (por defecto)
3. Click "Generar Horarios"
4. ✅ Se crean 20 horarios:
    - 08:00, 08:30, 09:00, ..., 17:30
    - Cada uno con 2 cupos disponibles

**Paso 4: Ver Horarios Generados**

- Se muestran en una grilla responsive
- Cada card muestra:
    - Hora del slot
    - Estado (Activo/Inactivo)
    - Disponibilidad (ej: 2/2)
    - Botón para Activar/Desactivar

---

### Escenario 2: Transportista Hace Primera Reserva

**Paso 1: Login como Transportista**

```
URL: http://localhost:8000/login
Email: transportista@reservas.com
Password: transportista123
```

**Paso 2: Crear Nueva Reserva**

1. Dashboard → "Nueva Reserva"
2. Seleccionar fecha de hoy
3. Completar formulario:
    - N° Booking: "BK-2024-001"
    - Sistema verifica → ⚠️ "Nuevo (1 cupo)"
    - Nombre Transportista: "Pedro Ramírez"
    - Patente Camión: "ABCD12"
    - Horario: Seleccionar "09:00"
    - Cantidad de Cupos: Solo aparece "1 cupo" (booking nuevo)
4. Click "Crear Reserva"
5. ✅ Reserva creada exitosamente
6. Redirección a "Mis Reservas"

**Resultado:**

- Horario 09:00 ahora muestra: Disponible 1/2
- Booking BK-2024-001 queda registrado en sistema

---

### Escenario 3: Transportista con Booking Existente (2 Cupos)

**Paso 1: Segunda Reserva con Mismo Booking**

1. "Nueva Reserva"
2. Completar:
    - N° Booking: "BK-2024-001" (el mismo anterior)
    - Sistema verifica → ✓ "Existe (2 cupos)"
    - Nombre Transportista: "Ana Martínez"
    - Patente: "XYZ789"
    - Horario: "10:00"
    - Cantidad: **Ahora puede elegir "1 cupo" o "2 cupos"**
3. Seleccionar "2 cupos"
4. Click "Crear Reserva"
5. ✅ Reserva con 2 cupos creada

**Resultado:**

- Horario 10:00 ahora muestra: Disponible 0/2 (LLENO)
- El horario ya no aparece en opciones disponibles

---

### Escenario 4: Ver y Gestionar Reservas

**Como Transportista: "Mis Reservas"**

1. Dashboard → "Mis Reservas"
2. Se muestran cards con:

    ```
    📅 Lunes, 4 de noviembre de 2025
    🕐 09:00

    👤 Transportista: Pedro Ramírez
    🚛 Patente: ABCD12
    📋 Booking: BK-2024-001
    Cupos: 1

    Estado: Activa
    [Cancelar Reserva]
    ```

**Como Admin: "Todas las Reservas"**

1. Panel Admin → "Reservas"
2. Filtros disponibles:
    - Por fecha
    - Por estado (Todas/Activas/Canceladas)
3. Se muestran TODAS las reservas del sistema
4. Información incluye usuario que la creó

---

### Escenario 5: Cancelar Reserva

**Transportista Cancela su Reserva**

1. "Mis Reservas"
2. Encontrar reserva de las 09:00
3. Click "Cancelar Reserva"
4. Confirmar en diálogo
5. ✅ Reserva cancelada

**Qué Sucede:**

- Estado cambia a "Cancelada"
- Se registra fecha de cancelación
- **Cupos regresan automáticamente**: 09:00 ahora 2/2
- Horario vuelve a estar disponible para otros

---

### Escenario 6: Admin Gestiona Horarios

**Desactivar un Horario Temporalmente**

1. Panel Admin → "Horarios y Cupos"
2. Seleccionar fecha
3. En horario 15:00, click "Desactivar"
4. ✅ Horario desactivado
5. **Ese horario ya NO aparece** en "Nueva Reserva"

**Reactivar Horario**

1. Mismo proceso, click "Activar"
2. Horario vuelve a estar disponible

---

## 🔢 Ejemplos de Datos

### Usuarios de Ejemplo

```
Admin:
- Nombre: Administrador Sistema
- RUT: 11111111-1
- Email: admin@reservas.com
- Password: admin123
- Rol: admin

Transportista 1:
- Nombre: Juan Pérez
- RUT: 22222222-2
- Email: transportista@reservas.com
- Password: transportista123
- Rol: transportista
```

### Bookings de Ejemplo

```
BK-2024-001 - Primer booking
BK-2024-002 - Segundo booking
BK-2024-003 - Tercer booking
```

### Patentes de Ejemplo

```
ABCD12
EFGH34
IJKL56
MNOP78
```

---

## 📊 Estados del Sistema

### Horario Disponible

```
🕐 09:00
Estado: Activo ✅
Disponible: 2/2
[Sin reservas]
```

### Horario Parcialmente Ocupado

```
🕐 10:00
Estado: Activo ✅
Disponible: 1/2
Reservas:
• Pedro Ramírez (1 cupo)
```

### Horario Completo

```
🕐 11:00
Estado: Activo ✅
Disponible: 0/2
Reservas:
• Ana Martínez (2 cupos)
[NO DISPONIBLE para nuevas reservas]
```

### Horario Inactivo

```
🕐 15:00
Estado: Inactivo ⭕
Disponible: 2/2
[NO APARECE en formulario de reserva]
```

---

## 🎯 Validaciones Automáticas

### 1. Booking Nuevo

```
Input: "BK-NUEVO-999"
Sistema verifica...
Resultado: ⚠️ "Nuevo (1 cupo)"
→ Solo permite reservar 1 cupo
→ Crea el booking en BD
```

### 2. Booking Existente

```
Input: "BK-2024-001"
Sistema verifica...
Resultado: ✓ "Existe (2 cupos)"
→ Permite elegir 1 o 2 cupos
→ Usa el booking de BD
```

### 3. Sin Capacidad

```
Usuario intenta reservar horario 11:00 (0/2)
Sistema: ❌ "No hay suficientes cupos disponibles"
→ No permite crear reserva
```

### 4. Fecha Pasada

```
Usuario intenta generar horarios para ayer
Sistema: ❌ "Solo se pueden generar horarios futuros"
→ Campo fecha tiene min="hoy"
```

---

## 💡 Tips de Uso

### Para Administradores:

1. **Generar horarios con anticipación**: Preferible generar horarios para toda la semana
2. **Revisar ocupación**: Usar "Horarios y Cupos" para ver qué tan ocupados están los días
3. **Filtrar reservas**: Usar filtros en "Reservas" para encontrar rápido

### Para Transportistas:

1. **Verificar booking primero**: Asegurarse que el número de booking sea correcto
2. **Reservar con anticipación**: Los horarios se llenan rápido
3. **Revisar "Mis Reservas"**: Confirmar que la reserva esté activa antes de ir

---

## 🚨 Casos Especiales

### ¿Qué pasa si cancelo y vuelvo a reservar?

- Los cupos se liberan inmediatamente
- Puedes crear una nueva reserva en el mismo horario
- El sistema no guarda "historial de cancelaciones visibles"

### ¿Puede un admin cancelar reservas de otros?

- Sí, el admin puede cancelar cualquier reserva
- El transportista solo puede cancelar las suyas

### ¿Se pueden editar reservas?

- No, el sistema no permite edición
- Debe cancelar y crear una nueva

### ¿Cuántos horarios puedo reservar?

- Sin límite de cantidad de reservas
- Cada reserva puede tener 1 o 2 cupos (según booking)

---

## 📈 Flujo Completo de Ejemplo

```
1. Admin genera horarios para mañana
   → 20 slots creados (8:00 a 17:30)
   → Total: 40 cupos disponibles

2. Transportista A crea reserva
   → Booking: BK-001 (nuevo)
   → Horario: 09:00, 1 cupo
   → Disponibles: 39 cupos

3. Transportista B crea reserva
   → Booking: BK-001 (existe)
   → Horario: 10:00, 2 cupos
   → Disponibles: 37 cupos

4. Transportista A crea segunda reserva
   → Booking: BK-001 (existe)
   → Horario: 11:00, 2 cupos
   → Disponibles: 35 cupos

5. Transportista B cancela su reserva de 10:00
   → Cupos liberados: 2
   → Disponibles: 37 cupos

6. Admin revisa sistema
   → 3 reservas activas (2 de A, 0 de B)
   → 1 reserva cancelada (B)
   → Booking BK-001 usado en 2 reservas activas
```

---

**Sistema completamente funcional y listo para usar** 🎉
