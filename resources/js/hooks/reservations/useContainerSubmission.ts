import axios from 'axios';
import { useState } from 'react';

interface ContainerValidationState {
    valid: boolean | null;
    message: string;
    validating: boolean;
    errors: string[];
}

interface ContainerSubmissionData {
    booking_number: string;
    container_numbers: string[];
    transporter_name: string;
    truck_plate: string;
    trucking_company: string;
    apiUrl: string;
}

interface ContainerSubmissionResult {
    success: boolean;
    notes: string;
    errors: string[];
}

export const useContainerSubmission = () => {
    const [validation, setValidation] = useState<ContainerValidationState>({
        valid: null,
        message: '',
        validating: false,
        errors: [],
    });

    const submitContainers = async (
        data: ContainerSubmissionData,
    ): Promise<ContainerSubmissionResult> => {
        setValidation({
            valid: null,
            message: 'Validando contenedores...',
            validating: true,
            errors: [],
        });

        // PASO 1: Validar contenedores localmente (duplicados en BD)
        try {
            const { data: validateResult } = await axios.post(
                '/reservations/validate-containers',
                {
                    booking_number: data.booking_number,
                    container_numbers: data.container_numbers,
                },
            );

            if (!validateResult.valid) {
                setValidation({
                    valid: false,
                    message: 'Contenedores con errores',
                    validating: false,
                    errors: validateResult.errors || ['Error de validación'],
                });
                return {
                    success: false,
                    notes: '',
                    errors: validateResult.errors || ['Error de validación'],
                };
            }
        } catch (error) {
            let errorMessage = 'Error de conexión al validar contenedores';

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 419) {
                    errorMessage =
                        'Sesión expirada. Por favor recarga la página.';
                } else if (error.response?.status === 401) {
                    errorMessage = 'No autenticado. Por favor inicia sesión.';
                } else if (error.response?.status === 422) {
                    // Validation errors from Laravel
                    const validationErrors = error.response.data?.errors;
                    if (validationErrors) {
                        const messages = Object.values(
                            validationErrors,
                        ).flat() as string[];
                        errorMessage = messages.join(', ');
                    }
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            console.error('Error validación:', error);
            setValidation({
                valid: false,
                message: 'Error al validar contenedores',
                validating: false,
                errors: [errorMessage],
            });
            return {
                success: false,
                notes: '',
                errors: [errorMessage],
            };
        }

        // PASO 2: Si la validación local pasa, enviar a API externa
        setValidation((prev) => ({
            ...prev,
            message: 'Guardando contenedores en API...',
        }));

        const errors: string[] = [];
        const cleanContainerNumbers = data.container_numbers.map((c) =>
            c.toUpperCase().replace(/\s/g, ''),
        );

        try {
            console.log('📤 Enviando contenedores a API externa:', {
                url: data.apiUrl,
                booking: data.booking_number,
                containers: cleanContainerNumbers,
            });

            const response = await fetch(data.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'crear_contenedor',
                    booking_number: data.booking_number,
                    container_numbers: cleanContainerNumbers,
                    transporter_name: data.transporter_name,
                    truck_plate: data.truck_plate.toUpperCase(),
                    trucking_company: data.trucking_company,
                }),
            });

            console.log('📥 Respuesta API externa:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
            });

            // Validar HTTP status primero
            if (!response.ok) {
                console.error(
                    '❌ HTTP Error:',
                    response.status,
                    response.statusText,
                );
                errors.push(
                    `Error HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const json = await response.json();
            console.log('📋 JSON respuesta:', json);

            // Validar success de forma robusta
            if (json?.success !== true) {
                console.error('❌ API retornó success=false');
                // Capturar todos los errores de la API
                if (
                    json?.validation_errors &&
                    Array.isArray(json.validation_errors)
                ) {
                    // Errores de validación detallados
                    for (const err of json.validation_errors) {
                        if (err.errors && Array.isArray(err.errors)) {
                            errors.push(...err.errors);
                        }
                    }
                } else if (json?.errors && Array.isArray(json.errors)) {
                    for (const err of json.errors) {
                        if (err.error) {
                            errors.push(err.error);
                        }
                    }
                } else if (json?.message) {
                    errors.push(json.message);
                } else {
                    errors.push('Error al guardar contenedores en API externa');
                }
            } else {
                console.log(
                    '✅ Contenedores guardados exitosamente en API externa',
                );
            }
        } catch (error) {
            console.error('❌ Exception al llamar API externa:', error);
            errors.push(
                'Error de conexión con la API externa. Por favor intente nuevamente.',
            );
        }

        const hasErrors = errors.length > 0;
        const summary = hasErrors
            ? 'Error al guardar contenedores'
            : 'Todos los contenedores guardados';

        setValidation({
            valid: !hasErrors,
            message: summary,
            validating: false,
            errors: errors,
        });

        // Notas simples para guardar en BD
        const notes = JSON.stringify({
            timestamp: new Date().toISOString(),
            booking: data.booking_number,
            total: data.container_numbers.length,
            containers: cleanContainerNumbers,
            success: !hasErrors,
            errors: errors,
        });

        return { success: !hasErrors, notes, errors };
    };

    return { validation, submitContainers };
};
