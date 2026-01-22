/**
 * Multiplicity validation utilities
 *
 * Provides helpers for parsing and validating multiplicity bounds.
 */
/** Sentinel value representing an unbounded upper multiplicity (*) */
export declare const UNBOUNDED = -1;
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
export declare function parseMultiplicityBound(bound: string): number | null;
/**
 * Check if a multiplicity value represents unbounded.
 */
export declare function isUnbounded(value: number): boolean;
export interface MultiplicityValidationResult {
    isValid: boolean;
    error?: string;
    errorProperty?: 'lowerBound' | 'upperBound';
}
/**
 * Validate multiplicity bounds.
 *
 * @param lowerBound - The lower bound string (optional, defaults to 0)
 * @param upperBound - The upper bound string (required)
 * @returns Validation result with error details if invalid
 */
export declare function validateMultiplicityBounds(lowerBound: string | undefined, upperBound: string): MultiplicityValidationResult;
//# sourceMappingURL=multiplicity-checker.d.ts.map