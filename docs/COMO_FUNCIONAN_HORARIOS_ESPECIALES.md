# 📅 Cómo Funcionan los Horarios Especiales

## 🎯 Concepto Principal

Los horarios especiales **EXTIENDEN** los horarios normales, no los reemplazan.

## 📊 Comportamiento por Tipo de Usuario

### 👤 Usuarios NO Autorizados (Normales)

- ✅ **VEN:** Horarios normales de `schedule_configs`
- ❌ **NO VEN:** Extensiones de horarios especiales
- 🕐 **Ejemplo:** Si el horario normal es 08:00-18:00, solo ven hasta las 18:00

### 🔑 Usuarios Autorizados

- ✅ **VEN:** Horarios normales de `schedule_configs` (08:00-18:00)
- ✅ **VEN ADEMÁS:** Horarios extendidos del horario especial (18:00-20:00)
- 🕐 **Ejemplo:** Ven de 08:00 a 20:00 (normal + extensión)

## 📝 Ejemplo Real: Viernes 21 de Noviembre 2025

### Configuración

**Horarios Normales (ScheduleConfig):**

- Lunes a Viernes: 08:00 - 18:00
- Intervalo: 60 minutos
- Cupos por slot: 2

**Horario Especial para Viernes 21:**

- Fecha: 2025-11-21
- Horario completo: 08:00 - 20:00
- Acceso restringido: ✓ Sí
- Usuarios autorizados: Juan Pérez, María González

### Resultado en el Sistema

#### Horarios Visibles para Cada Usuario

| Hora  | Usuario Normal     | Juan Pérez              | María González          |
| ----- | ------------------ | ----------------------- | ----------------------- |
| 08:00 | ✅ Disponible      | ✅ Disponible           | ✅ Disponible           |
| 09:00 | ✅ Disponible      | ✅ Disponible           | ✅ Disponible           |
| 10:00 | ✅ Disponible      | ✅ Disponible           | ✅ Disponible           |
| ...   | ...                | ...                     | ...                     |
| 17:00 | ✅ Disponible      | ✅ Disponible           | ✅ Disponible           |
| 18:00 | ❌ No ve este slot | ✅ **EXTRA** Disponible | ✅ **EXTRA** Disponible |
| 19:00 | ❌ No ve este slot | ✅ **EXTRA** Disponible | ✅ **EXTRA** Disponible |

### Slots Generados

**Para Usuario Normal (08:00 - 18:00):**

```
08:00 - 2 cupos (normal)
09:00 - 2 cupos (normal)
10:00 - 2 cupos (normal)
11:00 - 2 cupos (normal)
12:00 - 2 cupos (normal)
13:00 - 2 cupos (normal)
14:00 - 2 cupos (normal)
15:00 - 2 cupos (normal)
16:00 - 2 cupos (normal)
17:00 - 2 cupos (normal)
```

**Para Juan/María (08:00 - 20:00):**

```
08:00 - 2 cupos (normal)
09:00 - 2 cupos (normal)
10:00 - 2 cupos (normal)
11:00 - 2 cupos (normal)
12:00 - 2 cupos (normal)
13:00 - 2 cupos (normal)
14:00 - 2 cupos (normal)
15:00 - 2 cupos (normal)
16:00 - 2 cupos (normal)
17:00 - 2 cupos (normal)
18:00 - 2 cupos (⭐ ESPECIAL - Solo autorizados)
19:00 - 2 cupos (⭐ ESPECIAL - Solo autorizados)
```

## 🔧 Lógica Implementada

### Paso 1: Generar Horarios Normales

El sistema **siempre** genera los slots normales para **todos los usuarios**.

### Paso 2: Verificar Horario Especial

Si existe un horario especial para la fecha:

- ¿Es de acceso restringido?
    - **NO:** Todos ven la extensión
    - **SÍ:** Solo usuarios autorizados ven la extensión

### Paso 3: Agregar Extensión (Solo Autorizados)

Para usuarios autorizados, el sistema agrega **solo los slots que exceden el horario normal**.

**Ejemplo:**

- Horario normal termina: 18:00
- Horario especial termina: 20:00
- **Extensión agregada:** 18:00, 19:00 (solo para autorizados)

## ✅ Ventajas de este Enfoque

1. **🔒 Control Granular**: Los admin deciden quién ve horarios extendidos
2. **📆 Normalidad**: El día funciona normal para usuarios regulares
3. **⚡ Flexibilidad**: Fácil extender horarios sin afectar a todos
4. **🎯 Selectividad**: Solo transportistas específicos ven extensiones

## 🛠️ Crear Horario Especial Correcto

### Ejemplo: Extender Viernes 21 hasta 20:00

```php
SpecialSchedule::create([
    'date' => '2025-11-21',
    'start_time' => '08:00',  // Puede coincidir con horario normal
    'end_time' => '20:00',    // La extensión (18:00-20:00)
    'interval_minutes' => 60,
    'slots_per_interval' => 2,
    'is_active' => true,
    'restricted_access' => true, // IMPORTANTE: Marcar como restringido
    'description' => 'Horario extendido viernes 21'
]);

// Autorizar transportistas
$schedule = SpecialSchedule::find(1);
$schedule->authorizedUsers()->attach([5, 7]); // IDs de Juan y María
```

## ❓ Preguntas Frecuentes

### ¿Qué pasa si el horario especial empieza antes que el normal?

El sistema agregará **todos los slots que excedan el horario normal**. Si el horario especial es 06:00-20:00 y el normal es 08:00-18:00, los autorizados verán:

- 06:00, 07:00 (extras antes)
- 08:00 - 17:00 (normal)
- 18:00, 19:00 (extras después)

### ¿Puedo hacer un horario especial público?

Sí, solo marca `restricted_access = false`. En ese caso **todos** los usuarios verán la extensión.

### ¿Puedo tener diferentes cupos en la extensión?

Sí, el horario especial define su propio `slots_per_interval`. Puede ser diferente al configurado en horarios normales.

### ¿Qué pasa si no hay horario normal configurado para ese día?

El horario especial funcionará normalmente, mostrando solo sus propios slots según la configuración de acceso.

## 🎨 Casos de Uso

### Caso 1: Viernes de Alta Demanda

- Horario normal: 08:00-18:00
- Horario especial: 08:00-21:00
- Restringido: Sí
- **Resultado:** Transportistas autorizados tienen 3 horas extra

### Caso 2: Sábado Especial (Público)

- Horario normal: No hay (sábado cerrado)
- Horario especial: 09:00-14:00
- Restringido: No
- **Resultado:** Todos pueden reservar en sábado

### Caso 3: Día Feriado con Acceso Limitado

- Horario normal: 08:00-18:00
- Horario especial: 10:00-14:00
- Restringido: Sí
- **Resultado:**
    - Usuarios normales: 08:00-18:00
    - Autorizados: 08:00-18:00 (sin cambios, porque el especial está dentro del rango normal)

---

**💡 Recuerda:** Los horarios especiales solo agregan lo que **excede** el horario normal, no lo reemplazan.
