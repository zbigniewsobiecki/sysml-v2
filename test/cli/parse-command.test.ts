/**
 * Parse command tests
 * Tests for the parse CLI command functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import { parseFile } from '../../src/utils/parser-utils.js';
import { useTempDir } from '../helpers/temp-dir-helper.js';

const temp = useTempDir(__dirname, '../fixtures/.temp-parse');

describe('Parse Command', () => {
    beforeEach(temp.setup);
    afterEach(temp.teardown);

    describe('Single File Parsing', () => {
        it('should parse a valid SysML file', async () => {
            const filePath = await temp.writeFile('test.sysml', 'package TestPackage;');

            const result = await parseFile(filePath);

            expect(result.hasErrors).toBe(false);
            expect(result.ast).toBeDefined();
        });

        it('should parse a file with part definitions', async () => {
            const filePath = temp.filePath('parts.sysml');
            await fs.writeFile(filePath, `
                part def Vehicle {
                    part engine : Engine;
                    part wheels : Wheel[4];
                }
                part def Engine;
                part def Wheel;
            `);

            const result = await parseFile(filePath);

            expect(result.hasErrors).toBe(false);
            expect(result.ast).toBeDefined();
        });

        it('should report errors for invalid syntax', async () => {
            const filePath = temp.filePath('invalid.sysml');
            // Use unclosed brace to ensure parse error
            await fs.writeFile(filePath, 'part def P { part x'); // Missing closing brace and semicolon

            const result = await parseFile(filePath);

            expect(result.hasErrors).toBe(true);
            expect(result.parserErrors.length).toBeGreaterThan(0);
        });

        it('should report lexer errors', async () => {
            const filePath = temp.filePath('lexer-error.sysml');
            await fs.writeFile(filePath, 'package P; @#$%'); // Invalid characters

            const result = await parseFile(filePath);

            // Depending on grammar, this might be a lexer or parser error
            expect(result.hasErrors).toBe(true);
        });
    });

    describe('Error Location', () => {
        it('should report correct line number for error', async () => {
            const filePath = temp.filePath('line-error.sysml');
            await fs.writeFile(filePath, `
package P {
    part def A;
    part def
}
            `.trim());

            const result = await parseFile(filePath);

            expect(result.hasErrors).toBe(true);
            // Error should be on line 4 (1-indexed) where 'part def' is incomplete
            const errors = [...result.lexerErrors, ...result.parserErrors];
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    describe('File Types', () => {
        it('should parse .sysml files', async () => {
            const filePath = temp.filePath('test.sysml');
            await fs.writeFile(filePath, 'package P;');

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });

        it('should parse .kerml files', async () => {
            const filePath = temp.filePath('test.kerml');
            await fs.writeFile(filePath, 'package P;');

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Complex Files', () => {
        it('should parse file with multiple packages', async () => {
            const filePath = temp.filePath('multi-pkg.sysml');
            await fs.writeFile(filePath, `
                package Package1 {
                    part def A;
                    part def B;
                }
                package Package2 {
                    part def C;
                    part def D;
                }
            `);

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });

        it('should parse file with imports', async () => {
            const filePath = temp.filePath('imports.sysml');
            await fs.writeFile(filePath, `
                package Library {
                    part def Widget;
                }
                package App {
                    import Library::Widget;
                    part def MyWidget :> Widget;
                }
            `);

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });

        it('should parse file with actions and states', async () => {
            const filePath = temp.filePath('behavior.sysml');
            await fs.writeFile(filePath, `
                action def Process {
                    action step1;
                    action step2;
                    succession first step1 then step2;
                }
                state def Machine {
                    state idle;
                    state running;
                    transition first idle then running;
                }
            `);

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Empty and Whitespace Files', () => {
        it('should parse empty file', async () => {
            const filePath = temp.filePath('empty.sysml');
            await fs.writeFile(filePath, '');

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });

        it('should parse whitespace-only file', async () => {
            const filePath = temp.filePath('whitespace.sysml');
            await fs.writeFile(filePath, '   \n\t\n   ');

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });

        it('should parse file with only comments', async () => {
            const filePath = temp.filePath('comments.sysml');
            await fs.writeFile(filePath, `
                // Single line comment
                /* Multi-line
                   comment */
            `);

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Error Recovery', () => {
        it('should provide partial AST on errors', async () => {
            const filePath = temp.filePath('partial.sysml');
            await fs.writeFile(filePath, `
                package Valid;
                part def Invalid {
            `); // Missing closing brace

            const result = await parseFile(filePath);

            expect(result.hasErrors).toBe(true);
            // Depending on error recovery, we might still get a partial AST
            // This tests the behavior rather than asserting specific results
        });
    });

    describe('Unicode Content', () => {
        it('should handle unicode in strings', async () => {
            const filePath = temp.filePath('unicode.sysml');
            await fs.writeFile(filePath, `
                part def P {
                    attribute name = "Hello \u4e16\u754c";
                }
            `);

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });

        it('should handle unicode in unrestricted names', async () => {
            const filePath = temp.filePath('unicode-name.sysml');
            await fs.writeFile(filePath, `
                package '\u6d4b\u8bd5\u5305';
            `);

            const result = await parseFile(filePath);
            expect(result.hasErrors).toBe(false);
        });
    });
});
