/**
 * Multiplicity validation tests
 * Tests for multiplicity bound validation
 */

import { describe, it, expect } from 'vitest';
import { validateAndExpectDiagnostics, validateAndExpectSuccess } from '../helpers/test-utils.js';

describe('Multiplicity Validation', () => {
    describe('Valid Multiplicity Bounds', () => {
        it('should accept [0..1]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [0..1]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept [1..*]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [1..*]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept [0..*]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [0..*]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept [1]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [1]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept [*]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [*]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept [5..10]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [5..10]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept equal bounds [5..5]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [5..5]; }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Invalid Multiplicity Bounds', () => {
        it('should error when lower bound > upper bound', async () => {
            await validateAndExpectDiagnostics(`
                part def P { part x [5..1]; }
            `, {
                errors: ['Lower bound (5) cannot be greater than upper bound (1)']
            });
        });

        it('should error when lower > upper with different values', async () => {
            await validateAndExpectDiagnostics(`
                part def P { part x [10..3]; }
            `, {
                errors: ['Lower bound (10) cannot be greater than upper bound (3)']
            });
        });

        it('should error when lower is 100 and upper is 50', async () => {
            await validateAndExpectDiagnostics(`
                part def P { part x [100..50]; }
            `, {
                errors: ['Lower bound (100) cannot be greater than upper bound (50)']
            });
        });
    });

    describe('Unbounded Upper Limit', () => {
        it('should accept any lower bound with * upper', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    part a [0..*];
                    part b [1..*];
                    part c [5..*];
                    part d [100..*];
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Multiplicity in Different Contexts', () => {
        it('should validate multiplicity on attributes', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { attribute values [0..*]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should validate multiplicity on ports', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { port connections [1..5]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should error on invalid multiplicity in connection', async () => {
            await validateAndExpectDiagnostics(`
                connection def C {
                    end part source [10..5];
                }
            `, {
                errors: ['Lower bound (10) cannot be greater than upper bound (5)']
            });
        });
    });

    describe('Zero Bounds', () => {
        it('should accept [0]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [0]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept [0..0]', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [0..0]; }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Hex and Binary Bounds', () => {
        it('should validate hex bounds correctly', async () => {
            const result = await validateAndExpectSuccess(`
                part def P { part x [0x01..0xFF]; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should error on invalid hex bounds', async () => {
            await validateAndExpectDiagnostics(`
                part def P { part x [0xFF..0x01]; }
            `, {
                errors: ['Lower bound']
            });
        });
    });
});
