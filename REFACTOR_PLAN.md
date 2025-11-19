# Plan de Refactorización - create.tsx

## 📊 Estado Actual

- **Líneas totales**: 1,221 líneas
- **Complejidad**: Alta (componente monolítico)
- **Mantenibilidad**: Media-Baja

## 🎯 Objetivos

1. Reducir tamaño del componente principal a ~300-400 líneas
2. Mejorar reusabilidad de componentes
3. Facilitar testing unitario
4. Mejorar legibilidad del código

---

## 📁 Estructura Propuesta

```
resources/js/
├── components/
│   └── reservations/
│       ├── StepIndicator.tsx           (nuevo)
│       ├── ReservationSuccessModal.tsx (nuevo)
│       ├── PlateHistoryDialog.tsx      (nuevo)
│       └── steps/
│           ├── DateTimeStep.tsx        (nuevo)
│           ├── BookingDataStep.tsx     (nuevo)
│           ├── ContainersStep.tsx      (nuevo)
│           └── ConfirmationStep.tsx    (nuevo)
├── hooks/
│   └── reservations/
│       ├── useBookingValidation.ts     (nuevo)
│       ├── useContainerSubmission.ts   (nuevo)
│       └── usePlateHistory.ts          (nuevo)
├── lib/
│   └── reservations/
│       └── constants.ts                (nuevo)
└── pages/
    └── reservations/
        └── create.tsx                  (refactorizado)
```

---

## 🔧 Refactorizaciones Detalladas

### 1️⃣ Extraer Constantes (PRIORIDAD: ALTA)

**Archivo**: `resources/js/lib/reservations/constants.ts`

```typescript
export const RESERVATION_STEPS = [
    { id: 1, label: 'Fecha y Hora', icon: 'Calendar' },
    { id: 2, label: 'Datos', icon: 'Package' },
    { id: 3, label: 'Contenedores', icon: 'Package' },
    { id: 4, label: 'Confirmar', icon: 'CheckCircle2' },
] as const;

export const MAX_SLOTS_PER_RESERVATION = 2;
export const MAX_PLATE_HISTORY = 10;
export const CONTAINER_INPUT_MAX_LENGTH = 20;
export const PLATE_INPUT_MAX_LENGTH = 10;
```

**Impacto**:

- ✅ Elimina magic numbers
- ✅ Facilita cambios de configuración
- ✅ Mejora mantenibilidad

---

### 2️⃣ Extraer StepIndicator (PRIORIDAD: ALTA)

**Archivo**: `resources/js/components/reservations/StepIndicator.tsx`

```typescript
interface StepIndicatorProps {
    currentStep: number;
    steps: typeof RESERVATION_STEPS;
}

export const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => {
    // ... código existente ...
};
```

**Líneas reducidas**: ~52 líneas → componente separado
**Beneficios**:

- ✅ Reusable en otros flujos
- ✅ Testeable independientemente
- ✅ Más fácil de mantener

---

### 3️⃣ Extraer Custom Hooks (PRIORIDAD: ALTA)

#### A. `useBookingValidation.ts`

```typescript
export const useBookingValidation = () => {
    const [validation, setValidation] = useState({
        valid: null,
        message: '',
        validating: false,
    });

    const validateBooking = async (bookingNumber: string) => {
        // ... lógica existente ...
    };

    return { validation, validateBooking };
};
```

**Líneas reducidas**: ~40 líneas
**Beneficios**:

- ✅ Lógica separada
- ✅ Reusable en otros componentes
- ✅ Testeable con jest

#### B. `usePlateHistory.ts`

```typescript
export const usePlateHistory = () => {
    const [history, setHistory] = useState<string[]>([]);

    const loadHistory = () => {
        /* ... */
    };
    const saveToHistory = (plate: string) => {
        /* ... */
    };
    const clearHistory = () => {
        /* ... */
    };

    return { history, loadHistory, saveToHistory, clearHistory };
};
```

**Líneas reducidas**: ~30 líneas

#### C. `useContainerSubmission.ts`

```typescript
export const useContainerSubmission = () => {
    const [validation, setValidation] = useState({...});

    const submitContainers = async (data) => {
        // ... lógica de envío ...
    };

    return { validation, submitContainers };
};
```

**Líneas reducidas**: ~60 líneas

---

### 4️⃣ Extraer Steps a Componentes (PRIORIDAD: MEDIA)

#### A. `DateTimeStep.tsx`

```typescript
interface DateTimeStepProps {
    data: { reservation_date: string; reservation_time: string };
    timeSlots: TimeSlot[];
    blockedDates: string[];
    onDateChange: (date: string) => void;
    onTimeSelect: (time: string) => void;
    errors: { reservation_date?: string; reservation_time?: string };
}

export const DateTimeStep = ({ ... }: DateTimeStepProps) => {
    // Código del Step 1
};
```

**Líneas reducidas**: ~100 líneas
**Beneficios**:

- ✅ Cada paso es independiente
- ✅ Más fácil de testear
- ✅ Mejor organización

