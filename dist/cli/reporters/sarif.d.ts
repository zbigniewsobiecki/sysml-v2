/**
 * SARIF reporter for validation results
 *
 * Outputs diagnostics in SARIF (Static Analysis Results Interchange Format)
 * for integration with GitHub Actions and other CI tools.
 *
 * SARIF Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */
import type { ValidationResult } from '../../utils/parser-utils.js';
interface FileResult {
    file: string;
    absolutePath: string;
    result: ValidationResult;
}
/**
 * Format validation results as SARIF.
 */
export declare function formatSarif(fileResults: FileResult[]): string;
export {};
//# sourceMappingURL=sarif.d.ts.map