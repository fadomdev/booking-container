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
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    History,
    Loader2,
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
    // Wizard steps state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

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

    // Save plate to history
    const savePlateToHistory = useCallback((plate: string) => {
        const cleanPlate = plate.toUpperCase();

        setPlateHistory((prevHistory) => {
            const history = [...prevHistory];
            const index = history.indexOf(cleanPlate);
            if (index > -1) {
                history.splice(index, 1);
            }
            history.unshift(cleanPlate);

            if (history.length > 10) {
                history.pop();
            }

            localStorage.setItem(
                'truck_plate_history',
                JSON.stringify(history),
            );
            return history;
        });
    }, []);

    // Handle date change
    const handleDateChange = (newDate: string) => {
        setData('reservation_date', newDate);
        window.location.href = `/reservations?date=${newDate}`;
    };

    // Validate booking number
    const validateBooking = async () => {
        if (!data.booking_number) {
            setBookingValidation({
                valid: false,
                message: 'El número de booking es requerido',
                validating: false,
            });
            return false;
        }

        setBookingValidation({
            valid: null,
            message: '',
            validating: true,
        });

        try {
            const axios = (await import('axios')).default;
            const response = await axios.post(
                '/reservations/validate-booking',
                {
                    booking_number: data.booking_number,
                },
            );
            const result = response.data;

            setBookingValidation({
                valid: result.valid,
                message: result.message,
                validating: false,
            });

            return result.valid;
        } catch (error) {
            setBookingValidation({
                valid: false,
                message: 'Error al validar el booking',
                validating: false,
            });
            return false;
        }
    };

    // Step navigation
    const canProceedToNextStep = (): boolean => {
        switch (currentStep) {
            case 1:
                // Step 1: Date and Time
                return !!data.reservation_date && !!data.reservation_time;
            case 2:
                // Step 2: Booking, Transporter, Plate
                return (
                    !!data.booking_number &&
                    bookingValidation.valid === true &&
                    !!data.transporter_name &&
                    !!data.truck_plate
                );
            case 3:
                // Step 3: Slots and containers
                return (
                    data.slots_requested > 0 &&
                    data.container_numbers.length === data.slots_requested &&
                    data.container_numbers.every((num) => num.trim() !== '')
                );
            default:
                return false;
        }
    };

    const handleNextStep = async () => {
        clearErrors();

        if (currentStep === 2 && !bookingValidation.valid) {
            const isValid = await validateBooking();
            if (!isValid) {
                return;
            }
        }

        if (canProceedToNextStep()) {
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
        }
    };

    const handlePreviousStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    // Handle slots change
    const handleSlotsChange = (newSlots: number) => {
        setData('slots_requested', newSlots);

        const currentContainers = data.container_numbers;
        if (newSlots > currentContainers.length) {
            const additional = Array(newSlots - currentContainers.length).fill(
                '',
            );
            setData('container_numbers', [...currentContainers, ...additional]);
        } else if (newSlots < currentContainers.length) {
            setData('container_numbers', currentContainers.slice(0, newSlots));
        }
    };

    // Handle container number change
    const handleContainerChange = (index: number, value: string) => {
        const newContainers = [...data.container_numbers];
        newContainers[index] = value;
        setData('container_numbers', newContainers);
    };

    // Submit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (processing || bookingValidation.validating) {
            return;
        }

        clearErrors();

        let apiNotes = '';

        // Send containers to API
        try {
            setContainerValidation({
                valid: null,
                message: 'Guardando contenedores en el sistema...',
                validating: true,
            });

            const axios = (await import('axios')).default;
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

            if (containersResult.has_errors) {
                setContainerValidation({
                    valid: false,
                    message: `${containersResult.success_count} de ${containersResult.success_count + containersResult.error_count} contenedores guardados.`,
                    validating: false,
                });
            } else {
                setContainerValidation({
                    valid: true,
                    message: 'Contenedores guardados exitosamente',
                    validating: false,
                });
            }

            if (containersResult.notes) {
                apiNotes = containersResult.notes;
            }
        } catch (error) {
            console.error('Error sending containers:', error);
            setContainerValidation({
                valid: false,
                message: 'Error al guardar contenedores',
                validating: false,
            });
        }

        // Update api_notes and submit
        setData('api_notes', apiNotes);
        setTimeout(() => {
            post('/reservations', {
                preserveScroll: true,
                preserveState: true,
            });
        }, 0);
    };

    // Show success modal on flash success
    useEffect(() => {
        if (page.props.flash?.success && page.props.flash?.reservation) {
            setCreatedReservation(page.props.flash.reservation);
            setShowSuccessModal(true);
            savePlateToHistory(page.props.flash.reservation.truck_plate);
        }
    }, [page.props.flash, savePlateToHistory]);

    // Update container numbers when slots change
    useEffect(() => {
        const currentLength = data.container_numbers.length;
        if (currentLength !== data.slots_requested) {
            handleSlotsChange(data.slots_requested);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.slots_requested]);

    const selectedSlot = timeSlots.find(
        (slot) => slot.time === data.reservation_time,
    );

    // Step indicator component
    const StepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                                    step < currentStep
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : step === currentStep
                                          ? 'border-primary bg-primary text-white'
                                          : 'border-gray-300 bg-white text-gray-400'
                                }`}
                            >
                                {step < currentStep ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="text-sm font-semibold">
                                        {step}
                                    </span>
                                )}
                            </div>
                            <span
                                className={`mt-2 text-xs font-medium ${
                                    step <= currentStep
                                        ? 'text-gray-900'
                                        : 'text-gray-400'
                                }`}
                            >
                                {step === 1 && 'Fecha y Hora'}
                                {step === 2 && 'Datos'}
                                {step === 3 && 'Contenedores'}
                                {step === 4 && 'Confirmar'}
                            </span>
                        </div>
                        {step < 4 && (
                            <div
                                className={`mx-2 h-0.5 flex-1 transition-colors ${
                                    step < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <AppLayout>
            <Head title="Nueva Reserva" />

            <div className="mx-auto max-w-4xl space-y-6 pb-12">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Nueva Reserva
                    </h1>
                    <p className="text-muted-foreground">
                        Completa los pasos para agendar tu reserva
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

                <StepIndicator />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Date and Time */}
                    {currentStep === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Paso 1: Selecciona Fecha y Hora
                                </CardTitle>
                                <CardDescription>
                                    Elige la fecha y horario para tu reserva
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Date Selection */}
                                <div className="space-y-3">
                                    <Label htmlFor="reservation_date">
                                        Fecha de Reserva
                                    </Label>
                                    <Input
                                        id="reservation_date"
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
                                </div>

                                {/* Time Slots */}
                                <div className="space-y-3">
                                    <Label>Horarios Disponibles</Label>
                                    {timeSlots.length === 0 ? (
                                        <div className="rounded-lg border border-dashed p-8 text-center">
                                            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                No hay horarios disponibles para
                                                esta fecha
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {timeSlots.map((slot) => {
                                                const hasCapacity =
                                                    slot.available_capacity > 0;
                                                const isSelected =
                                                    data.reservation_time ===
                                                    slot.time;

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
                                                        disabled={!hasCapacity}
                                                        className={`relative rounded-lg border-2 p-4 text-left transition-all ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/5'
                                                                : hasCapacity
                                                                  ? 'border-gray-200 hover:border-primary/50'
                                                                  : 'border-gray-100 bg-gray-50 opacity-60'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-lg font-semibold">
                                                                {slot.time}
                                                            </span>
                                                            {isSelected && (
                                                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2 text-sm">
                                                            <Badge
                                                                variant={
                                                                    hasCapacity
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                            >
                                                                {
                                                                    slot.available_capacity
                                                                }{' '}
                                                                /{' '}
                                                                {
                                                                    slot.total_capacity
                                                                }{' '}
                                                                cupos
                                                            </Badge>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {errors.reservation_time && (
                                        <p className="text-sm text-destructive">
                                            {errors.reservation_time}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Booking Data */}
                    {currentStep === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Paso 2: Datos de la Reserva
                                </CardTitle>
                                <CardDescription>
                                    Ingresa el número de booking, transportista
                                    y patente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Booking Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="booking_number">
                                        Número de Booking *
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="booking_number"
                                            value={data.booking_number}
                                            onChange={(e) =>
                                                setData(
                                                    'booking_number',
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            onBlur={validateBooking}
                                            placeholder="Ej: 070ISA1201298"
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            onClick={validateBooking}
                                            disabled={
                                                bookingValidation.validating
                                            }
                                        >
                                            {bookingValidation.validating ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                'Validar'
                                            )}
                                        </Button>
                                    </div>
                                    {bookingValidation.message && (
                                        <div
                                            className={`flex items-center gap-2 text-sm ${
                                                bookingValidation.valid
                                                    ? 'text-green-600'
                                                    : 'text-destructive'
                                            }`}
                                        >
                                            {bookingValidation.valid ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4" />
                                            )}
                                            {bookingValidation.message}
                                        </div>
                                    )}
                                    {errors.booking_number && (
                                        <p className="text-sm text-destructive">
                                            {errors.booking_number}
                                        </p>
                                    )}
                                </div>

                                {/* Transporter Name */}
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
                                        placeholder="Nombre completo del conductor"
                                    />
                                    {errors.transporter_name && (
                                        <p className="text-sm text-destructive">
                                            {errors.transporter_name}
                                        </p>
                                    )}
                                </div>

                                {/* Truck Plate */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="truck_plate">
                                            Patente del Camión *
                                        </Label>
                                        {plateHistory.length > 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    setShowPlateHistoryDialog(
                                                        true,
                                                    )
                                                }
                                            >
                                                <History className="mr-2 h-4 w-4" />
                                                Historial
                                            </Button>
                                        )}
                                    </div>
                                    <Input
                                        id="truck_plate"
                                        value={data.truck_plate}
                                        onChange={(e) =>
                                            setData(
                                                'truck_plate',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="Ej: ABCD12"
                                        maxLength={10}
                                    />
                                    {errors.truck_plate && (
                                        <p className="text-sm text-destructive">
                                            {errors.truck_plate}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Slots and Containers */}
                    {currentStep === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Paso 3: Cupos y Contenedores
                                </CardTitle>
                                <CardDescription>
                                    Selecciona la cantidad de cupos e ingresa
                                    los números de contenedor
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Slots Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="slots_requested">
                                        Cantidad de Cupos *
                                    </Label>
                                    <Select
                                        value={data.slots_requested.toString()}
                                        onValueChange={(value) =>
                                            handleSlotsChange(parseInt(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona cantidad de cupos" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">
                                                1 cupo
                                            </SelectItem>
                                            <SelectItem value="2">
                                                2 cupos
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selectedSlot && (
                                        <p className="text-sm text-muted-foreground">
                                            Cupos disponibles:{' '}
                                            {selectedSlot.available_capacity} /{' '}
                                            {selectedSlot.total_capacity}
                                        </p>
                                    )}
                                </div>

                                {/* Container Numbers */}
                                <div className="space-y-3">
                                    <Label>
                                        Números de Contenedor * (
                                        {data.slots_requested}{' '}
                                        {data.slots_requested === 1
                                            ? 'contenedor'
                                            : 'contenedores'}
                                        )
                                    </Label>
                                    {data.container_numbers.map(
                                        (container, index) => (
                                            <div
                                                key={index}
                                                className="space-y-2"
                                            >
                                                <Label
                                                    htmlFor={`container_${index}`}
                                                >
                                                    Contenedor {index + 1}
                                                </Label>
                                                <Input
                                                    id={`container_${index}`}
                                                    value={container}
                                                    onChange={(e) =>
                                                        handleContainerChange(
                                                            index,
                                                            e.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    placeholder="Ej: EMCU8854404"
                                                    maxLength={20}
                                                />
                                                {(() => {
                                                    const validation =
                                                        validateContainerNumber(
                                                            container,
                                                        );
                                                    if (
                                                        container &&
                                                        !validation.valid
                                                    ) {
                                                        return (
                                                            <p className="text-sm text-destructive">
                                                                {getValidationErrorMessage(
                                                                    validation,
                                                                )}
                                                            </p>
                                                        );
                                                    }
                                                    if (
                                                        container &&
                                                        validation.valid
                                                    ) {
                                                        return (
                                                            <p className="flex items-center gap-2 text-sm text-green-600">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Formato válido
                                                            </p>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Summary */}
                    {currentStep === 4 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Paso 4: Resumen y Confirmación
                                </CardTitle>
                                <CardDescription>
                                    Revisa los datos antes de confirmar tu
                                    reserva
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {/* Date and Time */}
                                    <div className="rounded-lg border p-4">
                                        <h3 className="mb-3 font-semibold">
                                            Fecha y Hora
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Fecha:
                                                </span>
                                                <span className="font-medium">
                                                    {new Date(
                                                        data.reservation_date,
                                                    ).toLocaleDateString(
                                                        'es-CL',
                                                        {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Hora:
                                                </span>
                                                <span className="font-medium">
                                                    {data.reservation_time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Data */}
                                    <div className="rounded-lg border p-4">
                                        <h3 className="mb-3 font-semibold">
                                            Datos de la Reserva
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Booking:
                                                </span>
                                                <span className="font-medium">
                                                    {data.booking_number}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Transportista:
                                                </span>
                                                <span className="font-medium">
                                                    {data.transporter_name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Patente:
                                                </span>
                                                <span className="font-medium">
                                                    {data.truck_plate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Containers */}
                                    <div className="rounded-lg border p-4">
                                        <h3 className="mb-3 font-semibold">
                                            Contenedores ({data.slots_requested}{' '}
                                            {data.slots_requested === 1
                                                ? 'cupo'
                                                : 'cupos'}
                                            )
                                        </h3>
                                        <div className="space-y-2">
                                            {data.container_numbers.map(
                                                (container, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <Badge variant="outline">
                                                            {index + 1}
                                                        </Badge>
                                                        <span className="font-mono font-medium">
                                                            {container}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {containerValidation.validating && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {containerValidation.message}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePreviousStep}
                            disabled={currentStep === 1 || processing}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Anterior
                        </Button>

                        {currentStep < totalSteps ? (
                            <Button
                                type="button"
                                onClick={handleNextStep}
                                disabled={
                                    !canProceedToNextStep() ||
                                    isBlocked ||
                                    processing
                                }
                            >
                                Siguiente
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={processing || isBlocked}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando reserva...
                                    </>
                                ) : (
                                    'Confirmar Reserva'
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Plate History Dialog */}
            <Dialog
                open={showPlateHistoryDialog}
                onOpenChange={setShowPlateHistoryDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Historial de Patentes</DialogTitle>
                        <DialogDescription>
                            Selecciona una patente previamente utilizada
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        {plateHistory.map((plate, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    setData('truck_plate', plate);
                                    setShowPlateHistoryDialog(false);
                                }}
                                className="w-full rounded-lg border p-3 text-left hover:bg-accent"
                            >
                                <span className="font-mono font-medium">
                                    {plate}
                                </span>
                            </button>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowPlateHistoryDialog(false)}
                        >
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle className="text-center">
                            ¡Reserva Creada Exitosamente!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            Tu reserva ha sido confirmada
                        </DialogDescription>
                    </DialogHeader>
                    {createdReservation && (
                        <div className="space-y-4">
                            <div className="rounded-lg bg-muted p-4">
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Fecha:
                                        </dt>
                                        <dd className="font-medium">
                                            {new Date(
                                                createdReservation.reservation_date,
                                            ).toLocaleDateString('es-CL')}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Hora:
                                        </dt>
                                        <dd className="font-medium">
                                            {
                                                createdReservation.reservation_time
                                            }
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Booking:
                                        </dt>
                                        <dd className="font-medium">
                                            {createdReservation.booking_number}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Patente:
                                        </dt>
                                        <dd className="font-medium">
                                            {createdReservation.truck_plate}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Contenedores:
                                        </dt>
                                        <dd className="font-medium">
                                            {createdReservation.container_numbers.join(
                                                ', ',
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-center">
                        <Button
                            onClick={() => {
                                setShowSuccessModal(false);
                                window.location.href = '/reservations/my';
                            }}
                        >
                            Ver Mis Reservas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
