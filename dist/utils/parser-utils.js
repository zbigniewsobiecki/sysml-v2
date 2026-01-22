import { DocumentState, URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createSysMLServices } from '../language/sysml-module.js';
// Lazy-initialized services singleton
let _services;
/**
 * Simplify verbose Chevrotain error messages by truncating long lists of expected alternatives.
 */
function simplifyParserError(message) {
    // Chevrotain errors list all expected alternatives - truncate these
    const expectingMatch = message.match(/^Expecting[^:]*:/);
    if (!expectingMatch)
        return message;
    const butFoundMatch = message.match(/but found:\s*['"]?([^'"}\n]+)['"]?/i);
    const foundToken = butFoundMatch?.[1]?.trim() || "unexpected token";
    // Extract first few alternatives
    const alternatives = [];
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
export function getServices() {
    if (!_services) {
        // Suppress Chevrotain grammar warnings during initialization
        const originalWarn = console.warn;
        console.warn = (...args) => {
            const msg = args[0];
            if (typeof msg === "string" && msg.includes("Ambiguous Alternatives")) {
                return;
            }
            originalWarn.apply(console, args);
        };
        try {
            _services = createSysMLServices(NodeFileSystem);
        }
        finally {
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
export async function parseDocument(content, uri = 'memory://document.sysml') {
    const { shared } = getServices();
    const documentUri = URI.parse(uri);
    // Create a document from the content
    const document = shared.workspace.LangiumDocumentFactory.fromString(content, documentUri);
    // Add document to the workspace
    shared.workspace.LangiumDocuments.addDocument(document);
    // Build the document (parsing phase)
    await shared.workspace.DocumentBuilder.build([document], { validation: false });
    // Extract parse results
    const parseResult = document.parseResult;
    const lexerErrors = parseResult.lexerErrors.map((err) => ({
        message: err.message,
        line: err.line ?? 0,
        column: err.column ?? 0
    }));
    const parserErrors = parseResult.parserErrors.map((err) => ({
        message: simplifyParserError(err.message),
        line: err.token.startLine ?? 0,
        column: err.token.startColumn ?? 0
    }));
    const result = {
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
export async function validateDocument(content, uri = 'memory://document.sysml') {
    const { shared } = getServices();
    const documentUri = URI.parse(uri);
    // Create a document from the content
    const document = shared.workspace.LangiumDocumentFactory.fromString(content, documentUri);
    // Add document to the workspace
    shared.workspace.LangiumDocuments.addDocument(document);
    // Build the document with validation
    await shared.workspace.DocumentBuilder.build([document], { validation: true });
    // Wait for validation to complete
    await waitForDocumentState(document, DocumentState.Validated);
    // Extract diagnostics and simplify verbose parser error messages
    const diagnostics = (document.diagnostics ?? []).map((d) => ({
        ...d,
        message: simplifyParserError(d.message)
    }));
    const result = {
        ast: document.parseResult.value,
        diagnostics,
        errors: diagnostics.filter((d) => d.severity === 1),
        warnings: diagnostics.filter((d) => d.severity === 2),
        hints: diagnostics.filter((d) => d.severity === 3 || d.severity === 4),
        isValid: !diagnostics.some((d) => d.severity === 1)
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
export async function parseFile(filePath) {
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
export async function validateFile(filePath) {
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
async function waitForDocumentState(document, targetState) {
    return new Promise((resolve) => {
        const checkState = () => {
            if (document.state >= targetState) {
                resolve();
            }
            else {
                setTimeout(checkState, 10);
            }
        };
        checkState();
    });
}
//# sourceMappingURL=parser-utils.js.map