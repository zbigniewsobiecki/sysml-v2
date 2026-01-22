/**
 * Test utilities for SysML parser tests
 */

import { parseDocument, validateDocument, type ParseResult, type ValidationResult } from '../../src/utils/parser-utils.js';
import type { RootNamespace } from '../../src/language/generated/ast.js';
import { expect } from 'vitest';

/**
 * Parse SysML code and expect no errors.
 * @param code - The SysML source code
 * @returns The parsed AST root
 */
export async function parseAndExpectSuccess(code: string): Promise<RootNamespace> {
    const result = await parseDocument(code);

    if (result.hasErrors) {
        const errors = [
            ...result.lexerErrors.map(e => `Lexer error at ${e.line}:${e.column}: ${e.message}`),
            ...result.parserErrors.map(e => `Parser error at ${e.line}:${e.column}: ${e.message}`)
        ];
        throw new Error(`Expected no parse errors, but got:\n${errors.join('\n')}`);
    }

    expect(result.ast).toBeDefined();
    return result.ast!;
}

/**
 * Parse SysML code and expect errors.
 * @param code - The SysML source code
 * @param expectedErrors - Array of expected error message substrings
 * @returns The parse result
 */
export async function parseAndExpectErrors(
    code: string,
    expectedErrors: string[] = []
): Promise<ParseResult> {
    const result = await parseDocument(code);

    expect(result.hasErrors).toBe(true);

    if (expectedErrors.length > 0) {
        const allErrors = [
            ...result.lexerErrors.map(e => e.message),
            ...result.parserErrors.map(e => e.message)
        ];

        for (const expected of expectedErrors) {
            const found = allErrors.some(err => err.includes(expected));
            if (!found) {
                throw new Error(
                    `Expected error containing "${expected}", but got:\n${allErrors.join('\n')}`
                );
            }
        }
    }

    return result;
}

/**
 * Validate SysML code and expect specific diagnostics.
 * @param code - The SysML source code
 * @param expected - Expected diagnostics by severity
 */
export async function validateAndExpectDiagnostics(
    code: string,
    expected: {
        errors?: string[];
        warnings?: string[];
        hints?: string[];
    }
): Promise<ValidationResult> {
    const result = await validateDocument(code);

    // Check errors
    if (expected.errors) {
        const errorMessages = result.errors.map(e => e.message);
        for (const expectedError of expected.errors) {
            const found = errorMessages.some(msg => msg.includes(expectedError));
            if (!found) {
                throw new Error(
                    `Expected error containing "${expectedError}", but got:\n${errorMessages.join('\n') || '(no errors)'}`
                );
            }
        }
        expect(result.errors.length).toBe(expected.errors.length);
    }

    // Check warnings
    if (expected.warnings) {
        const warningMessages = result.warnings.map(w => w.message);
        for (const expectedWarning of expected.warnings) {
            const found = warningMessages.some(msg => msg.includes(expectedWarning));
            if (!found) {
                throw new Error(
                    `Expected warning containing "${expectedWarning}", but got:\n${warningMessages.join('\n') || '(no warnings)'}`
                );
            }
        }
        expect(result.warnings.length).toBe(expected.warnings.length);
    }

    // Check hints
    if (expected.hints) {
        const hintMessages = result.hints.map(h => h.message);
        for (const expectedHint of expected.hints) {
            const found = hintMessages.some(msg => msg.includes(expectedHint));
            if (!found) {
                throw new Error(
                    `Expected hint containing "${expectedHint}", but got:\n${hintMessages.join('\n') || '(no hints)'}`
                );
            }
        }
        expect(result.hints.length).toBe(expected.hints.length);
    }

    return result;
}

/**
 * Validate SysML code and expect success (no errors).
 * @param code - The SysML source code
 * @returns The validation result
 */
export async function validateAndExpectSuccess(code: string): Promise<ValidationResult> {
    const result = await validateDocument(code);

    if (!result.isValid) {
        const errorMessages = result.errors.map(e =>
            `${e.range.start.line}:${e.range.start.character}: ${e.message}`
        );
        throw new Error(`Expected validation to pass, but got errors:\n${errorMessages.join('\n')}`);
    }

    return result;
}

