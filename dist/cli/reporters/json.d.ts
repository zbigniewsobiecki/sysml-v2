/**
 * JSON reporter for validation results
 *
 * Outputs diagnostics in a machine-readable JSON format.
 */
import type { ValidationResult } from '../../utils/parser-utils.js';
interface FileResult {
    file: string;
    absolutePath: string;
    result: ValidationResult;
}
/**
 * Format validation results as JSON.
 */
export declare function formatJson(fileResults: FileResult[]): string;
export {};
//# sourceMappingURL=json.d.ts.map