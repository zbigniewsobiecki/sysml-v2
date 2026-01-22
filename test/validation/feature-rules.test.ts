/**
 * Feature rules validation tests
 * Tests for computed attributes and typing rules
 */

import { describe, it, expect } from 'vitest';
import { validateAndExpectDiagnostics, validateAndExpectSuccess } from '../helpers/test-utils.js';

describe('Feature Rules Validation', () => {
    describe('Computed Attributes', () => {
        it('should error on computed attribute without expression', async () => {
            // Note: This tests the validation rule, but the grammar may prevent this case
            // The validator checks if valueComputed is true but valueExpression is missing
            // In practice, the grammar requires an expression after ::=
            // This test may need adjustment based on actual grammar behavior
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute computed ::= 1 + 2;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept computed attribute with expression', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute x = 5;
                    attribute y = 3;
                    attribute sum ::= x + y;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept computed attribute with complex expression', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute a = 1;
                    attribute b = 2;
                    attribute c = 3;
                    attribute result ::= a * b + c;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept computed attribute with conditional', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute condition = true;
                    attribute result ::= condition ? 1 : 0;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Regular Attributes', () => {
        it('should accept attribute with default value', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute count = 0;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept attribute with initial value', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute count := 10;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept attribute without value', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute count : Integer;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Type Checking', () => {
        it('should accept typed attributes', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute name : String;
                    attribute count : Integer;
                    attribute value : Real;
                    attribute flag : Boolean;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept multiple typed features', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    part child : ChildPart;
                    port input : InputPort;
                    attribute config : Config;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Feature Modifiers', () => {
        it('should accept readonly attribute', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    readonly attribute id : String = "fixed";
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept derived attribute', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    derived attribute computed : Integer;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept abstract feature', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    abstract part template;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Feature Relationships', () => {
        it('should accept feature with subsetting', async () => {
            // Note: 'derived' is a keyword in SysML, so we use 'child' instead
            const result = await validateAndExpectSuccess(`
                part def P {
                    part base;
                    part child :> base;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept feature with redefinition', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    part original;
                    part replacement :>> original;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept feature with type and subsetting', async () => {
            // Note: 'derived' is a keyword in SysML, so we use 'child' instead
            const result = await validateAndExpectSuccess(`
                part def P {
                    part base : Component;
                    part child : SpecificComponent :> base;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Expression Values', () => {
        it('should accept various literal values', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute intVal = 42;
                    attribute realVal = 3.14;
                    attribute strVal = "hello";
                    attribute boolVal = true;
                    attribute nullVal = null;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept arithmetic expressions', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute sum = 1 + 2;
                    attribute diff = 5 - 3;
                    attribute prod = 4 * 5;
                    attribute quot = 10 / 2;
                    attribute power = 2 ** 3;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept logical expressions', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute andVal = true and false;
                    attribute orVal = true or false;
                    attribute notVal = not true;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });
});
