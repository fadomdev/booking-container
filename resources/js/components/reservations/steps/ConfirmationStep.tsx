import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Loader2,
    Package,
} from 'lucide-react';

interface ConfirmationStepProps {
    data: {
        reservation_date: string;
        reservation_time: string;
        booking_number: string;
        transporter_name: string;
        truck_plate: string;
        slots_requested: number;
        container_numbers: string[];
    };
    containerValidation: {
        validating: boolean;
        message: string;
    };
    errors?: Record<string, string> | null;
}

export const ConfirmationStep = ({
    data,
    containerValidation,
    errors = {},
}: ConfirmationStepProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Paso 4: Confirmar Reserva
                </CardTitle>
                <CardDescription>
                    Revisa los detalles de tu reserva antes de confirmar
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {/* Date and Time */}
                    <div className="rounded-lg border bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                            <Calendar className="h-4 w-4" />
                            Fecha y Horario
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Fecha:
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        data.reservation_date + 'T00:00:00',
                                    ).toLocaleDateString('es-CL', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        timeZone: 'America/Santiago',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Hora:
                                </span>
                                <span className="flex items-center gap-2 font-medium">
                                    <Clock className="h-4 w-4" />
                                    {data.reservation_time}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="rounded-lg border bg-card p-4">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Package className="h-4 w-4" />
                            Detalles de la Reserva
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Booking:
                                </span>
                                <span className="font-mono font-medium">
                                    {data.booking_number}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Transportista:
                                </span>
                                <span className="font-medium">
                                    {data.transporter_name}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Patente:
                                </span>
                                <span className="font-mono font-medium">
                                    {data.truck_plate}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Cupos:
                                </span>
                                <Badge variant="secondary">
                                    {data.slots_requested}{' '}
                                    {data.slots_requested === 1
                                        ? 'cupo'
                                        : 'cupos'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Containers */}
                    <div className="rounded-lg border bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-900 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            Contenedores
                        </h3>

                        <div className="space-y-2">
                            {data.container_numbers.map((container, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 rounded border border-green-200 bg-card px-3 py-2 dark:border-green-800"
                                >
                                    <Badge
                                        className="bg-green-600 text-white"
                                        variant="default"
                                    >
                                        {idx + 1}
                                    </Badge>
                                    <span className="font-mono font-medium">
                                        {container}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Message for Container Numbers */}
                    {errors?.container_numbers && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                                <div className="flex-1">
                                    <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
                                        Error al registrar contenedores:
                                    </p>
                                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                                        {errors.container_numbers
                                            .split('\n')
                                            .map((error, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-1"
                                                >
                                                    <span className="text-red-500">
                                                        •
                                                    </span>
                                                    {error}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {containerValidation.validating && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {containerValidation.message}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
