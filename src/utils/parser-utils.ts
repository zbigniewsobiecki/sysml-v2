import type { LangiumDocument } from 'langium';
import type { Diagnostic } from 'vscode-languageserver-types';
import { DocumentState, URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createSysMLServices, type SysMLServices } from '../language/sysml-module.js';
import type { RootNamespace } from '../language/generated/ast.js';

/**
 * Result of parsing a SysML document.
 */
export interface ParseResult {
    /** The parsed AST root, or undefined if parsing failed */
    ast?: RootNamespace;
    /** Lexer errors encountered during parsing */
    lexerErrors: Array<{ message: string; line: number; column: number }>;
    /** Parser errors encountered during parsing */
    parserErrors: Array<{ message: string; line: number; column: number }>;
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

// Lazy-initialized services singleton
let _services: { shared: any; SysML: SysMLServices } | undefined;

/**
 * Simplify verbose Chevrotain error messages by truncating long lists of expected alternatives.
 */
function simplifyParserError(message: string): string {
    // Chevrotain errors list all expected alternatives - truncate these
    const expectingMatch = message.match(/^Expecting[^:]*:/);
    if (!expectingMatch) return message;

    const butFoundMatch = message.match(/but found:\s*['"]?([^'"}\n]+)['"]?/i);
    const foundToken = butFoundMatch?.[1]?.trim() || "unexpected token";

    // Extract first few alternatives
    const alternatives: string[] = [];
    const altRegex = /\d+\.\s*\[([^\]]+)\]/g;
    let match;
    while ((match = altRegex.exec(message)) && alternatives.length < 5) {
        alternatives.push(match[1]);
    }

    if (alternatives.length > 0) {
        const hasMore = altRegex.exec(message) !== null;
        return `Unexpected '${foundToken}'. Expected: ${alternatives.join(", ")}${hasMore ? ", ..." : ""}`;
    }

    // Fallback: truncate if too long
    return message.length > 200 ? message.slice(0, 200) + "..." : message;
}

/**
 * Get or create the SysML language services.
 */
export function getServices(): { shared: any; SysML: SysMLServices } {
    if (!_services) {
        // Suppress Chevrotain grammar warnings during initialization
        const originalWarn = console.warn;
        console.warn = (...args: unknown[]) => {
            const msg = args[0];
            if (typeof msg === "string" && msg.includes("Ambiguous Alternatives")) {
                return;
            }
            originalWarn.apply(console, args);
        };
        try {
            _services = createSysMLServices(NodeFileSystem);
        } finally {
            console.warn = originalWarn;
        }
    }
    return _services;
}

/**
 * Parse a SysML document from a string.
 *
 * @param content - The SysML source code to parse
 * @param uri - Optional URI for the document (defaults to 'memory://document.sysml')
 * @returns ParseResult containing the AST and any errors
 */
export async function parseDocument(
    content: string,
    uri: string = 'memory://document.sysml'
): Promise<ParseResult> {
    const { shared } = getServices();
    const documentUri = URI.parse(uri);

    // Create a document from the content
    const document = shared.workspace.LangiumDocumentFactory.fromString(
        content,
        documentUri
    ) as LangiumDocument<RootNamespace>;

    // Add document to the workspace
    shared.workspace.LangiumDocuments.addDocument(document);

    // Build the document (parsing phase)
    await shared.workspace.DocumentBuilder.build([document], { validation: false });

    // Extract parse results
    const parseResult = document.parseResult;
    const lexerErrors = parseResult.lexerErrors.map((err: any) => ({
        message: err.message,
        line: err.line ?? 0,
        column: err.column ?? 0
    }));
    const parserErrors = parseResult.parserErrors.map((err: any) => ({
        message: simplifyParserError(err.message),
        line: err.token.startLine ?? 0,
        column: err.token.startColumn ?? 0
    }));

    const result: ParseResult = {
        ast: parseResult.value,
        lexerErrors,
        parserErrors,
        hasErrors: lexerErrors.length > 0 || parserErrors.length > 0
    };

    // Clean up
    shared.workspace.LangiumDocuments.deleteDocument(documentUri);

    return result;
}

/**
 * Parse and validate a SysML document from a string.
 *
 * @param content - The SysML source code to validate
 * @param uri - Optional URI for the document (defaults to 'memory://document.sysml')
 * @returns ValidationResult containing the AST and all diagnostics
 */
export async function validateDocument(
    content: string,
    uri: string = 'memory://document.sysml'
): Promise<ValidationResult> {
    const { shared } = getServices();
    const documentUri = URI.parse(uri);

    // Create a document from the content
    const document = shared.workspace.LangiumDocumentFactory.fromString(
        content,
        documentUri
    ) as LangiumDocument<RootNamespace>;

    // Add document to the workspace
    shared.workspace.LangiumDocuments.addDocument(document);

    // Build the document with validation
    await shared.workspace.DocumentBuilder.build([document], { validation: true });

    // Wait for validation to complete
    await waitForDocumentState(document, DocumentState.Validated);

    // Extract diagnostics and simplify verbose parser error messages
    const diagnostics = (document.diagnostics ?? []).map((d: Diagnostic) => ({
        ...d,
        message: simplifyParserError(d.message)
    }));

    const result: ValidationResult = {
        ast: document.parseResult.value,
        diagnostics,
        errors: diagnostics.filter((d: Diagnostic) => d.severity === 1),
        warnings: diagnostics.filter((d: Diagnostic) => d.severity === 2),
        hints: diagnostics.filter((d: Diagnostic) => d.severity === 3 || d.severity === 4),
        isValid: !diagnostics.some((d: Diagnostic) => d.severity === 1)
    };

    // Clean up
    shared.workspace.LangiumDocuments.deleteDocument(documentUri);

    return result;
}

/**
 * Parse a SysML file from disk.
 *
 * @param filePath - Path to the .sysml or .kerml file
 * @returns ParseResult containing the AST and any errors
 */
export async function parseFile(filePath: string): Promise<ParseResult> {
    getServices(); // Ensure services initialized
    const fs = await import('fs/promises');
    const path = await import('path');

    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const uri = `file://${absolutePath}`;

    return parseDocument(content, uri);
}

/**
 * Parse and validate a SysML file from disk.
 *
 * @param filePath - Path to the .sysml or .kerml file
 * @returns ValidationResult containing the AST and all diagnostics
 */
export async function validateFile(filePath: string): Promise<ValidationResult> {
    getServices(); // Ensure services initialized
    const fs = await import('fs/promises');
    const path = await import('path');

    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    const uri = `file://${absolutePath}`;

    return validateDocument(content, uri);
}

/**
 * Wait for a document to reach a specific state.
 */
async function waitForDocumentState(
    document: LangiumDocument,
    targetState: DocumentState
): Promise<void> {
    return new Promise<void>((resolve) => {
        const checkState = () => {
            if (document.state >= targetState) {
                resolve();
            } else {
                setTimeout(checkState, 10);
            }
        };
        checkState();
    });
}
