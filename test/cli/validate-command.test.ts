/**
 * Validate command tests
 * Tests for the validate CLI command functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import { validateFile } from '../../src/utils/parser-utils.js';
import { useTempDir } from '../helpers/temp-dir-helper.js';

const temp = useTempDir(__dirname, '../fixtures/.temp-validate');

describe('Validate Command', () => {
    beforeEach(temp.setup);
    afterEach(temp.teardown);

    describe('Valid Files', () => {
        it('should validate a correct SysML file', async () => {
            const filePath = temp.filePath('valid.sysml');
            await fs.writeFile(filePath, `
                package ValidPackage {
                    part def Component;
                    part def System {
                        part child : Component;
                    }
                }
            `);

            const result = await validateFile(filePath);

            expect(result.isValid).toBe(true);
            expect(result.errors.length).toBe(0);
        });

        it('should validate file with specializations', async () => {
            const filePath = temp.filePath('specialization.sysml');
            await fs.writeFile(filePath, `
                part def Base;
                part def Derived :> Base;
            `);

            const result = await validateFile(filePath);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Validation Errors', () => {
        it('should report duplicate names', async () => {
            const filePath = temp.filePath('duplicates.sysml');
            await fs.writeFile(filePath, `
                part def Component;
                part def Component;
            `);

            const result = await validateFile(filePath);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
        });

        it('should report invalid multiplicity bounds', async () => {
            const filePath = temp.filePath('multiplicity.sysml');
            await fs.writeFile(filePath, `
                part def P {
                    part x [10..5];
                }
            `);

            const result = await validateFile(filePath);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('Lower bound'))).toBe(true);
        });

        it('should report self-specialization', async () => {
            const filePath = temp.filePath('self-spec.sysml');
            await fs.writeFile(filePath, `
                part def A :> A;
            `);

            const result = await validateFile(filePath);

            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.message.includes('specialize itself'))).toBe(true);
        });
    });

    describe('Validation Warnings', () => {
        it('should report hints for untyped parts', async () => {
            const filePath = temp.filePath('untyped.sysml');
            await fs.writeFile(filePath, `
                part def P {
                    part untypedPart;
                }
            `);

            const result = await validateFile(filePath);

            expect(result.hints.some(h => h.message.includes('no explicit type'))).toBe(true);
        });

        it('should report hints for empty abstract definitions', async () => {
            const filePath = temp.filePath('empty-abstract.sysml');
            await fs.writeFile(filePath, `
                abstract part def Empty { }
            `);

            const result = await validateFile(filePath);

            expect(result.hints.some(h => h.message.includes('has no members'))).toBe(true);
        });
    });

    describe('Diagnostic Counts', () => {
        it('should count multiple errors correctly', async () => {
            const filePath = temp.filePath('multi-error.sysml');
            await fs.writeFile(filePath, `
                part def A;
                part def A;
                part def B [10..1];
            `);

            const result = await validateFile(filePath);

            // Should have both duplicate name errors and multiplicity error
            expect(result.errors.length).toBeGreaterThanOrEqual(3);
        });

        it('should separate errors from warnings', async () => {
            const filePath = temp.filePath('mixed.sysml');
            await fs.writeFile(filePath, `
                part def A;
                part def A;
                part def B {
                    part untyped;
                }
            `);

            const result = await validateFile(filePath);

            expect(result.errors.length).toBeGreaterThan(0);
            // Hints should be separate from errors
            expect(result.diagnostics.length).toBeGreaterThan(result.errors.length);
        });
    });

    describe('Error Location', () => {
        it('should provide correct error ranges', async () => {
            const filePath = temp.filePath('location.sysml');
            await fs.writeFile(filePath, `part def A;
part def A;`);

            const result = await validateFile(filePath);

            expect(result.errors.length).toBeGreaterThan(0);
            for (const error of result.errors) {
                expect(error.range).toBeDefined();
                expect(error.range.start.line).toBeGreaterThanOrEqual(0);
                expect(error.range.start.character).toBeGreaterThanOrEqual(0);
            }
        });
    });

    describe('Complex Validation', () => {
        it('should validate nested packages', async () => {
            const filePath = temp.filePath('nested.sysml');
            await fs.writeFile(filePath, `
                package Outer {
                    package Inner1 {
                        part def A;
                    }
                    package Inner2 {
                        part def B :> Inner1::A;
                    }
                }
            `);

            const result = await validateFile(filePath);
            expect(result.errors.length).toBe(0);
        });

        it('should validate actions and states', async () => {
            const filePath = temp.filePath('behavior.sysml');
            await fs.writeFile(filePath, `
                action def Process {
                    action step1;
                    action step2;
                    succession first step1 then step2;
                }
                state def Machine {
                    state s1;
                    state s2;
                    transition first s1 then s2;
                }
            `);

            const result = await validateFile(filePath);
            expect(result.errors.length).toBe(0);
        });

        it('should validate requirements', async () => {
            const filePath = temp.filePath('requirements.sysml');
            await fs.writeFile(filePath, `
                requirement def SafetyReq {
                    subject sys : System;
                    require constraint safe;
                }
                part def System;
            `);

            const result = await validateFile(filePath);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Parse vs Validation Errors', () => {
        it('should include parse errors in validation result', async () => {
            const filePath = temp.filePath('parse-error.sysml');
            // Use extra closing brace to trigger parser error without hang
            await fs.writeFile(filePath, `
                part def P { } }
            `);

            const result = await validateFile(filePath);

            // Parse errors should prevent successful validation
            expect(result.isValid).toBe(false);
        });
    });
});