/**
 * Navigate to a specific AST node using a path.
 * @param ast - The AST root
 * @param path - Dot-separated path (e.g., 'namespaceElements.0.element.body.elements.0')
 * @returns The AST node at the path
 */
export function getAstNode(ast: any, path: string): any {
    const parts = path.split('.');
    let current = ast;

    for (const part of parts) {
        if (current === undefined || current === null) {
            throw new Error(`Cannot navigate to "${part}" - current node is ${current}`);
        }

        // Handle array indices
        if (/^\d+$/.test(part)) {
            current = current[parseInt(part, 10)];
        } else {
            current = current[part];
        }
    }

    return current;
}

/**
 * Get the first element from a namespace.
 * @param ast - The AST root
 * @returns The first element's actual content (unwrapped from OwningMembership)
 */
export function getFirstElement(ast: RootNamespace): any {
    const membership = ast.namespaceElements?.[0];
    if (membership && 'element' in membership) {
        return (membership as any).element;
    }
    return membership;
}

/**
 * Get all elements from a namespace (unwrapped from OwningMembership).
 * @param ast - The AST root
 * @returns Array of unwrapped elements
 */
export function getAllElements(ast: RootNamespace): any[] {
    return (ast.namespaceElements ?? []).map(membership => {
        if ('element' in membership) {
            return (membership as any).element;
        }
        return membership;
    });
}

/**
 * Get elements from a package body.
 * @param pkg - A Package AST node (may be PackageBody due to grammar structure)
 * @returns Array of unwrapped elements
 */
export function getPackageElements(pkg: any): any[] {
    // Handle both cases:
    // 1. pkg.body.elements (if Package has body property)
    // 2. pkg.elements (if pkg is actually a PackageBody node)
    let elements: any[] | undefined;

    if (pkg.body && 'elements' in pkg.body) {
        elements = pkg.body.elements;
    } else if ('elements' in pkg) {
        elements = pkg.elements;
    }

    if (!elements) {
        return [];
    }

    return elements.map((membership: any) => {
        if ('element' in membership) {
            return membership.element;
        }
        return membership;
    });
}

/**
 * Parse document and return with unique URI to avoid caching issues.
 */
let docCounter = 0;
export async function parseWithUniqueUri(code: string): Promise<ParseResult> {
    docCounter++;
    return parseDocument(code, `memory://test-${docCounter}-${Date.now()}.sysml`);
}

/**
 * Validate document and return with unique URI to avoid caching issues.
 */
export async function validateWithUniqueUri(code: string): Promise<ValidationResult> {
    docCounter++;
    return validateDocument(code, `memory://test-${docCounter}-${Date.now()}.sysml`);
}

/**
 * Assert validation result contains an error matching substring.
 * @param result - The validation result
 * @param substring - The substring to search for in error messages
 */
export function expectErrorContaining(result: ValidationResult, substring: string): void {
    const found = result.errors.some(e => e.message.includes(substring));
    if (!found) {
        const msgs = result.errors.map(e => e.message).join('\n  ');
        throw new Error(`Expected error containing "${substring}", got:\n  ${msgs || '(none)'}`);
    }
}

/**
 * Assert validation result contains a hint matching substring.
 * @param result - The validation result
 * @param substring - The substring to search for in hint messages
 */
export function expectHintContaining(result: ValidationResult, substring: string): void {
    const found = result.hints.some(h => h.message.includes(substring));
    if (!found) {
        const msgs = result.hints.map(h => h.message).join('\n  ');
        throw new Error(`Expected hint containing "${substring}", got:\n  ${msgs || '(none)'}`);
    }
}

/**
 * Assert element matches expected type and optionally name.
 * Provides better error messages than raw type guard checks.
 * @param element - The AST element to check
 * @param typeGuard - Type guard function (e.g., isPartDefinition)
 * @param typeName - Human-readable type name for error messages
 * @param expectedName - Optional expected name property
 */
export function expectDefinitionType<T>(
    element: unknown,
    typeGuard: (el: unknown) => el is T,
    typeName: string,
    expectedName?: string
): asserts element is T {
    if (!typeGuard(element)) {
        throw new Error(`Expected ${typeName}, got ${(element as any)?.$type ?? typeof element}`);
    }
    if (expectedName !== undefined) {
        expect((element as any).name).toBe(expectedName);
    }
}
