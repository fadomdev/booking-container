import { useState } from 'react';

interface BookingValidationState {
    valid: boolean | null;
    message: string;
    validating: boolean;
    fileInfo?: string | null;
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
            console.log('result.data:', result.data);
            console.log(
                'result.data?.file_info:',
                result.data?.data?.file_info,
            );

            // Format file_info if it exists in the response
            let fileInfoFormatted = null;
            if (result.data?.data?.file_info) {
                const { file, tipo_flexitank } = result.data.data.file_info;

                // format with line breaks
                if (file || tipo_flexitank) {
                    const parts = [];
                    if (file) parts.push(`File: ${file}`);
                    if (tipo_flexitank)
                        parts.push(`Tipo Flexitank: ${tipo_flexitank}`);
                    fileInfoFormatted = parts.join('\n');
                }
            }

            setValidation({
                valid: result.valid,
                message: result.message,
                validating: false,
                fileInfo: fileInfoFormatted,
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
            fileInfo: null,
        });
    };

    return {
        validation,
        validateBooking,
        resetValidation,
    };
};
