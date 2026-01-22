/**
 * Import scoping tests
 * Tests for import resolution
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, validateAndExpectSuccess, getFirstElement } from '../helpers/test-utils.js';

describe('Import Scoping', () => {
    describe('Simple Imports', () => {
        it('should parse simple import', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib {
                    part def Widget;
                }
                package App {
                    import Lib::Widget;
                    part def MyWidget :> Widget;
                }
            `);
        });

        it('should parse import of nested element', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    package B {
                        part def Type;
                    }
                }
                package C {
                    import A::B::Type;
                }
            `);
        });
    });

    describe('Wildcard Imports', () => {
        it('should parse wildcard import', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib {
                    part def A;
                    part def B;
                    part def C;
                }
                package App {
                    import Lib::*;
                }
            `);
        });

        it('should parse wildcard on nested package', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    package B {
                        part def X;
                        part def Y;
                    }
                }
                package C {
                    import A::B::*;
                }
            `);
        });
    });

    describe('Recursive Imports', () => {
        it('should parse recursive import', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib {
                    package Sub1 {
                        part def A;
                    }
                    package Sub2 {
                        part def B;
                    }
                }
                package App {
                    import Lib::**;
                }
            `);
        });
    });

    describe('All Imports', () => {
        it('should parse all import', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib {
                    part def Base;
                }
                package App {
                    import all Lib;
                }
            `);
        });

        it('should parse all import with qualified name', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    package B {
                        part def X;
                    }
                }
                package C {
                    import all A::B;
                }
            `);
        });
    });

    describe('Import Visibility', () => {
        it('should parse public import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    public import A;
                }
            `);
            const pkg = getFirstElement(ast);
            // Note: pkg is a PackageBody node, so elements are directly on pkg
            expect(pkg.elements[0].visibility).toBe('public');
        });

        it('should parse private import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    private import A;
                }
            `);
            const pkg = getFirstElement(ast);
            // Note: pkg is a PackageBody node, so elements are directly on pkg
            expect(pkg.elements[0].visibility).toBe('private');
        });
    });

    describe('Multiple Imports', () => {
        it('should parse multiple imports', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib1 {
                    part def A;
                }
                package Lib2 {
                    part def B;
                }
                package App {
                    import Lib1::A;
                    import Lib2::B;
                }
            `);
        });

        it('should parse mixed import types', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib {
                    package Sub {
                        part def X;
                    }
                    part def Y;
                }
                package App {
                    import Lib::Y;
                    import Lib::Sub::*;
                }
            `);
        });
    });

    describe('Root Level Imports', () => {
        it('should parse import at root level', async () => {
            const result = await validateAndExpectSuccess(`
                import SomeLibrary;
                package App {
                    part def Component;
                }
            `);
        });

        it('should parse multiple root level imports', async () => {
            const result = await validateAndExpectSuccess(`
                import Lib1;
                import Lib2::*;
                import all Lib3;

                package App { }
            `);
        });
    });

    describe('Import and Alias Combination', () => {
        it('should parse import followed by alias', async () => {
            const result = await validateAndExpectSuccess(`
                package App {
                    import VeryLong::Package::Name::Type;
                    alias T for VeryLong::Package::Name::Type;
                }
            `);
        });
    });

    describe('Import Order Independence', () => {
        it('should allow forward reference before import', async () => {
            const result = await validateAndExpectSuccess(`
                package App {
                    part def Using :> External;
                    import Library::External;
                }
                package Library {
                    part def External;
                }
            `);
            // Note: This may or may not be valid depending on resolution order
            // The test documents expected behavior
            expect(result).toBeDefined();
        });
    });
});
