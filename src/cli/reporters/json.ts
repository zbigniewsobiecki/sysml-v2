/**
 * JSON reporter for validation results
 *
 * Outputs diagnostics in a machine-readable JSON format.
 */

import type { Diagnostic } from 'vscode-languageserver-types';
import type { ValidationResult } from '../../utils/parser-utils.js';
import { severityToString } from '../utils/diagnostic-utils.js';

interface FileResult {
    file: string;
    absolutePath: string;
    result: ValidationResult;
}

interface JsonDiagnostic {
    severity: 'error' | 'warning' | 'info' | 'hint';
    message: string;
    line: number;
    column: number;
    endLine: number;
    endColumn: number;
}

interface JsonFileResult {
    file: string;
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    diagnostics: JsonDiagnostic[];
}

interface JsonOutput {
    summary: {
        totalFiles: number;
        filesWithErrors: number;
        totalErrors: number;
        totalWarnings: number;
        isValid: boolean;
    };
    files: JsonFileResult[];
}

/**
 * Format validation results as JSON.
 */
export function formatJson(fileResults: FileResult[]): string {
    const output: JsonOutput = {
        summary: {
            totalFiles: fileResults.length,
            filesWithErrors: 0,
            totalErrors: 0,
            totalWarnings: 0,
            isValid: true
        },
        files: []
    };

    for (const { file, result } of fileResults) {
        const fileResult: JsonFileResult = {
            file,
            isValid: result.isValid,
            errorCount: result.errors.length,
            warningCount: result.warnings.length,
            diagnostics: result.diagnostics.map(d => convertDiagnostic(d))
        };

        output.files.push(fileResult);

        if (!result.isValid) {
            output.summary.filesWithErrors++;
            output.summary.isValid = false;
        }

        output.summary.totalErrors += result.errors.length;
        output.summary.totalWarnings += result.warnings.length;
    }

    return JSON.stringify(output, null, 2);
}

/**
 * Convert a Langium Diagnostic to our JSON format.
 */
function convertDiagnostic(diagnostic: Diagnostic): JsonDiagnostic {
    return {
        severity: severityToString(diagnostic.severity),
        message: diagnostic.message,
        line: diagnostic.range.start.line + 1,
        column: diagnostic.range.start.character + 1,
        endLine: diagnostic.range.end.line + 1,
        endColumn: diagnostic.range.end.character + 1
    };
}
