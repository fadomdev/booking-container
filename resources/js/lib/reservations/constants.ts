import { Calendar, CheckCircle2, Package } from 'lucide-react';

export const RESERVATION_STEPS = [
    { id: 1, label: 'Fecha y Hora', icon: Calendar },
    { id: 2, label: 'Datos', icon: Package },
    { id: 3, label: 'Contenedores', icon: Package },
    { id: 4, label: 'Confirmar', icon: CheckCircle2 },
] as const;

export const MAX_SLOTS_PER_RESERVATION = 2;
export const MAX_PLATE_HISTORY = 10;
export const CONTAINER_INPUT_MAX_LENGTH = 20;
export const PLATE_INPUT_MAX_LENGTH = 6;

export type ReservationStep = (typeof RESERVATION_STEPS)[number];
