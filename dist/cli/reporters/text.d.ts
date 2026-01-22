/**
 * Text reporter for validation results
 *
 * Outputs diagnostics in a human-readable format similar to eslint/tsc.
 */
import type { ValidationResult } from '../../utils/parser-utils.js';
interface FileResult {
    file: string;
    absolutePath: string;
    result: ValidationResult;
}
/**
 * Format validation results as human-readable text.
 */
export declare function formatText(fileResults: FileResult[], useColors?: boolean): string;
export {};
//# sourceMappingURL=text.d.ts.map