import { useState } from 'react';

interface ContainerValidationState {
    valid: boolean | null;
    message: string;
    validating: boolean;
}

interface ContainerSubmissionData {
    booking_number: string;
    container_numbers: string[];
    transporter_name: string;
    truck_plate: string;
}

interface ContainerSubmissionResult {
    success: boolean;
    notes: string;
}

export const useContainerSubmission = () => {
    const [validation, setValidation] = useState<ContainerValidationState>({
        valid: null,
        message: '',
        validating: false,
    });

    const submitContainers = async (
        data: ContainerSubmissionData,
    ): Promise<ContainerSubmissionResult> => {
        setValidation({
            valid: null,
            message: 'Guardando contenedores en el sistema...',
            validating: true,
        });

        try {
            const axios = (await import('axios')).default;
            const response = await axios.post('/reservations/send-containers', {
                booking_number: data.booking_number,
                container_numbers: data.container_numbers.map((c) =>
                    c.toUpperCase().replace(/\s/g, ''),
                ),
                transporter_name: data.transporter_name,
                truck_plate: data.truck_plate,
            });

            const result = response.data;

            if (result.has_errors) {
                setValidation({
                    valid: false,
                    message: `${result.success_count} de ${result.success_count + result.error_count} contenedores guardados.`,
                    validating: false,
                });
            } else {
                setValidation({
                    valid: true,
                    message: 'Contenedores guardados exitosamente',
                    validating: false,
                });
            }

            return {
                success: !result.has_errors,
                notes: result.notes || '',
            };
        } catch (error) {
            console.error('Error sending containers:', error);
            setValidation({
                valid: false,
                message: 'Error al guardar contenedores',
                validating: false,
            });

            return {
                success: false,
                notes: '',
            };
        }
    };

    return {
        validation,
        submitContainers,
    };
};
