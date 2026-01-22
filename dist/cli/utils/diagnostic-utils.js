/**
 * Diagnostic utilities
 *
 * Shared utilities for converting diagnostic severity numbers to strings
 * and other diagnostic-related operations.
 */
/** Diagnostic severity levels as defined by LSP */
export const DiagnosticSeverity = {
    Error: 1,
    Warning: 2,
    Information: 3,
    Hint: 4
};
/**
 * Convert severity number to a human-readable string.
 */
export function severityToString(severity) {
    switch (severity) {
        case DiagnosticSeverity.Error:
            return 'error';
        case DiagnosticSeverity.Warning:
            return 'warning';
        case DiagnosticSeverity.Information:
            return 'info';
        case DiagnosticSeverity.Hint:
            return 'hint';
        default:
            return 'error';
    }
}
/**
 * Convert severity number to SARIF level.
 */
export function severityToSarifLevel(severity) {
    switch (severity) {
        case DiagnosticSeverity.Error:
            return 'error';
        case DiagnosticSeverity.Warning:
            return 'warning';
        case DiagnosticSeverity.Information:
        case DiagnosticSeverity.Hint:
            return 'note';
        default:
            return 'none';
    }
}
//# sourceMappingURL=diagnostic-utils.js.map