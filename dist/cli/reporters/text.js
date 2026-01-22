/**
 * Text reporter for validation results
 *
 * Outputs diagnostics in a human-readable format similar to eslint/tsc.
 */
import chalk from 'chalk';
import { DiagnosticSeverity } from '../utils/diagnostic-utils.js';
/**
 * Format validation results as human-readable text.
 */
export function formatText(fileResults, useColors = true) {
    const lines = [];
    const c = useColors ? chalk : { ...chalk, red: (s) => s, yellow: (s) => s, blue: (s) => s, gray: (s) => s, green: (s) => s, dim: (s) => s, underline: (s) => s };
    for (const { file, result } of fileResults) {
        const diagnostics = result.diagnostics;
        if (diagnostics.length === 0) {
            continue;
        }
        // File header
        lines.push('');
        lines.push(c.underline(file));
        // Sort diagnostics by line, then column
        const sorted = [...diagnostics].sort((a, b) => {
            const lineDiff = a.range.start.line - b.range.start.line;
            if (lineDiff !== 0)
                return lineDiff;
            return a.range.start.character - b.range.start.character;
        });
        for (const diagnostic of sorted) {
            const line = diagnostic.range.start.line + 1;
            const col = diagnostic.range.start.character + 1;
            const severity = getSeverityLabel(diagnostic.severity, c);
            const message = diagnostic.message;
            lines.push(`  ${c.dim(`${line}:${col}`)}  ${severity}  ${message}`);
        }
    }
    if (lines.length === 0) {
        return c.green('No issues found.');
    }
    return lines.join('\n');
}
/**
 * Get colored severity label.
 */
function getSeverityLabel(severity, c) {
    switch (severity) {
        case DiagnosticSeverity.Error:
            return c.red('error');
        case DiagnosticSeverity.Warning:
            return c.yellow('warning');
        case DiagnosticSeverity.Information:
            return c.blue('info');
        case DiagnosticSeverity.Hint:
            return c.gray('hint');
        default:
            return c.gray('unknown');
    }
}
//# sourceMappingURL=text.js.map