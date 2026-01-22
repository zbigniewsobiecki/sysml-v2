/**
 * Qualified name validation tests
 * Tests for qualified name validation rules
 */

import { describe, it, expect } from 'vitest';
import { validateAndExpectDiagnostics, validateAndExpectSuccess } from '../helpers/test-utils.js';

describe('Qualified Name Validation', () => {
    describe('Simple Qualified Names', () => {
        it('should accept single-part name', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    part def X;
                }
                part def P :> A::X;
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept multi-part name', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    package B {
                        part def X;
                    }
                }
                part def P :> A::B::X;
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Import Qualified Names', () => {
        it('should accept qualified import', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    import A::B::C;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept wildcard import', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    import A::B::*;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept recursive import', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    import A::**;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Alias Qualified Names', () => {
        it('should accept alias with qualified target', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    alias ShortName for Some::Long::Package::Name;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Type Qualified Names', () => {
        it('should accept qualified type reference', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    part child : Library::Components::Widget;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept qualified specialization', async () => {
            const result = await validateAndExpectSuccess(`
                part def Child :> Parent::Package::Base;
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Feature Chain Names', () => {
        it('should accept feature chain', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute result = container.element.value;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept complex feature chain', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute result = a.b.c.d.e;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Qualified Names in Different Contexts', () => {
        it('should accept qualified name in dependency', async () => {
            const result = await validateAndExpectSuccess(`
                dependency from Client::Module to Server::Service;
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept qualified name in specialization', async () => {
            const result = await validateAndExpectSuccess(`
                specialization S subtype Derived::Type :> Base::Type;
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept qualified name in connector', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    part a { port p; }
                    part b { port q; }
                    connector from a.p to b.q;
                }
            `);
            expect(result.errors.length).toBe(0);
        });

        it('should accept qualified name in flow', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    part source { out port output; }
                    part sink { in port input; }
                    flow from source.output to sink.input;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Unrestricted Names in Qualified Paths', () => {
        it('should accept unrestricted names in path', async () => {
            const result = await validateAndExpectSuccess(`
                package 'Package With Spaces' {
                    part def Widget;
                }
                part def P :> 'Package With Spaces'::Widget;
            `);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('Global Scope Reference', () => {
        it('should accept root-level reference', async () => {
            const result = await validateAndExpectSuccess(`
                part def Global;
                package P {
                    part def Local :> Global;
                }
            `);
            expect(result.errors.length).toBe(0);
        });
    });
});
