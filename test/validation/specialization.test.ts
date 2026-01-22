/**
 * Specialization validation tests
 * Tests for circular specialization detection
 */

import { describe, it, expect } from 'vitest';
import { validateAndExpectDiagnostics, validateAndExpectSuccess } from '../helpers/test-utils.js';

describe('Specialization Validation', () => {
    describe('Self-Specialization', () => {
        it('should error on self-specialization', async () => {
            await validateAndExpectDiagnostics(`
                part def A :> A;
            `, {
                errors: ["cannot specialize itself"]
            });
        });

        it('should error on self-specialization with keyword', async () => {
            await validateAndExpectDiagnostics(`
                part def B specializes B;
            `, {
                errors: ["cannot specialize itself"]
            });
        });
    });

    describe('Valid Specialization', () => {
        it('should accept specialization of different type', async () => {
            const result = await validateAndExpectSuccess(`
                part def Parent;
                part def Child :> Parent;
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept multiple specializations', async () => {
            const result = await validateAndExpectSuccess(`
                part def P1;
                part def P2;
                part def Child :> P1, P2;
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept specialization chain', async () => {
            const result = await validateAndExpectSuccess(`
                part def Grandparent;
                part def Parent :> Grandparent;
                part def Child :> Parent;
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Abstract Part Definitions', () => {
        it('should hint on empty abstract part def', async () => {
            const result = await validateAndExpectDiagnostics(`
                abstract part def EmptyAbstract { }
            `, {
                hints: ["Abstract part definition 'EmptyAbstract' has no members"]
            });
        });

        it('should not hint on abstract with members', async () => {
            const result = await validateAndExpectSuccess(`
                abstract part def WithMembers {
                    part child;
                }
            `);
            expect(result.hints.filter(h => h.message.includes('has no members')).length).toBe(0);
        });

        it('should not hint on non-abstract empty part def', async () => {
            const result = await validateAndExpectSuccess(`
                part def Empty { }
            `);
            expect(result.hints.filter(h => h.message.includes('has no members')).length).toBe(0);
        });
    });

    describe('Part Usage Hints', () => {
        it('should hint on untyped part usage', async () => {
            const result = await validateAndExpectDiagnostics(`
                part def P {
                    part untypedPart;
                }
            `, {
                hints: ["Part 'untypedPart' has no explicit type"]
            });
        });

        it('should not hint on typed part usage', async () => {
            const result = await validateAndExpectSuccess(`
                part def Component;
                part def P {
                    part typedPart : Component;
                }
            `);
            expect(result.hints.filter(h => h.message.includes('no explicit type')).length).toBe(0);
        });

        it('should not hint on anonymous part usage', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    part;
                }
            `);
            expect(result.hints.filter(h => h.message.includes('no explicit type')).length).toBe(0);
        });
    });
});
