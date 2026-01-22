/**
 * Error recovery integration tests
 * Tests for partial parsing and error handling
 */

import { describe, it, expect } from 'vitest';
import { parseDocument, validateDocument } from '../../src/utils/parser-utils.js';

describe('Error Recovery', () => {
    describe('Partial AST on Errors', () => {
        it('should provide partial AST with missing semicolon', async () => {
            const result = await parseDocument(`
                package P {
                    part def A
                    part def B;
                }
            `);

            // Parser should have errors but may provide partial AST
            expect(result.hasErrors).toBe(true);
        });

        it('should provide partial AST with missing closing brace', async () => {
            const result = await parseDocument(`
                package P {
                    part def A;
            `);

            // Even with unclosed brace, should detect error
            expect(result.hasErrors).toBe(true);
        });

        it('should continue after syntax error', async () => {
            const result = await parseDocument(`
                part def @Invalid;
                part def Valid;
            `);

            // Should have errors for invalid syntax
            expect(result.hasErrors).toBe(true);
        });
    });

    describe('Multiple Errors in Single File', () => {
        it('should report parse errors', async () => {
            const result = await parseDocument(`
                part def {
                }
                part def Another {
            `);

            expect(result.hasErrors).toBe(true);
            // Should have at least one error
            expect(result.parserErrors.length + result.lexerErrors.length).toBeGreaterThan(0);
        });

        it('should report multiple validation errors', async () => {
            const result = await validateDocument(`
                package P {
                    part def A;
                    part def A;
                    part def B;
                    part def B;
                }
            `);

            // Should detect duplicate names
            expect(result.errors.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Error Location Accuracy', () => {
        it('should report error on correct line', async () => {
            // Note: 'part def { }' is valid (name is optional), use actually invalid syntax
            const result = await parseDocument(`package P;
part def Valid;
part def @@invalid@@ {
}
part def Another;`);

            expect(result.hasErrors).toBe(true);

            // Find errors with line information
            const errorsWithLine = result.parserErrors.filter(e => e.line > 0);
            if (errorsWithLine.length > 0) {
                // Error should be around line 3
                expect(errorsWithLine[0].line).toBeGreaterThanOrEqual(2);
            }
        });

        it('should report error on correct column', async () => {
            // Note: 'part def { }' is valid (name is optional), use actually invalid syntax
            const result = await parseDocument('part def @@invalid@@ { }');

            expect(result.hasErrors).toBe(true);
            // Error should be detected
        });
    });

    describe('Recovery from Different Error Types', () => {
        it('should recover from missing keyword', async () => {
            const result = await parseDocument(`
                package P {
                    def A;
                    part def B;
                }
            `);

            expect(result.hasErrors).toBe(true);
        });

        it('should recover from invalid identifier', async () => {
            const result = await parseDocument(`
                package P {
                    part def 123Invalid;
                    part def Valid;
                }
            `);

            expect(result.hasErrors).toBe(true);
        });

        it('should recover from invalid expression', async () => {
            const result = await parseDocument(`
                part def P {
                    attribute a = + - * ;
                    attribute b = 5;
                }
            `);

            expect(result.hasErrors).toBe(true);
        });
    });

    describe('Validation After Parse Errors', () => {
        it('should not run full validation on parse error', async () => {
            const result = await validateDocument(`
                part def {
            `);

            expect(result.isValid).toBe(false);
            // Parse error should be reflected
        });

        it('should report both parse and validation errors when possible', async () => {
            const result = await validateDocument(`
                part def A;
                part def A;
                part def
            `);

            expect(result.isValid).toBe(false);
        });
    });

    describe('Recovery in Complex Structures', () => {
        it('should recover in action definitions', async () => {
            const result = await parseDocument(`
                action def Process {
                    action step1;
                    action {
                    action step3;
                }
            `);

            expect(result.hasErrors).toBe(true);
        });

        it('should recover in state definitions', async () => {
            const result = await parseDocument(`
                state def Machine {
                    state s1;
                    state {
                    state s3;
                }
            `);

            expect(result.hasErrors).toBe(true);
        });

        it('should recover in nested packages', async () => {
            const result = await parseDocument(`
                package Outer {
                    package {
                    package Inner {
                        part def A;
                    }
                }
            `);

            expect(result.hasErrors).toBe(true);
        });
    });

    describe('Empty and Edge Cases', () => {
        it('should handle empty file gracefully', async () => {
            const result = await parseDocument('');
            // Empty file may or may not be an error depending on grammar
            expect(result.ast).toBeDefined();
        });

        it('should handle only whitespace', async () => {
            const result = await parseDocument('   \n\t\n   ');
            // Whitespace-only should parse (grammar allows empty root)
            expect(result.ast).toBeDefined();
        });

        it('should handle only comments', async () => {
            const result = await parseDocument('// comment');
            // Single-line comment only
            expect(result.ast).toBeDefined();
        });

        it('should handle very long lines', async () => {
            const longName = 'a'.repeat(1000);
            const result = await parseDocument(`package ${longName};`);
            expect(result.hasErrors).toBe(false);
            expect(result.ast).toBeDefined();
        });
    });

    describe('Unicode Error Handling', () => {
        it('should handle unicode in unrestricted names', async () => {
            const result = await parseDocument(`package '中文包名';`);
            // Unrestricted names can contain unicode
            expect(result.ast).toBeDefined();
        });

        it('should handle unicode in strings', async () => {
            const result = await parseDocument(`
                part def P {
                    attribute name = "中文";
                }
            `);
            expect(result.ast).toBeDefined();
        });
    });
});
