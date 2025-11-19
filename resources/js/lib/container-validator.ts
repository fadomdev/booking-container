/**
 * Valida el número de contenedor según el estándar ISO 6346
 * Formato: 4 letras + 7 dígitos (donde el último dígito es el verificador)
 */

interface ValidationResult {
    valid: boolean;
    error?: 'LENGTH' | 'FORMAT' | 'CHECK_DIGIT';
    message?: string;
    expectedCheckDigit?: number;
}

const letterValues: Record<string, number> = {
    A: 10,
    B: 12,
    C: 13,
    D: 14,
    E: 15,
    F: 16,
    G: 17,
    H: 18,
    I: 19,
    J: 20,
    K: 21,
    L: 23,
    M: 24,
    N: 25,
    O: 26,
    P: 27,
    Q: 28,
    R: 29,
    S: 30,
    T: 31,
    U: 32,
    V: 34,
    W: 35,
    X: 36,
    Y: 37,
    Z: 38,
};

/**
 * Valida un número de contenedor
 * @param containerNumber - Número de contenedor a validar
 * @returns Resultado de la validación
 */
export function validateContainerNumber(
    containerNumber: string,
): ValidationResult {
    // Convertir a mayúsculas y limpiar espacios
    const cleanNumber = containerNumber.toUpperCase().replace(/\s/g, '');

    // Validar longitud (debe ser 11 caracteres)
    if (cleanNumber.length !== 11) {
        return {
            valid: false,
            error: 'LENGTH',
            message:
                'El número de contenedor debe tener 11 caracteres (4 letras + 7 números)',
        };
    }

    // Extraer partes
    const letters = cleanNumber.substring(0, 4);
    const numbers = cleanNumber.substring(4);
    const checkDigit = parseInt(cleanNumber.charAt(10));

    // Validar que los primeros 4 caracteres sean letras
    if (!/^[A-Z]{4}$/.test(letters)) {
        return {
            valid: false,
            error: 'FORMAT',
            message: 'Los primeros 4 caracteres deben ser letras',
        };
    }

    // Validar que los últimos 7 caracteres sean números
    if (!/^\d{7}$/.test(numbers)) {
        return {
            valid: false,
            error: 'FORMAT',
            message: 'Los últimos 7 caracteres deben ser números',
        };
    }

    // Calcular dígito verificador
    const values: number[] = [];

    // Convertir las 4 letras a sus valores numéricos
    for (let i = 0; i < 4; i++) {
        values.push(letterValues[letters[i]]);
    }

    // Agregar los primeros 6 dígitos (sin el dígito verificador)
    for (let i = 0; i < 6; i++) {
        values.push(parseInt(numbers[i]));
    }

    // Calcular suma con potencias de 2
    let sum = 0;
    let power = 1; // 2^0

    for (let i = 0; i < values.length; i++) {
        sum += values[i] * power;
        power = power * 2; // Siguiente potencia de 2
    }

    // Calcular dígito verificador correcto
    const calculatedCheckDigit = sum - Math.floor(sum / 11) * 11;
    const finalCheckDigit =
        calculatedCheckDigit === 10 ? 0 : calculatedCheckDigit;

    // Validar dígito verificador
    if (finalCheckDigit !== checkDigit) {
        return {
            valid: false,
            error: 'CHECK_DIGIT',
            message: `El dígito verificador es incorrecto. Se esperaba: ${finalCheckDigit}`,
            expectedCheckDigit: finalCheckDigit,
        };
    }

    return {
        valid: true,
    };
}

/**
 * Obtiene el mensaje de error en español según el tipo
 */
export function getValidationErrorMessage(result: ValidationResult): string {
    if (result.valid) {
        return '';
    }

    switch (result.error) {
        case 'LENGTH':
            return 'El número de contenedor debe tener 11 caracteres (4 letras + 7 números)';
        case 'FORMAT':
            return (
                result.message ||
                'Formato inválido. Debe ser 4 letras seguidas de 7 números'
            );
        case 'CHECK_DIGIT':
            return `Dígito verificador incorrecto. Se esperaba: ${result.expectedCheckDigit}`;
        default:
            return 'Número de contenedor inválido';
    }
}

/**
 * Valida y formatea un número de contenedor
 * @param containerNumber - Número de contenedor
 * @returns Número formateado si es válido, null si no es válido
 */
export function formatContainerNumber(containerNumber: string): string | null {
    const result = validateContainerNumber(containerNumber);
    if (!result.valid) {
        return null;
    }
    return containerNumber.toUpperCase().replace(/\s/g, '');
}