#### B. `BookingDataStep.tsx`

**Líneas reducidas**: ~120 líneas

#### C. `ContainersStep.tsx`

**Líneas reducidas**: ~90 líneas

#### D. `ConfirmationStep.tsx`

**Líneas reducidas**: ~180 líneas

---

### 5️⃣ Extraer Modales (PRIORIDAD: MEDIA)

#### A. `ReservationSuccessModal.tsx`

```typescript
interface ReservationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    reservation: CreatedReservation;
}

export const ReservationSuccessModal = ({ ... }) => {
    // ~173 líneas del modal actual
};
```

**Líneas reducidas**: ~173 líneas

#### B. `PlateHistoryDialog.tsx`

**Líneas reducidas**: ~70 líneas

---

### 6️⃣ Eliminar Código No Utilizado (PRIORIDAD: BAJA)

**Variables a revisar**:

- ✅ `totalSteps` → Usar `RESERVATION_STEPS.length`
- ⚠️ `containerValidation.valid` → No se usa para validación real

---

## 📈 Resultado Esperado

### Antes

```
create.tsx: 1,221 líneas (monolítico)
```

### Después

```
create.tsx:                    ~300 líneas (orquestador)
StepIndicator.tsx:              ~60 líneas
DateTimeStep.tsx:              ~120 líneas
BookingDataStep.tsx:           ~140 líneas
ContainersStep.tsx:            ~110 líneas
ConfirmationStep.tsx:          ~200 líneas
ReservationSuccessModal.tsx:   ~190 líneas
PlateHistoryDialog.tsx:         ~80 líneas
useBookingValidation.ts:        ~50 líneas
usePlateHistory.ts:             ~40 líneas
useContainerSubmission.ts:      ~70 líneas
constants.ts:                   ~20 líneas
-------------------------------------------
Total:                       ~1,380 líneas
```

**Sí, más líneas totales PERO:**

- ✅ Cada archivo < 200 líneas (fácil de entender)
- ✅ Componentes reusables
- ✅ Hooks testeables
- ✅ Mejor separación de responsabilidades
- ✅ Más fácil de mantener
- ✅ Mejor onboarding para nuevos desarrolladores

---

## 🚀 Plan de Implementación

### Fase 1: Constantes y Tipos (1-2 horas)

1. Crear `constants.ts`
2. Crear tipos compartidos
3. Actualizar imports en `create.tsx`

### Fase 2: Custom Hooks (3-4 horas)

1. Extraer `usePlateHistory` (más simple)
2. Extraer `useBookingValidation`
3. Extraer `useContainerSubmission`
4. Actualizar `create.tsx` para usar los hooks

### Fase 3: Componentes Pequeños (2-3 horas)

1. Extraer `StepIndicator`
2. Extraer `PlateHistoryDialog`
3. Extraer `ReservationSuccessModal`
4. Actualizar imports

### Fase 4: Steps Components (4-6 horas)

1. Extraer `DateTimeStep`
2. Extraer `BookingDataStep`
3. Extraer `ContainersStep`
4. Extraer `ConfirmationStep`
5. Actualizar lógica de navegación

### Fase 5: Testing y Validación (2-3 horas)

1. Probar cada paso individualmente
2. Probar flujo completo
3. Verificar no hay regresiones
4. Documentar cambios

**Total estimado**: 12-18 horas de trabajo

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: Romper funcionalidad existente

**Mitigación**:

- Hacer refactor incremental
- Probar después de cada cambio
- Usar git branches para cada fase
- Mantener `create-backup.tsx` como referencia

### Riesgo 2: Props drilling excesivo

**Mitigación**:

- Usar Context API si es necesario
- Considerar Zustand para estado global
- Mantener estado local donde tenga sentido

### Riesgo 3: Over-engineering

**Mitigación**:

- No extraer TODO de una vez
- Empezar con lo más crítico (hooks y constantes)
- Evaluar si cada extracción agrega valor real

---

## 🎯 Quick Wins (Implementación Inmediata)

### 1. Crear archivo de constantes (15 min)

```typescript
// resources/js/lib/reservations/constants.ts
export const RESERVATION_STEPS = [...];
export const MAX_SLOTS_PER_RESERVATION = 2;
```

### 2. Extraer StepIndicator (30 min)

Mover componente a archivo separado y actualizar import

### 3. Extraer usePlateHistory (45 min)

Hook simple que reduce ~30 líneas del componente principal

### 4. Eliminar `totalSteps` variable (5 min)

Usar `RESERVATION_STEPS.length` en su lugar

**Total Quick Wins**: ~1.5 horas
**Reducción líneas**: ~100 líneas
**Beneficio inmediato**: Código más limpio y organizado

---

## 📝 Notas Finales

Este plan es **flexible y modular**. Puedes:

- Implementar por fases
- Elegir qué refactorizar primero
- Pausar en cualquier momento sin romper nada
- Validar cada cambio antes de continuar

**Recomendación**: Empezar con "Quick Wins" para ver beneficios inmediatos sin mucho esfuerzo.
