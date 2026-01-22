import type { Diagnostic } from 'vscode-languageserver-types';
import { type SysMLServices } from '../language/sysml-module.js';
import type { RootNamespace } from '../language/generated/ast.js';
/**
 * Result of parsing a SysML document.
 */
export interface ParseResult {
    /** The parsed AST root, or undefined if parsing failed */
    ast?: RootNamespace;
    /** Lexer errors encountered during parsing */
    lexerErrors: Array<{
        message: string;
        line: number;
        column: number;
    }>;
    /** Parser errors encountered during parsing */
    parserErrors: Array<{
        message: string;
        line: number;
        column: number;
    }>;
    /** Whether parsing was successful (no lexer or parser errors) */
    hasErrors: boolean;
}
/**
 * Result of validating a SysML document.
 */
export interface ValidationResult {
    /** The parsed AST root */
    ast?: RootNamespace;
    /** All diagnostics (errors, warnings, hints) */
    diagnostics: Diagnostic[];
    /** Filtered errors only */
    errors: Diagnostic[];
    /** Filtered warnings only */
    warnings: Diagnostic[];
    /** Filtered hints only */
    hints: Diagnostic[];
    /** Whether validation passed (no errors) */
    isValid: boolean;
}
/**
 * Get or create the SysML language services.
 */
export declare function getServices(): {
    shared: any;
    SysML: SysMLServices;
};
/**
 * Parse a SysML document from a string.
 *
 * @param content - The SysML source code to parse
 * @param uri - Optional URI for the document (defaults to 'memory://document.sysml')
 * @returns ParseResult containing the AST and any errors
 */
export declare function parseDocument(content: string, uri?: string): Promise<ParseResult>;
/**
 * Parse and validate a SysML document from a string.
 *
 * @param content - The SysML source code to validate
 * @param uri - Optional URI for the document (defaults to 'memory://document.sysml')
 * @returns ValidationResult containing the AST and all diagnostics
 */
export declare function validateDocument(content: string, uri?: string): Promise<ValidationResult>;
/**
 * Parse a SysML file from disk.
 *
 * @param filePath - Path to the .sysml or .kerml file
 * @returns ParseResult containing the AST and any errors
 */
export declare function parseFile(filePath: string): Promise<ParseResult>;
/**
 * Parse and validate a SysML file from disk.
 *
 * @param filePath - Path to the .sysml or .kerml file
 * @returns ValidationResult containing the AST and all diagnostics
 */
export declare function validateFile(filePath: string): Promise<ValidationResult>;
//# sourceMappingURL=parser-utils.d.ts.map