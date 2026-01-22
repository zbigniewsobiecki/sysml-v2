/**
 * Validate command implementation
 *
 * Validates SysML files and outputs diagnostics in various formats.
 */
interface ValidateOptions {
    output?: string;
    format: 'text' | 'json' | 'sarif';
    colors: boolean;
    warnings: boolean;
    hints: boolean;
    quiet: boolean;
}
/**
 * Validate command handler.
 */
export declare function validateCommand(filePatterns: string[], options: ValidateOptions): Promise<void>;
export {};
//# sourceMappingURL=validate.d.ts.map