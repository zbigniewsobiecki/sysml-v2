/**
 * Multiplicity validation utilities
 *
 * Provides helpers for parsing and validating multiplicity bounds.
 */
/** Sentinel value representing an unbounded upper multiplicity (*) */
export const UNBOUNDED = -1;
/**
 * Parse a multiplicity bound string to a number.
 *
 * Handles:
 * - '*' -> UNBOUNDED (-1)
 * - Decimal: '10' -> 10
 * - Hexadecimal: '0x10' -> 16
 * - Binary: '0b10' -> 2
 * - Octal: '0o10' -> 8
 *
 * @param bound - The bound string to parse
 * @returns The parsed number, UNBOUNDED for '*', or null if invalid
 */
export function parseMultiplicityBound(bound) {
    if (bound === '*') {
        return UNBOUNDED;
    }
    let num;
    const lowerBound = bound.toLowerCase();
    if (lowerBound.startsWith('0x')) {
        num = parseInt(bound.slice(2), 16);
    }
    else if (lowerBound.startsWith('0b')) {
        num = parseInt(bound.slice(2), 2);
    }
    else if (lowerBound.startsWith('0o')) {
        num = parseInt(bound.slice(2), 8);
    }
    else {
        num = parseInt(bound, 10);
    }
    return isNaN(num) ? null : num;
}
/**
 * Check if a multiplicity value represents unbounded.
 */
export function isUnbounded(value) {
    return value === UNBOUNDED;
}
/**
 * Validate multiplicity bounds.
 *
 * @param lowerBound - The lower bound string (optional, defaults to 0)
 * @param upperBound - The upper bound string (required)
 * @returns Validation result with error details if invalid
 */
export function validateMultiplicityBounds(lowerBound, upperBound) {
    const lowerVal = lowerBound ? parseMultiplicityBound(lowerBound) : 0;
    const upperVal = parseMultiplicityBound(upperBound);
    // Check for invalid lower bound
    if (lowerVal !== null && lowerVal < 0 && !isUnbounded(lowerVal)) {
        return {
            isValid: false,
            error: 'Lower bound cannot be negative',
            errorProperty: 'lowerBound'
        };
    }
    // Check bounds order (only if both are valid numbers and upper is not unbounded)
    if (lowerVal !== null && upperVal !== null && !isUnbounded(upperVal)) {
        if (lowerVal > upperVal) {
            return {
                isValid: false,
                error: `Lower bound (${lowerVal}) cannot be greater than upper bound (${upperVal})`
            };
        }
    }
    return { isValid: true };
}
//# sourceMappingURL=multiplicity-checker.js.map