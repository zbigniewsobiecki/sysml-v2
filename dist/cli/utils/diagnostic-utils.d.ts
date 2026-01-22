/**
 * Diagnostic utilities
 *
 * Shared utilities for converting diagnostic severity numbers to strings
 * and other diagnostic-related operations.
 */
/** Diagnostic severity levels as defined by LSP */
export declare const DiagnosticSeverity: {
    readonly Error: 1;
    readonly Warning: 2;
    readonly Information: 3;
    readonly Hint: 4;
};
/**
 * Convert severity number to a human-readable string.
 */
export declare function severityToString(severity: number | undefined): 'error' | 'warning' | 'info' | 'hint';
/**
 * Convert severity number to SARIF level.
 */
export declare function severityToSarifLevel(severity: number | undefined): 'none' | 'note' | 'warning' | 'error';
//# sourceMappingURL=diagnostic-utils.d.ts.map