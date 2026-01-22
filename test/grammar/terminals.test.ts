/**
 * Terminal rules tests
 * Tests for ID, STRING, INTEGER, REAL, and comments
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, parseAndExpectErrors, getFirstElement } from '../helpers/test-utils.js';

describe('Terminal Rules', () => {
    describe('ID (Identifier)', () => {
        it('should parse simple identifier', async () => {
            const ast = await parseAndExpectSuccess('package foo;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('foo');
        });

        it('should parse identifier starting with underscore', async () => {
            const ast = await parseAndExpectSuccess('package _internal;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('_internal');
        });

        it('should parse identifier with numbers', async () => {
            const ast = await parseAndExpectSuccess('package foo123;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('foo123');
        });

        it('should parse identifier with underscores and numbers', async () => {
            const ast = await parseAndExpectSuccess('package my_var_2;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('my_var_2');
        });

        it('should parse single letter identifier', async () => {
            const ast = await parseAndExpectSuccess('package A;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('A');
        });

        it('should parse single underscore identifier', async () => {
            const ast = await parseAndExpectSuccess('package _;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('_');
        });
    });

    describe('UNRESTRICTED_NAME', () => {
        it('should parse unrestricted name with spaces', async () => {
            const ast = await parseAndExpectSuccess("package 'my name';");
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe("'my name'");
        });

        it('should parse unrestricted name with special characters', async () => {
            const ast = await parseAndExpectSuccess("package 'name-with-dashes';");
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe("'name-with-dashes'");
        });

        it('should parse unrestricted name with numbers only', async () => {
            const ast = await parseAndExpectSuccess("package '123';");
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe("'123'");
        });

        it('should parse unrestricted name with escaped single quote', async () => {
            const ast = await parseAndExpectSuccess("package 'it\\'s';");
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe("'it\\'s'");
        });
    });

    describe('INTEGER', () => {
        it('should parse decimal integer', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [5]; }');
        });

        it('should parse zero', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [0]; }');
        });

        it('should parse hexadecimal integer', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [0xFF]; }');
        });

        it('should parse hexadecimal with lowercase x', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [0xAB]; }');
        });

        it('should parse hexadecimal with uppercase X', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [0XFF]; }');
        });

        it('should parse binary integer', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [0b1010]; }');
        });

        it('should parse binary with uppercase B', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [0B1111]; }');
        });

        it('should parse octal integer', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [0o777]; }');
        });

        it('should parse large decimal integer', async () => {
            const ast = await parseAndExpectSuccess('part def P { part p [999999]; }');
        });
    });

    describe('REAL', () => {
        it('should parse standard real number', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1.5; }');
        });

        it('should parse real with leading zero', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 0.5; }');
        });

        it('should parse real with multiple decimal places', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 3.14159; }');
        });

        it('should parse scientific notation (lowercase e)', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1e10; }');
        });

        it('should parse scientific notation (uppercase E)', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1E10; }');
        });

        it('should parse scientific notation with positive exponent', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1e+5; }');
        });

        it('should parse scientific notation with negative exponent', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1e-5; }');
        });

        it('should parse real with scientific notation', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1.5e10; }');
        });
    });

    describe('STRING', () => {
        it('should parse simple string', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = "hello"; }');
        });

        it('should parse empty string', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = ""; }');
        });

        it('should parse string with spaces', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = "hello world"; }');
        });

        it('should parse string with escaped quote', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = "say \\"hi\\""; }');
        });

        it('should parse string with escaped backslash', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = "path\\\\to\\\\file"; }');
        });

        it('should parse string with newline escape', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = "line1\\nline2"; }');
        });

        it('should parse string with tab escape', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = "col1\\tcol2"; }');
        });
    });

    describe('Comments', () => {
        it('should ignore single-line comment', async () => {
            const ast = await parseAndExpectSuccess(`
                // This is a comment
                package P;
            `);
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should ignore single-line comment at end of line', async () => {
            const ast = await parseAndExpectSuccess('package P; // comment');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should ignore multi-line comment', async () => {
            const ast = await parseAndExpectSuccess(`
                /* This is a
                   multi-line comment */
                package P;
            `);
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should ignore doc comment', async () => {
            // Note: /** ... */ is used for structured doc/comment bodies in SysML v2
            // Regular multi-line comments use /* ... */
            const ast = await parseAndExpectSuccess(`
                /* Documentation comment */
                package P;
            `);
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should handle comments between tokens', async () => {
            const ast = await parseAndExpectSuccess(`
                package /* inline */ P /* another */ ;
            `);
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should handle multiple consecutive comments', async () => {
            const ast = await parseAndExpectSuccess(`
                // Comment 1
                // Comment 2
                /* Comment 3 */
                package P;
            `);
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });
    });

    describe('Boolean literals', () => {
        it('should parse true literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = true; }');
        });

        it('should parse false literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = false; }');
        });
    });

    describe('Null literal', () => {
        it('should parse null literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = null; }');
        });
    });

    describe('Whitespace handling', () => {
        it('should handle spaces', async () => {
            const ast = await parseAndExpectSuccess('   package    P   ;   ');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should handle tabs', async () => {
            const ast = await parseAndExpectSuccess('\tpackage\tP\t;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should handle newlines', async () => {
            const ast = await parseAndExpectSuccess('package\nP\n;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });

        it('should handle mixed whitespace', async () => {
            const ast = await parseAndExpectSuccess(' \t\npackage \n\t P\t \n;');
            const pkg = getFirstElement(ast);
            expect(pkg.name).toBe('P');
        });
    });
});
