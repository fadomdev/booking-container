import { useState } from 'react';

interface BookingValidationState {
    valid: boolean | null;
    message: string;
    validating: boolean;
}

export const useBookingValidation = () => {
    const [validation, setValidation] = useState<BookingValidationState>({
        valid: null,
        message: '',
        validating: false,
    });

    const validateBooking = async (bookingNumber: string): Promise<boolean> => {
        if (!bookingNumber) {
            setValidation({
                valid: false,
                message: 'El número de booking es requerido',
                validating: false,
            });
            return false;
        }

        setValidation({
            valid: null,
            message: '',
            validating: true,
        });

        try {
            const axios = (await import('axios')).default;
            const response = await axios.post(
                '/reservations/validate-booking',
                {
                    booking_number: bookingNumber,
                },
            );
            const result = response.data;

            setValidation({
                valid: result.valid,
                message: result.message,
                validating: false,
            });

            return result.valid;
        } catch {
            setValidation({
                valid: false,
                message: 'Error al validar el booking',
                validating: false,
            });
            return false;
        }
    };

    const resetValidation = () => {
        setValidation({
            valid: null,
            message: '',
            validating: false,
        });
    };

    return {
        validation,
        validateBooking,
        resetValidation,
    };
};
