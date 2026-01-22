/**
 * Name uniqueness validation tests
 * Tests for duplicate name detection
 */

import { describe, it, expect } from 'vitest';
import { validateAndExpectDiagnostics, validateAndExpectSuccess } from '../helpers/test-utils.js';

describe('Name Uniqueness Validation', () => {
    describe('Root Namespace', () => {
        it('should detect duplicate package names at root', async () => {
            // Both instances are reported
            await validateAndExpectDiagnostics(`
                package P;
                package P;
            `, {
                errors: ["Duplicate element name: 'P'", "Duplicate element name: 'P'"]
            });
        });

        it('should detect duplicate part def names at root', async () => {
            // Both instances are reported
            await validateAndExpectDiagnostics(`
                part def Component;
                part def Component;
            `, {
                errors: ["Duplicate element name: 'Component'", "Duplicate element name: 'Component'"]
            });
        });

        it('should allow different names at root', async () => {
            const result = await validateAndExpectSuccess(`
                package P1;
                package P2;
                part def Component1;
                part def Component2;
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should detect multiple duplicates', async () => {
            // All three instances should be reported
            const result = await validateAndExpectDiagnostics(`
                part def A;
                part def A;
                part def A;
            `, {
                errors: [
                    "Duplicate element name: 'A'",
                    "Duplicate element name: 'A'",
                    "Duplicate element name: 'A'"
                ]
            });
            expect(result.errors.length).toBe(3);
        });
    });

    describe('Package Members', () => {
        it('should detect duplicate names in package', async () => {
            await validateAndExpectDiagnostics(`
                package P {
                    part def A;
                    part def A;
                }
            `, {
                errors: ["Duplicate element name 'A' in package 'P'"]
            });
        });

        it('should allow same name in different packages', async () => {
            const result = await validateAndExpectSuccess(`
                package P1 {
                    part def Component;
                }
                package P2 {
                    part def Component;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should detect duplicates in nested packages', async () => {
            await validateAndExpectDiagnostics(`
                package Outer {
                    package Inner {
                        part def X;
                        part def X;
                    }
                }
            `, {
                errors: ["Duplicate element name 'X' in package 'Inner'"]
            });
        });

        it('should allow same name at different nesting levels', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    part def A;
                    package Inner {
                        part def A;
                    }
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Different Element Types', () => {
        it('should detect duplicates regardless of element type', async () => {
            await validateAndExpectDiagnostics(`
                package P {
                    part def X;
                    action def X;
                }
            `, {
                errors: ["Duplicate element name 'X' in package 'P'"]
            });
        });

        it('should detect package and part def with same name', async () => {
            // Both instances are reported
            await validateAndExpectDiagnostics(`
                package P;
                part def P;
            `, {
                errors: ["Duplicate element name: 'P'", "Duplicate element name: 'P'"]
            });
        });
    });

    describe('Anonymous Elements', () => {
        it('should allow multiple anonymous packages', async () => {
            const result = await validateAndExpectSuccess(`
                package { part def A; }
                package { part def B; }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should allow anonymous elements in same package', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    part def;
                    part def;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Special Characters in Names', () => {
        it('should detect duplicates with unrestricted names', async () => {
            // Both instances are reported
            await validateAndExpectDiagnostics(`
                part def 'my part';
                part def 'my part';
            `, {
                errors: ["Duplicate element name", "Duplicate element name"]
            });
        });

        it('should allow similar but different unrestricted names', async () => {
            const result = await validateAndExpectSuccess(`
                part def 'my part';
                part def 'my-part';
            `);
            expect(result.errors.length).toBe(0);
        });
    });
});
