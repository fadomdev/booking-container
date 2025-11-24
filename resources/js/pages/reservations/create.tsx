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
import { useContainerSubmission } from '@/hooks/reservations/useContainerSubmission';
import { usePlateHistory } from '@/hooks/reservations/usePlateHistory';
import AppLayout from '@/layouts/app-layout';
import { RESERVATION_STEPS } from '@/lib/reservations/constants';
import { TimeSlot } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
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

    // Custom hooks
    const { validation: bookingValidation, validateBooking } =
        useBookingValidation();
    const { validation: containerValidation, submitContainers } =
        useContainerSubmission();
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
        api_notes: '',
        file_info: '',
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
        console.log('📊 Booking Validation:', bookingValidation);
        console.log('📦 Container Validation:', containerValidation);

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

    useEffect(() => {
        console.log('Component mounted: ', bookingValidation);
    }, [bookingValidation]);

    // Submit form
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (processing || bookingValidation.validating || isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        clearErrors();

        // Send containers to API using the hook
        const result = await submitContainers({
            booking_number: data.booking_number,
            container_numbers: data.container_numbers.map((c) =>
                c.toUpperCase().replace(/\s/g, ''),
            ),
            transporter_name: data.transporter_name,
            truck_plate: data.truck_plate,
        });

        // Create complete data object with api_notes and file_info
        const submissionData = {
            ...data,
            api_notes: result.notes,
            file_info: bookingValidation.fileInfo || '',
        };

        console.log('📝 Datos completos a enviar:', submissionData);
        console.log('  - api_notes:', submissionData.api_notes);
        console.log('  - file_info:', submissionData.file_info);

        // Submit directly using Inertia router
        router.post('/reservations', submissionData, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
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

    const selectedSlot = timeSlots.find(
        (slot) => slot.time === data.reservation_time,
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
                            containerValidation={containerValidation}
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
