import { PlateHistoryDialog } from '@/components/reservations/PlateHistoryDialog';
import { ReservationSuccessModal } from '@/components/reservations/ReservationSuccessModal';
import { StepIndicator } from '@/components/reservations/StepIndicator';
import { BookingDataStep } from '@/components/reservations/steps/BookingDataStep';
import { ConfirmationStep } from '@/components/reservations/steps/ConfirmationStep';
import { ContainersStep } from '@/components/reservations/steps/ContainersStep';
import { DateTimeStep } from '@/components/reservations/steps/DateTimeStep';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBookingValidation } from '@/hooks/reservations/useBookingValidation';
import { usePlateHistory } from '@/hooks/reservations/usePlateHistory';
import AppLayout from '@/layouts/app-layout';
import { RESERVATION_STEPS } from '@/lib/reservations/constants';
import { TimeSlot } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

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
    isBlocked = false,
    blockReason = '',
}: Props) {
    // Wizard steps state
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPlateHistoryDialog, setShowPlateHistoryDialog] = useState(false);

    // Error state
    const [containerExistsError, setContainerExistsError] = useState<{
        [key: string]: string;
    } | null>(null);

    // Custom hooks
    const { validation: bookingValidation, validateBooking } =
        useBookingValidation();
    const { history: plateHistory, saveToHistory: savePlateToHistory } =
        usePlateHistory();

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

    // Normalize user name: uppercase, remove accents and ñ
    const normalizeText = (text: string): string => {
        return text
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/Ñ/g, 'N')
            .replace(/[^A-Z0-9 ]/g, '');
    };

    const { data, setData, processing, errors, clearErrors } = useForm({
        reservation_date: selectedDate,
        reservation_time: '',
        booking_number: '',
        transporter_name: normalizeText(page.props.auth.user.name),
        truck_plate: '',
        slots_requested: 1,
        container_numbers: [''],
        file_info: '',
        flexitank_code: '',
    });

    // Handle date change
    const handleDateChange = (newDate: string) => {
        setData('reservation_date', newDate);
        window.location.href = `/reservations?date=${newDate}`;
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
            const isValid = await validateBooking(data.booking_number);
            if (!isValid) {
                return;
            }
        }

        if (canProceedToNextStep()) {
            setCurrentStep((prev) =>
                Math.min(prev + 1, RESERVATION_STEPS.length),
            );
        }
    };

    const handlePreviousStep = () => {
        setContainerExistsError(null);
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

        if (processing || bookingValidation.validating || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        clearErrors();
        setContainerExistsError(null);

        // Pre-validar localmente: fecha, horario, capacidad y formato de contenedores
        // La llamada a la API externa (BCMS) ocurre ahora en el backend Laravel
        try {
            const prevalidationResponse = await axios.post(
                '/reservations/pre-validate',
                {
                    reservation_date: data.reservation_date,
                    reservation_time: data.reservation_time,
                    slots_requested: data.slots_requested,
                    booking_number: data.booking_number,
                    container_numbers: data.container_numbers,
                },
            );

            if (!prevalidationResponse.data.valid) {
                setContainerExistsError({
                    container_numbers: prevalidationResponse.data.message,
                });
                setIsSubmitting(false);
                return;
            }
        } catch (error: unknown) {
            const errorMsg =
                error instanceof Error
                    ? error.message
                    : (error as { response?: { data?: { message?: string } } })
                          ?.response?.data?.message ||
                      'Error al validar la reserva. Por favor intente nuevamente.';
            setContainerExistsError({
                container_numbers: errorMsg,
            });
            setIsSubmitting(false);
            return;
        }

        // Enviar al backend: Laravel crea la reserva Y llama a BCMS en la misma operación atómica.
        // Si BCMS falla, el backend hace rollback y retorna el error sin crear la reserva.
        router.post(
            '/reservations',
            {
                ...data,
                file_info: bookingValidation.fileInfo || '',
                flexitank_code: bookingValidation.flexitank_code || '',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setContainerExistsError(
                        errors.container_numbers
                            ? { container_numbers: errors.container_numbers }
                            : null,
                    );
                    setIsSubmitting(false);
                },
            },
        );
    };

    // Show success modal on flash success
    useEffect(() => {
        if (page.props.flash?.success && page.props.flash?.reservation) {
            setCreatedReservation(page.props.flash.reservation);
            setShowSuccessModal(true);
            savePlateToHistory(page.props.flash.reservation.truck_plate);
            // Reset submitting state
            setIsSubmitting(false);
        }
    }, [page.props.flash, savePlateToHistory]);

    // Keep user on step 4 if there are validation errors
    useEffect(() => {
        if (Object.keys(errors).length > 0 && currentStep !== 4) {
            setCurrentStep(4);
        }
    }, [errors, currentStep]);

    // Update container numbers when slots change
    useEffect(() => {
        const currentLength = data.container_numbers.length;
        if (currentLength !== data.slots_requested) {
            handleSlotsChange(data.slots_requested);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.slots_requested]);

    // Reset slots and containers when date or time changes
    useEffect(() => {
        // Reset to 1 slot and empty container
        setData((prev) => ({
            ...prev,
            slots_requested: 1,
            container_numbers: [''],
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.reservation_date, data.reservation_time]);

    // Get selected slot
    const selectedSlot = timeSlots.find(
        (slot) => slot.time === data.reservation_time,
    );

    // Adjust slots if they exceed available capacity when slot changes
    useEffect(() => {
        if (
            selectedSlot &&
            data.slots_requested > selectedSlot.available_capacity
        ) {
            // Reduce slots to available capacity
            const newSlots = Math.min(
                data.slots_requested,
                selectedSlot.available_capacity,
            );
            setData((prev) => ({
                ...prev,
                slots_requested: newSlots,
                container_numbers: prev.container_numbers.slice(0, newSlots),
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSlot?.available_capacity]);

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
                        <CardContent className="flex items-center gap-3">
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

                <StepIndicator currentStep={currentStep} />

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                    <Card className="border-destructive bg-destructive/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                                <div className="flex-1">
                                    <p className="mb-2 font-medium text-destructive">
                                        Error en la validación
                                    </p>
                                    <ul className="space-y-1 text-sm">
                                        {Object.entries(errors).map(
                                            ([key, message]) => (
                                                <li
                                                    key={key}
                                                    className="text-destructive"
                                                >
                                                    {message}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-6"
                >
                    {/* Step 1: Date and Time */}
                    {currentStep === 1 && (
                        <DateTimeStep
                            data={{
                                reservation_date: data.reservation_date,
                                reservation_time: data.reservation_time,
                            }}
                            timeSlots={timeSlots}
                            onDateChange={handleDateChange}
                            onTimeSelect={(time) =>
                                setData('reservation_time', time)
                            }
                            errors={errors}
                        />
                    )}

                    {/* Step 2: Booking Data */}
                    {currentStep === 2 && (
                        <BookingDataStep
                            data={{
                                booking_number: data.booking_number,
                                transporter_name: data.transporter_name,
                                truck_plate: data.truck_plate,
                            }}
                            bookingValidation={bookingValidation}
                            plateHistory={plateHistory}
                            onDataChange={(field, value) =>
                                setData(
                                    field as keyof typeof data,
                                    value as never,
                                )
                            }
                            onValidateBooking={() =>
                                validateBooking(data.booking_number)
                            }
                            onShowPlateHistory={() =>
                                setShowPlateHistoryDialog(true)
                            }
                            errors={errors}
                        />
                    )}

                    {/* Step 3: Slots and Containers */}
                    {currentStep === 3 && (
                        <ContainersStep
                            data={{
                                slots_requested: data.slots_requested,
                                container_numbers: data.container_numbers,
                            }}
                            selectedSlot={selectedSlot || null}
                            onSlotsChange={handleSlotsChange}
                            onContainerChange={handleContainerChange}
                        />
                    )}

                    {/* Step 4: Summary */}
                    {currentStep === 4 && (
                        <ConfirmationStep
                            data={data}
                            containerValidation={{
                                validating: isSubmitting,
                                message:
                                    'Registrando contenedores en el sistema externo...',
                            }}
                            errors={containerExistsError}
                        />
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePreviousStep}
                            disabled={currentStep === 1 || processing}
                            className="h-12 border-2 border-gray-300 px-6 hover:border-[#ffcc00] hover:bg-[#ffcc00]/10"
                        >
                            <ChevronLeft className="mr-2 h-5 w-5" />
                            Anterior
                        </Button>

                        {currentStep < RESERVATION_STEPS.length ? (
                            <Button
                                type="button"
                                onClick={handleNextStep}
                                disabled={
                                    !canProceedToNextStep() ||
                                    isBlocked ||
                                    processing
                                }
                                className="h-12 bg-[#ffcc00] px-8 text-base font-semibold text-black hover:bg-[#ffcc00]/90"
                            >
                                Siguiente
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSubmit(e as unknown as FormEvent);
                                }}
                                disabled={
                                    processing || isBlocked || isSubmitting
                                }
                                className="h-12 bg-[#d40511] px-8 text-base font-semibold text-white shadow-lg hover:bg-[#d40511]/90"
                            >
                                {processing || isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
            <PlateHistoryDialog
                isOpen={showPlateHistoryDialog}
                history={plateHistory}
                onClose={() => setShowPlateHistoryDialog(false)}
                onSelectPlate={(plate) => {
                    setData('truck_plate', plate);
                    setShowPlateHistoryDialog(false);
                }}
            />

            {/* Success Modal */}
            <ReservationSuccessModal
                isOpen={showSuccessModal}
                reservation={createdReservation}
                onClose={() => setShowSuccessModal(false)}
            />
        </AppLayout>
    );
}
