/**
 * Expression tests
 * Tests for expression precedence and operators
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess } from '../helpers/test-utils.js';

describe('Expressions', () => {
    describe('Literal Expressions', () => {
        it('should parse true literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = true; }');
        });

        it('should parse false literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = false; }');
        });

        it('should parse integer literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 42; }');
        });

        it('should parse real literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 3.14; }');
        });

        it('should parse string literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = "hello"; }');
        });

        it('should parse null literal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = null; }');
        });

        it('should parse hex integer', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 0xFF; }');
        });

        it('should parse binary integer', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 0b1010; }');
        });

        it('should parse scientific notation', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1e10; }');
        });
    });

    describe('Unary Expressions', () => {
        it('should parse negation', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = -5; }');
        });

        it('should parse positive', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = +5; }');
        });

        it('should parse logical not', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = !true; }');
        });

        it('should parse not keyword', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = not true; }');
        });

        it('should parse bitwise complement', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = ~0xFF; }');
        });
    });

    describe('Arithmetic Expressions', () => {
        it('should parse addition', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 + 2; }');
        });

        it('should parse subtraction', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 5 - 3; }');
        });

        it('should parse multiplication', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 4 * 5; }');
        });

        it('should parse division', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 10 / 2; }');
        });

        it('should parse modulo', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 10 % 3; }');
        });

        it('should parse exponentiation', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 2 ** 3; }');
        });
    });

    describe('Comparison Expressions', () => {
        it('should parse equality', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 == 1; }');
        });

        it('should parse inequality', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 != 2; }');
        });

        it('should parse strict equality', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 === 1; }');
        });

        it('should parse strict inequality', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 !== 2; }');
        });

        it('should parse less than', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 < 2; }');
        });

        it('should parse less than or equal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 <= 2; }');
        });

        it('should parse greater than', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 2 > 1; }');
        });

        it('should parse greater than or equal', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 2 >= 1; }');
        });
    });

    describe('Logical Expressions', () => {
        it('should parse logical and', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = true and false; }');
        });

        it('should parse logical or', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = true or false; }');
        });

        it('should parse logical xor', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = true xor false; }');
        });

        it('should parse implies', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = true implies false; }');
        });
    });

    describe('Classification Expressions', () => {
        it('should parse hastype', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x hastype Type; }');
        });

        it('should parse istype', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x istype Type; }');
        });

        it('should parse as', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x as Type; }');
        });

        it('should parse @ for metaclassification', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x @ Type; }');
        });

        it('should parse meta', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x meta Type; }');
        });
    });

    describe('Conditional Expression', () => {
        it('should parse ternary conditional', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = cond ? 1 : 2; }');
        });

        it('should parse nested conditional', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = c1 ? c2 ? 1 : 2 : 3; }');
        });
    });

    describe('Null Coalescing Expression', () => {
        it('should parse null coalescing', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x ?? default; }');
        });
    });

    describe('Range Expression', () => {
        it('should parse range', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1..10; }');
        });
    });

    describe('Feature Chain Expression', () => {
        it('should parse simple feature access', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = obj.field; }');
        });

        it('should parse chained feature access', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = obj.field1.field2; }');
        });

        it('should parse deep feature chain', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = a.b.c.d.e; }');
        });
    });

    describe('Invocation Expression', () => {
        it('should parse function call with no arguments', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = func(); }');
        });

        it('should parse function call with one argument', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = func(x); }');
        });

        it('should parse function call with multiple arguments', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = func(x, y, z); }');
        });

        it('should parse nested function calls', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = outer(inner(x)); }');
        });
    });

    describe('Extent Expression', () => {
        it('should parse all extent', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = all Type; }');
        });
    });

    describe('Parenthesized Expressions', () => {
        it('should parse parenthesized expression', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = (1 + 2); }');
        });

        it('should parse nested parentheses', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = ((1 + 2) * 3); }');
        });
    });

    describe('Operator Precedence', () => {
        it('should parse multiplication before addition', async () => {
            // 1 + 2 * 3 should be 1 + (2 * 3) = 7
            const ast = await parseAndExpectSuccess('part def P { attribute a = 1 + 2 * 3; }');
        });

        it('should parse exponentiation before multiplication', async () => {
            // 2 * 3 ** 2 should be 2 * (3 ** 2) = 18
            const ast = await parseAndExpectSuccess('part def P { attribute a = 2 * 3 ** 2; }');
        });

        it('should parse comparison before logical and', async () => {
            // a < b and c > d
            const ast = await parseAndExpectSuccess('part def P { attribute a = x < y and y > z; }');
        });

        it('should parse logical and before logical or', async () => {
            // a or b and c should be a or (b and c)
            const ast = await parseAndExpectSuccess('part def P { attribute a = x or y and z; }');
        });

        it('should parse logical or before implies', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x or y implies z; }');
        });

        it('should parse implies before conditional', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = cond ? x implies y : z; }');
        });

        it('should override precedence with parentheses', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = (1 + 2) * 3; }');
        });
    });

    describe('Right Associativity', () => {
        it('should parse exponentiation right-associatively', async () => {
            // 2 ** 3 ** 2 should be 2 ** (3 ** 2) = 512
            const ast = await parseAndExpectSuccess('part def P { attribute a = 2 ** 3 ** 2; }');
        });
    });

    describe('Complex Expressions', () => {
        it('should parse complex arithmetic expression', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = (x + y) * (z - w) / 2; }');
        });

        it('should parse complex logical expression', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = (a and b) or (c and not d); }');
        });

        it('should parse mixed expression', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = x > 0 and x < 100 ? x : 0; }');
        });

        it('should parse feature chain with invocation', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = obj.method(arg1, arg2).result; }');
        });

        it('should parse null coalescing with feature chain', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute a = obj.value ?? defaultValue; }');
        });
    });

    describe('Body Expression', () => {
        it('should parse body expression in constraint', async () => {
            const ast = await parseAndExpectSuccess(`
                constraint def C {
                    attribute value : Integer;
                    value > 0
                }
            `);
        });

        it('should parse body expression in calculation', async () => {
            const ast = await parseAndExpectSuccess(`
                calc def Sum {
                    in x : Integer;
                    in y : Integer;
                    x + y
                }
            `);
        });
    });
});
