import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
    getValidationErrorMessage,
    validateContainerNumber,
} from '@/lib/container-validator';
import { TimeSlot } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    History,
    Package,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';

interface Props {
    timeSlots: TimeSlot[];
    selectedDate: string;
    blockedDates?: string[];
    isBlocked?: boolean;
    blockReason?: string;
}

export default function CreateReservation({
    timeSlots,
    selectedDate,
    blockedDates = [],
    isBlocked = false,
    blockReason = '',
}: Props) {
    const [bookingValidation, setBookingValidation] = useState<{
        valid: boolean | null;
        message: string;
        validating: boolean;
    }>({
        valid: null,
        message: '',
        validating: false,
    });

    const [containerValidation, setContainerValidation] = useState<{
        valid: boolean | null;
        message: string;
        validating: boolean;
    }>({
        valid: null,
        message: '',
        validating: false,
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPlateHistoryDialog, setShowPlateHistoryDialog] = useState(false);
    const [plateHistory, setPlateHistory] = useState<string[]>([]);

    const [createdReservation, setCreatedReservation] = useState<{
        reservation_date: string;
        reservation_time: string;
        booking_number: string;
        transporter_name: string;
        truck_plate: string;
        slots_reserved: number;
        container_numbers: string[];
    } | null>(null);

    const page = usePage<{
        auth: {
            user: {
                name: string;
                company?: {
                    name: string;
                };
            };
        };
        flash?: {
            success?: boolean;
            reservation?: {
                id: number;
                reservation_date: string;
                reservation_time: string;
                booking_number: string;
                transporter_name: string;
                truck_plate: string;
                slots_reserved: number;
                container_numbers: string[];
            };
        };
    }>();

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm({
            reservation_date: selectedDate,
            reservation_time: '',
            booking_number: '',
            transporter_name: page.props.auth.user.name,
            truck_plate: '',
            slots_requested: 1,
            container_numbers: [''],
            api_notes: '',
        });

    // Load plate history from localStorage
    useEffect(() => {
        const history = localStorage.getItem('truck_plate_history');
        if (history) {
            setPlateHistory(JSON.parse(history));
        }
    }, []);

    // Save plate to history when creating reservation successfully
    const savePlateToHistory = useCallback((plate: string) => {
        const cleanPlate = plate.toUpperCase();

        setPlateHistory((prevHistory) => {
            const history = [...prevHistory];

            // Remove if already exists
            const index = history.indexOf(cleanPlate);
            if (index > -1) {
                history.splice(index, 1);
            }

            // Add to beginning (most recent)
            history.unshift(cleanPlate);

            // Keep only last 10
            const updatedHistory = history.slice(0, 10);

            localStorage.setItem(
                'truck_plate_history',
                JSON.stringify(updatedHistory),
            );

            return updatedHistory;
        });
    }, []);

    // Update container_numbers array when slots_requested changes
    useEffect(() => {
        const newContainerNumbers = Array(data.slots_requested).fill('');
        setData('container_numbers', newContainerNumbers);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.slots_requested]);

    // Check if success was returned from server
    useEffect(() => {
        const flash = page.props.flash;
        if (flash?.success && flash?.reservation) {
            setCreatedReservation(flash.reservation);
            setShowSuccessModal(true);
            // Save plate to history
            if (flash.reservation.truck_plate) {
                savePlateToHistory(flash.reservation.truck_plate);
            }
        }
    }, [page.props.flash, savePlateToHistory]);

    // Reset form when date changes (when slots are refreshed)
    useEffect(() => {
        // Check if the selected time slot still has capacity
        if (data.reservation_time) {
            const slot = timeSlots.find(
                (s) => s.time === data.reservation_time,
            );
            if (!slot || slot.available_capacity === 0) {
                // Clear the selection if slot is no longer available
                setData('reservation_time', '');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeSlots, data.reservation_time]);

    const handleDateChange = (newDate: string) => {
        // Always allow navigation to the new date
        // The backend will handle showing the blocked message if needed
        setData('reservation_date', newDate);
        window.location.href = `/reservations?date=${newDate}`;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Prevent submission if booking validation is in progress
        if (bookingValidation.validating) {
            return;
        }

        // Clear all previous errors
        clearErrors();

        // Validate required fields
        let hasErrors = false;
        let firstErrorField: string | null = null;

        if (!data.reservation_date) {
            setError('reservation_date', 'La fecha es requerida');
            hasErrors = true;
            if (!firstErrorField) firstErrorField = 'reservation_date';
        }

        if (!data.reservation_time) {
            setError(
                'reservation_time',
                'Debe seleccionar un horario disponible',
            );
            hasErrors = true;
            if (!firstErrorField) firstErrorField = 'reservation_time';
        }

        if (!data.booking_number) {
            setError('booking_number', 'El número de booking es requerido');
            hasErrors = true;
            if (!firstErrorField) firstErrorField = 'booking_number';
        }

        if (!data.transporter_name || data.transporter_name.trim() === '') {
            setError(
                'transporter_name',
                'El nombre del transportista es requerido',
            );
            hasErrors = true;
            if (!firstErrorField) firstErrorField = 'transporter_name';
        }

        if (!data.truck_plate || data.truck_plate.trim() === '') {
            setError('truck_plate', 'La patente del camión es requerida');
            hasErrors = true;
            if (!firstErrorField) firstErrorField = 'truck_plate';
        }

        // Validate container numbers
        const containerNumbers = data.container_numbers.filter(
            (c) => c.trim() !== '',
        );

        if (containerNumbers.length !== data.slots_requested) {
            setError(
                'container_numbers',
                `Debe ingresar ${data.slots_requested} número(s) de contenedor`,
            );
            hasErrors = true;
            if (!firstErrorField) firstErrorField = 'container_numbers';
        }

        // Check for duplicate container numbers
        const duplicates = containerNumbers.filter(
            (item, index) =>
                containerNumbers.indexOf(item.toUpperCase()) !== index,
        );

        if (duplicates.length > 0) {
            setError(
                'container_numbers',
                'No puede haber números de contenedor duplicados',
            );
            hasErrors = true;
            if (!firstErrorField) firstErrorField = 'container_numbers';
        }

        // Validate container number format (4 letters + 7 digits)
        for (let i = 0; i < containerNumbers.length; i++) {
            const cleanNumber = containerNumbers[i]
                .toUpperCase()
                .replace(/\s/g, '');

            const validationResult = validateContainerNumber(cleanNumber);

            if (!validationResult.valid) {
                const errorMsg = getValidationErrorMessage(validationResult);
                setError(
                    'container_numbers',
                    `Contenedor #${i + 1}: ${errorMsg}`,
                );
                hasErrors = true;
                if (!firstErrorField) firstErrorField = 'container_numbers';
                break;
            }
        }

        if (hasErrors) {
            // Scroll to the first error
            if (firstErrorField === 'reservation_time') {
                // Scroll to time slots section
                const timeSlotsSection = document.querySelector(
                    '.time-slots-section',
                );
                if (timeSlotsSection) {
                    timeSlotsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            }
            return;
        }

        // Validate booking with external API before submitting
        if (data.booking_number) {
            // Show validating state
            setBookingValidation({
                valid: null,
                message: '',
                validating: true,
            });

            // Variable to store API notes
            let apiNotes = '';

            try {
                // Validate with external API only using axios (has CSRF token configured)
                const axios = (await import('axios')).default;
                const validateResponse = await axios.post(
                    '/reservations/validate-booking',
                    {
                        booking_number: data.booking_number,
                    },
                );
                const validateResult = validateResponse.data;

                setBookingValidation({
                    valid: validateResult.valid,
                    message: validateResult.message,
                    validating: false,
                });

                // If booking is invalid, stop here and show error
                if (!validateResult.valid) {
                    setError('booking_number', validateResult.message);
                    return;
                }

                // Clear any previous errors
                clearErrors('booking_number');

                // Now send containers to external API
                setContainerValidation({
                    valid: null,
                    message: 'Guardando contenedores en el sistema...',
                    validating: true,
                });

                const containersResponse = await axios.post(
                    '/reservations/send-containers',
                    {
                        booking_number: data.booking_number,
                        container_numbers: data.container_numbers.map((c) =>
                            c.toUpperCase().replace(/\s/g, ''),
                        ),
                        transporter_name: data.transporter_name,
                        truck_plate: data.truck_plate,
                    },
                );

                const containersResult = containersResponse.data;

                // Check if there were errors, but continue anyway
                if (
                    containersResult.has_errors &&
                    containersResult.errors &&
                    containersResult.errors.length > 0
                ) {
                    // Log warning message but don't stop
                    const errorMessages = containersResult.errors
                        .map(
                            (err: {
                                container: string;
                                message: string;
                                type?: string;
                            }) =>
                                `${err.container}: ${err.type ? `[${err.type}] ` : ''}${err.message}`,
                        )
                        .join('\n');

                    console.log(
                        `⚠️ Algunos contenedores no se guardaron en la API externa:\n${errorMessages}\n\nLa reserva se creará de todos modos y los errores quedarán registrados.`,
                    );
                    console.log('Notas de API:', containersResult.notes);

                    setContainerValidation({
                        valid: false,
                        message: `${containersResult.success_count} de ${containersResult.success_count + containersResult.error_count} contenedores guardados. La reserva se creará de todos modos.`,
                        validating: false,
                    });
                } else {
                    console.log('✅ Contenedores guardados exitosamente');
                    console.log('Notas de API:', containersResult.notes);

                    setContainerValidation({
                        valid: true,
                        message: 'Contenedores guardados exitosamente',
                        validating: false,
                    });
                }

                // Store notes to send with form
                if (containersResult.notes) {
                    apiNotes = containersResult.notes;
                }
            } catch (error) {
                console.error(
                    'Error validating booking or sending containers:',
                    error,
                );

                // Extract error details
                if (error && typeof error === 'object' && 'response' in error) {
                    const axiosError = error as {
                        response?: {
                            status: number;
                            data: { message?: string; notes?: string };
                        };
                    };
                    if (axiosError.response) {
                        console.error(
                            'Response status:',
                            axiosError.response.status,
                        );
                        console.error(
                            'Response data:',
                            axiosError.response.data,
                        );

                        const errorData = axiosError.response.data;
                        const errorMessage =
                            errorData?.message ||
                            'Error al procesar la información';

                        // Check if this is a booking validation error (should stop)
                        // or a container API error (should continue)
                        if (
                            axiosError.response.status === 401 ||
                            axiosError.response.status === 403
                        ) {
                            // Authentication/authorization error - stop
                            setBookingValidation({
                                valid: false,
                                message: errorMessage,
                                validating: false,
                            });
                            console.error(
                                `❌ Error ${axiosError.response.status}: ${errorMessage}`,
                            );
                            return;
                        }

                        // For other errors (500, 400 from container API), continue with reservation
                        const errorNotes =
                            errorData?.notes ||
                            `Error al conectar con la API externa:\n${errorMessage}\nFecha y hora: ${new Date().toLocaleString()}`;

                        console.log(
                            `⚠️ No se pudieron guardar los contenedores en la API externa.\n\nError: ${errorMessage}\n\nLa reserva se creará de todos modos y el error quedará registrado.`,
                        );
                        console.log('Notas de error:', errorNotes);

                        apiNotes = errorNotes;

                        setContainerValidation({
                            valid: false,
                            message:
                                'Error al guardar contenedores, pero la reserva se creará',
                            validating: false,
                        });

                        // Continue with reservation creation
                        // Fall through to submit the form
                    }
                } else {
                    // Network error or unknown error - still continue with reservation
                    const errorNotes = `Error de conexión con la API externa\nError: ${error instanceof Error ? error.message : 'Error desconocido'}\nFecha y hora: ${new Date().toLocaleString()}`;

                    console.log(
                        '⚠️ No se pudo conectar con la API externa para guardar los contenedores.\n\nLa reserva se creará de todos modos y el error quedará registrado.',
                    );
                    console.log('Notas de error:', errorNotes);

                    apiNotes = errorNotes;

                    setContainerValidation({
                        valid: false,
                        message: 'Error de conexión, pero la reserva se creará',
                        validating: false,
                    });
                }

                // Don't return here - continue with reservation creation
            }

            // Update api_notes in form data before submitting
            setData('api_notes', apiNotes);

            // Submit reservation with API notes
            // Use setTimeout to ensure setData has completed
            setTimeout(() => {
                post('/reservations', {
                    preserveScroll: true,
                    preserveState: true,
                });
            }, 0);
        } else {
            // No booking validation needed, just submit
            post('/reservations', {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const selectedSlot = timeSlots.find(
        (slot) => slot.time === data.reservation_time,
    );

    return (
        <AppLayout>
            <Head title="Nueva Reserva" />

            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Nueva Reserva
                    </h1>
                    <p className="text-muted-foreground">
                        Completa el formulario para agendar tu reserva de
                        horario
                    </p>
                </div>

                {isBlocked && (
                    <Card className="border-destructive bg-destructive/5">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <div className="flex-1">
                                <p className="font-medium text-destructive">
                                    Fecha no disponible
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {blockReason}
                                </p>
                                <p className="mt-2 text-sm font-medium text-destructive">
                                    Por favor, selecciona otra fecha disponible
                                    para continuar.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Columna izquierda: Fecha y horarios */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Seleccionar Fecha
                                    </CardTitle>
                                    <CardDescription>
                                        Elige la fecha para tu reserva
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) =>
                                            handleDateChange(e.target.value)
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                        className={
                                            isBlocked
                                                ? 'border-destructive bg-destructive/5'
                                                : ''
                                        }
                                    />
                                    {blockedDates.length > 0 && (
                                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                                                <div className="text-xs">
                                                    <p className="font-medium text-amber-900">
                                                        {blockedDates.length}{' '}
                                                        fecha(s) bloqueada(s)
                                                    </p>
                                                    <p className="mt-1 text-amber-700">
                                                        Estas fechas no están
                                                        disponibles para
                                                        reservas y no se pueden
                                                        seleccionar.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Horarios Disponibles
                                    </CardTitle>
                                    <CardDescription>
                                        Selecciona el horario que prefieras
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="time-slots-section">
                                    {timeSlots.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-8 text-center">
                                            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                            <p className="font-medium text-muted-foreground">
                                                No hay horarios disponibles
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {isBlocked
                                                    ? 'Esta fecha está bloqueada'
                                                    : 'Todos los horarios están completos o ya pasaron'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {errors.reservation_time && (
                                                <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                                                        <div>
                                                            <p className="font-semibold text-destructive">
                                                                {
                                                                    errors.reservation_time
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-sm text-destructive/80">
                                                                Por favor
                                                                selecciona uno
                                                                de los horarios
                                                                disponibles
                                                                arriba
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                {timeSlots.map((slot) => {
                                                    const isSelected =
                                                        data.reservation_time ===
                                                        slot.time;
                                                    const hasCapacity =
                                                        slot.available_capacity >
                                                        0;
                                                    const isLowCapacity =
                                                        slot.available_capacity ===
                                                            1 &&
                                                        slot.total_capacity > 1;
                                                    const capacityPercentage =
                                                        (slot.available_capacity /
                                                            slot.total_capacity) *
                                                        100;

                                                    return (
                                                        <button
                                                            key={slot.time}
                                                            type="button"
                                                            onClick={() =>
                                                                hasCapacity &&
                                                                setData(
                                                                    'reservation_time',
                                                                    slot.time,
                                                                )
                                                            }
                                                            disabled={
                                                                !hasCapacity
                                                            }
                                                            className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-primary bg-primary shadow-lg ring-2 ring-primary/20'
                                                                    : hasCapacity
                                                                      ? 'border-border bg-card hover:scale-[1.02] hover:border-primary/50 hover:shadow-md'
                                                                      : 'cursor-not-allowed border-muted bg-muted/30 opacity-60'
                                                            }`}
                                                        >
                                                            {/* Indicador de selección */}
                                                            {isSelected && (
                                                                <div className="absolute -top-2 -right-2 rounded-full bg-primary p-1 shadow-lg">
                                                                    <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                                                                </div>
                                                            )}

                                                            {/* Horario */}
                                                            <div className="flex w-full items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock
                                                                        className={`h-5 w-5 ${
                                                                            isSelected
                                                                                ? 'text-primary-foreground'
                                                                                : hasCapacity
                                                                                  ? 'text-primary'
                                                                                  : 'text-muted-foreground'
                                                                        }`}
                                                                    />
                                                                    <span
                                                                        className={`text-lg font-bold ${
                                                                            isSelected
                                                                                ? 'text-primary-foreground'
                                                                                : hasCapacity
                                                                                  ? 'text-foreground'
                                                                                  : 'text-muted-foreground line-through'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            slot.time
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {isLowCapacity && (
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="bg-amber-500 text-xs font-semibold text-white"
                                                                    >
                                                                        ¡Último!
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Cupos disponibles */}
                                                            <div className="w-full space-y-1.5">
                                                                <div className="flex items-baseline justify-between">
                                                                    <span
                                                                        className={`text-xs font-medium ${
                                                                            isSelected
                                                                                ? 'text-primary-foreground/80'
                                                                                : 'text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        Cupos
                                                                        disponibles
                                                                    </span>
                                                                    <span
                                                                        className={`text-sm font-bold ${
                                                                            isSelected
                                                                                ? 'text-primary-foreground'
                                                                                : hasCapacity
                                                                                  ? capacityPercentage <=
                                                                                    33
                                                                                      ? 'text-amber-600'
                                                                                      : 'text-green-600'
                                                                                  : 'text-destructive'
                                                                        }`}
                                                                    >
                                                                        {hasCapacity
                                                                            ? `${slot.available_capacity} de ${slot.total_capacity}`
                                                                            : 'Completo'}
                                                                    </span>
                                                                </div>

                                                                {/* Barra de progreso */}
                                                                <div
                                                                    className={`h-2 w-full overflow-hidden rounded-full ${
                                                                        isSelected
                                                                            ? 'bg-primary-foreground/20'
                                                                            : 'bg-muted'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                                            isSelected
                                                                                ? 'bg-primary-foreground'
                                                                                : hasCapacity
                                                                                  ? capacityPercentage <=
                                                                                    33
                                                                                      ? 'bg-amber-500'
                                                                                      : 'bg-green-500'
                                                                                  : 'bg-destructive'
                                                                        }`}
                                                                        style={{
                                                                            width: `${capacityPercentage}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Estado */}
                                                            {!hasCapacity && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="w-full justify-center text-xs"
                                                                >
                                                                    Sin cupos
                                                                    disponibles
                                                                </Badge>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Información adicional */}
                                            {data.reservation_time &&
                                                selectedSlot && (
                                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                                            <span className="font-medium text-primary">
                                                                Horario
                                                                seleccionado:{' '}
                                                                {
                                                                    data.reservation_time
                                                                }
                                                            </span>
                                                            <span className="ml-auto text-xs text-muted-foreground">
                                                                {
                                                                    selectedSlot.available_capacity
                                                                }{' '}
                                                                cupo(s)
                                                                restante(s)
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Columna derecha: Datos del formulario */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Datos de la Reserva</CardTitle>
                                    <CardDescription>
                                        Completa la información requerida
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="booking_number">
                                            Número de Booking *
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="booking_number"
                                                value={data.booking_number}
                                                onChange={(e) => {
                                                    setData(
                                                        'booking_number',
                                                        e.target.value,
                                                    );
                                                    setBookingValidation({
                                                        valid: null,
                                                        message: '',
                                                        validating: false,
                                                    });
                                                    clearErrors(
                                                        'booking_number',
                                                    );
                                                }}
                                                placeholder="Ej: 22769916"
                                                className="flex-1"
                                                disabled={
                                                    bookingValidation.validating
                                                }
                                            />
                                            {bookingValidation.validating && (
                                                <div className="flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
                                                    <span className="mr-2 animate-spin">
                                                        ⏳
                                                    </span>
                                                    Validando...
                                                </div>
                                            )}
                                            {!bookingValidation.validating &&
                                                bookingValidation.valid ===
                                                    true && (
                                                    <div className="flex items-center rounded-md bg-green-100 px-3 py-2 text-sm text-green-800">
                                                        ✓ Válido
                                                    </div>
                                                )}
                                        </div>
                                        {errors.booking_number && (
                                            <p className="text-sm text-destructive">
                                                {errors.booking_number}
                                            </p>
                                        )}
                                        {bookingValidation.valid === false && (
                                            <div className="rounded-lg border border-destructive bg-destructive/5 p-3">
                                                <div className="flex items-start gap-2">
                                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                                                    <div className="text-sm">
                                                        <p className="font-medium text-destructive">
                                                            Booking no válido
                                                        </p>
                                                        <p className="mt-1 text-muted-foreground">
                                                            {
                                                                bookingValidation.message
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Container validation indicator - Solo mostrar cuando está validando o es exitoso */}
                                        {containerValidation.message &&
                                            (containerValidation.validating ||
                                                containerValidation.valid) && (
                                                <div
                                                    className={`rounded-lg border p-3 ${
                                                        containerValidation.validating
                                                            ? 'border-muted bg-muted/5'
                                                            : 'border-green-500 bg-green-50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        {containerValidation.validating ? (
                                                            <div className="mt-0.5 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground" />
                                                        ) : (
                                                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                                        )}
                                                        <div className="text-sm">
                                                            <p
                                                                className={`font-medium ${
                                                                    containerValidation.validating
                                                                        ? 'text-muted-foreground'
                                                                        : 'text-green-700'
                                                                }`}
                                                            >
                                                                {containerValidation.validating
                                                                    ? 'Guardando contenedores...'
                                                                    : 'Contenedores guardados'}
                                                            </p>
                                                            <p className="mt-1 text-muted-foreground">
                                                                {
                                                                    containerValidation.message
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                    </div>{' '}
                                    <div className="space-y-2">
                                        <Label htmlFor="transporter_name">
                                            Nombre del Transportista *
                                        </Label>
                                        <Input
                                            id="transporter_name"
                                            value={data.transporter_name}
                                            onChange={(e) =>
                                                setData(
                                                    'transporter_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Juan Pérez"
                                        />
                                        {errors.transporter_name && (
                                            <p className="text-sm text-destructive">
                                                {errors.transporter_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="truck_plate">
                                            Patente del Camión *
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="truck_plate"
                                                value={data.truck_plate}
                                                onChange={(e) =>
                                                    setData(
                                                        'truck_plate',
                                                        e.target.value.toUpperCase(),
                                                    )
                                                }
                                                placeholder="ABCD12"
                                                maxLength={6}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setShowPlateHistoryDialog(
                                                        true,
                                                    )
                                                }
                                                title="Ver historial de patentes"
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {errors.truck_plate && (
                                            <p className="text-sm text-destructive">
                                                {errors.truck_plate}
                                            </p>
                                        )}
                                    </div>
                                    {selectedSlot && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="slots_requested">
                                                    Cantidad de Cupos
                                                </Label>
                                                <Select
                                                    value={data.slots_requested.toString()}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'slots_requested',
                                                            parseInt(value),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger id="slots_requested">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">
                                                            1 cupo
                                                        </SelectItem>
                                                        {selectedSlot.available_capacity >=
                                                            2 && (
                                                            <SelectItem value="2">
                                                                2 cupos
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.slots_requested && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.slots_requested}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="flex items-center gap-2">
                                                    <Package className="h-4 w-4" />
                                                    Números de Contenedor *
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Formato: 4 letras + 7
                                                    dígitos (ej: ABCD1234567)
                                                </p>
                                                {data.container_numbers.map(
                                                    (containerValue, index) => {
                                                        // Validar en tiempo real
                                                        const cleanValue =
                                                            containerValue
                                                                .toUpperCase()
                                                                .replace(
                                                                    /\s/g,
                                                                    '',
                                                                );
                                                        const validation =
                                                            cleanValue.length >
                                                            0
                                                                ? validateContainerNumber(
                                                                      cleanValue,
                                                                  )
                                                                : null;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="space-y-2"
                                                            >
                                                                <Label
                                                                    htmlFor={`container_${index}`}
                                                                    className="text-sm"
                                                                >
                                                                    Contenedor{' '}
                                                                    {index + 1}
                                                                </Label>
                                                                <div className="relative">
                                                                    <Input
                                                                        id={`container_${index}`}
                                                                        value={
                                                                            containerValue
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newContainers =
                                                                                [
                                                                                    ...data.container_numbers,
                                                                                ];
                                                                            newContainers[
                                                                                index
                                                                            ] =
                                                                                e.target.value.toUpperCase();
                                                                            setData(
                                                                                'container_numbers',
                                                                                newContainers,
                                                                            );
                                                                        }}
                                                                        placeholder="Ej: ABCD1234567"
                                                                        maxLength={
                                                                            20
                                                                        }
                                                                        className={
                                                                            validation
                                                                                ? validation.valid
                                                                                    ? 'border-green-500 pr-10'
                                                                                    : 'border-destructive pr-10'
                                                                                : ''
                                                                        }
                                                                    />
                                                                    {validation &&
                                                                        cleanValue.length ===
                                                                            11 && (
                                                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                                                {validation.valid ? (
                                                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                                                ) : (
                                                                                    <AlertCircle className="h-5 w-5 text-destructive" />
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                                {validation &&
                                                                    !validation.valid &&
                                                                    cleanValue.length ===
                                                                        11 && (
                                                                        <p className="text-xs text-destructive">
                                                                            {getValidationErrorMessage(
                                                                                validation,
                                                                            )}
                                                                        </p>
                                                                    )}
                                                                {errors[
                                                                    `container_numbers.${index}`
                                                                ] && (
                                                                    <p className="text-sm text-destructive">
                                                                        {
                                                                            errors[
                                                                                `container_numbers.${index}`
                                                                            ]
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                                {errors.container_numbers &&
                                                    typeof errors.container_numbers ===
                                                        'string' && (
                                                        <p className="text-sm text-destructive">
                                                            {
                                                                errors.container_numbers
                                                            }
                                                        </p>
                                                    )}
                                            </div>
                                        </>
                                    )}
                                    <div className="flex gap-4">
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                timeSlots.length === 0 ||
                                                bookingValidation.validating ||
                                                !data.booking_number
                                            }
                                            size="lg"
                                            className="min-w-[150px]"
                                        >
                                            {bookingValidation.validating
                                                ? 'Validando booking...'
                                                : processing
                                                  ? 'Creando Reserva...'
                                                  : 'Crear Reserva'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            onClick={() =>
                                                window.history.back()
                                            }
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            {/* Modal de Éxito */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-2xl">
                            ¡Reserva Creada Exitosamente!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Tu reserva ha sido registrada correctamente en el
                            sistema.
                        </DialogDescription>
                    </DialogHeader>

                    {createdReservation && (
                        <div className="space-y-4 py-4">
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <h3 className="mb-3 font-semibold text-foreground">
                                    Detalles de la Reserva
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            <Calendar className="mr-2 inline-block h-4 w-4" />
                                            Fecha:
                                        </span>
                                        <span className="font-medium">
                                            {new Date(
                                                createdReservation.reservation_date +
                                                    'T00:00:00',
                                            ).toLocaleDateString('es-CL', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            <Clock className="mr-2 inline-block h-4 w-4" />
                                            Horario:
                                        </span>
                                        <span className="font-medium">
                                            {
                                                createdReservation.reservation_time
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-3">
                                        <span className="text-muted-foreground">
                                            Booking:
                                        </span>
                                        <span className="font-mono font-medium">
                                            {createdReservation.booking_number}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Transportista:
                                        </span>
                                        <span className="font-medium">
                                            {
                                                createdReservation.transporter_name
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Patente:
                                        </span>
                                        <span className="font-mono font-medium">
                                            {createdReservation.truck_plate}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-3">
                                        <span className="text-muted-foreground">
                                            Cupos Reservados:
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="bg-green-100 text-green-800"
                                        >
                                            {createdReservation.slots_reserved}{' '}
                                            {createdReservation.slots_reserved ===
                                            1
                                                ? 'cupo'
                                                : 'cupos'}
                                        </Badge>
                                    </div>
                                    {createdReservation.container_numbers &&
                                        createdReservation.container_numbers
                                            .length > 0 && (
                                            <div className="border-t pt-3">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        Contenedores:
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    {createdReservation.container_numbers.map(
                                                        (container, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between rounded bg-muted px-3 py-2"
                                                            >
                                                                <span className="text-xs text-muted-foreground">
                                                                    Contenedor{' '}
                                                                    {index + 1}:
                                                                </span>
                                                                <span className="font-mono font-semibold">
                                                                    {container}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <p className="text-center text-sm text-blue-900">
                                    <strong>Importante:</strong> Guarda esta
                                    información. Puedes ver todas tus reservas
                                    en "Mis Reservas".
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowSuccessModal(false);
                                // Reload page to refresh available slots
                                window.location.href = `/reservations?date=${createdReservation?.reservation_date}`;
                            }}
                        >
                            Nueva Reserva
                        </Button>
                        <Button
                            onClick={() => {
                                window.location.href =
                                    '/reservations/my-reservations';
                            }}
                        >
                            Ver Mis Reservas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Plate History Dialog */}
            <Dialog
                open={showPlateHistoryDialog}
                onOpenChange={setShowPlateHistoryDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Historial de Patentes</DialogTitle>
                        <DialogDescription>
                            Selecciona una patente del historial
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        {plateHistory.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No hay patentes en el historial
                            </p>
                        ) : (
                            plateHistory.map((plate, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="w-full justify-start font-mono"
                                    onClick={() => {
                                        setData('truck_plate', plate);
                                        setShowPlateHistoryDialog(false);
                                    }}
                                >
                                    {plate}
                                </Button>
                            ))
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPlateHistoryDialog(false)}
                        >
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
