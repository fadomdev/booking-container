/**
 * Format RUT with dots and hyphen
 * Example: 12345678-9 or 12.345.678-9
 */
export function formatRut(value: string): string {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^0-9kK]/g, '');

    if (cleaned.length === 0) return '';

    // Separate body and verification digit
    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();

    // Add hyphen before verification digit
    if (body.length > 0) {
        return `${body}-${dv}`;
    }

    return cleaned;
}

/**
 * Format RUT with dots, hyphen (full format)
 * Example: 12.345.678-9
 */
export function formatRutWithDots(value: string): string {
    const cleaned = value.replace(/[^0-9kK]/g, '');

    if (cleaned.length === 0) return '';

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();

    // Add dots every 3 digits from right to left
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (body.length > 0) {
        return `${formattedBody}-${dv}`;
    }

    return cleaned;
}

/**
 * Clean RUT (remove formatting)
 */
export function cleanRut(value: string): string {
    return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
 * Validate RUT format and check digit
 */
export function validateRut(rut: string): boolean {
    const cleaned = cleanRut(rut);

    if (cleaned.length < 2) return false;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);

    // Calculate expected check digit
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const dvString =
        expectedDv === 11
            ? '0'
            : expectedDv === 10
              ? 'K'
              : expectedDv.toString();

    return dv === dvString;
}
