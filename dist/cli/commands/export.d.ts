/**
 * Export command implementation
 *
 * Exports SysML files to different formats (JSON, etc.)
 */
interface ExportOptions {
    output?: string;
    format: 'json' | 'ast';
}
/**
 * Export command handler.
 */
export declare function exportCommand(filePatterns: string[], options: ExportOptions): Promise<void>;
export {};
//# sourceMappingURL=export.d.ts.map