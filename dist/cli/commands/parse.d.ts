/**
 * Parse command implementation
 *
 * Parses SysML files and outputs the AST in various formats.
 */
interface ParseOptions {
    output?: string;
    format: 'json' | 'compact';
    colors: boolean;
}
/**
 * Parse command handler.
 */
export declare function parseCommand(filePatterns: string[], options: ParseOptions): Promise<void>;
export {};
//# sourceMappingURL=parse.d.ts.map