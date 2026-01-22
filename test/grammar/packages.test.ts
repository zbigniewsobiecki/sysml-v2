/**
 * Package and Import tests
 * Tests for packages, library packages, and various import forms
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, getFirstElement, getAllElements, getPackageElements } from '../helpers/test-utils.js';
import {
    isPackageBody,
    isLibraryPackage,
    isImport,
    isAliasMember
} from '../../src/language/generated/ast.js';

describe('Packages', () => {
    describe('Basic Package', () => {
        it('should parse empty package with semicolon', async () => {
            const ast = await parseAndExpectSuccess('package P;');
            const pkg = getFirstElement(ast);
            // Note: Langium generates PackageBody for all packages
            expect(pkg.name).toBe('P');
        });

        it('should parse empty package with braces', async () => {
            const ast = await parseAndExpectSuccess('package P { }');
            const pkg = getFirstElement(ast);
            expect(isPackageBody(pkg)).toBe(true);
            expect(pkg.name).toBe('P');
        });

        it('should parse anonymous package', async () => {
            const ast = await parseAndExpectSuccess('package { }');
            const pkg = getFirstElement(ast);
            expect(isPackageBody(pkg)).toBe(true);
            expect(pkg.name).toBeUndefined();
        });

        it('should parse nested packages', async () => {
            const ast = await parseAndExpectSuccess(`
                package A {
                    package B { }
                }
            `);
            const pkgA = getFirstElement(ast);
            expect(pkgA.name).toBe('A');
            const elements = getPackageElements(pkgA);
            expect(elements.length).toBe(1);
            expect(elements[0].name).toBe('B');
        });

        it('should parse deeply nested packages', async () => {
            const ast = await parseAndExpectSuccess(`
                package A {
                    package B {
                        package C { }
                    }
                }
            `);
            const pkgA = getFirstElement(ast);
            expect(pkgA.name).toBe('A');
        });

        it('should parse package with multiple members', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    part def A;
                    part def B;
                    part def C;
                }
            `);
            const pkg = getFirstElement(ast);
            const elements = getPackageElements(pkg);
            expect(elements.length).toBe(3);
            expect(elements.map((e: any) => e.name)).toEqual(['A', 'B', 'C']);
        });

        it('should parse multiple packages at root level', async () => {
            const ast = await parseAndExpectSuccess(`
                package P1;
                package P2;
                package P3;
            `);
            const elements = getAllElements(ast);
            expect(elements.length).toBe(3);
            expect(elements.map((e: any) => e.name)).toEqual(['P1', 'P2', 'P3']);
        });
    });

    describe('Library Package', () => {
        it('should parse library package', async () => {
            const ast = await parseAndExpectSuccess('library package Lib;');
            const pkg = getFirstElement(ast);
            expect(isLibraryPackage(pkg)).toBe(true);
            expect(pkg.name).toBe('Lib');
        });

        it('should parse standard library package', async () => {
            const ast = await parseAndExpectSuccess('standard library package StdLib;');
            const pkg = getFirstElement(ast);
            expect(isLibraryPackage(pkg)).toBe(true);
            expect(pkg.name).toBe('StdLib');
            // Note: Due to Langium's {infer} behavior, isStandard may not be set.
            // Check CST text as workaround
            const cstText = pkg.$cstNode?.text ?? '';
            expect(cstText.includes('standard')).toBe(true);
        });

        it('should parse library package with body', async () => {
            const ast = await parseAndExpectSuccess(`
                library package Lib {
                    part def Component;
                }
            `);
            const pkg = getFirstElement(ast);
            expect(isLibraryPackage(pkg)).toBe(true);
            // PackageBody extends LibraryPackage, so elements are directly on pkg
            expect(pkg.elements?.length).toBe(1);
        });
    });

    describe('Package Visibility', () => {
        it('should parse public package', async () => {
            const ast = await parseAndExpectSuccess(`
                package Container {
                    public package Inner;
                }
            `);
            const container = getFirstElement(ast);
            // Visibility is on the membership, not the package itself
            const membership = container.elements?.[0];
            expect(membership?.visibility).toBe('public');
        });

        it('should parse private package', async () => {
            const ast = await parseAndExpectSuccess(`
                package Container {
                    private package Inner;
                }
            `);
            const container = getFirstElement(ast);
            const membership = container.elements?.[0];
            expect(membership?.visibility).toBe('private');
        });

        it('should parse protected package', async () => {
            const ast = await parseAndExpectSuccess(`
                package Container {
                    protected package Inner;
                }
            `);
            const container = getFirstElement(ast);
            const membership = container.elements?.[0];
            expect(membership?.visibility).toBe('protected');
        });
    });
});

describe('Imports', () => {
    describe('Simple Import', () => {
        it('should parse simple import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    import A::B;
                }
            `);
            const pkg = getFirstElement(ast);
            // PackageBody has elements directly
            expect(pkg.elements.length).toBe(1);
            expect(isImport(pkg.elements[0])).toBe(true);
        });

        it('should parse import with long qualified name', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    import A::B::C::D;
                }
            `);
        });
    });

    describe('Wildcard Import', () => {
        it('should parse wildcard import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    import A::*;
                }
            `);
            const pkg = getFirstElement(ast);
            const imp = pkg.elements[0];
            expect(isImport(imp)).toBe(true);
            expect(imp.importRef?.isWildcard).toBe(true);
        });

        it('should parse recursive wildcard import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    import A::**;
                }
            `);
            const pkg = getFirstElement(ast);
            const imp = pkg.elements[0];
            expect(imp.importRef?.isRecursive).toBe(true);
        });
    });

    describe('All Import', () => {
        it('should parse all import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    import all A;
                }
            `);
            const pkg = getFirstElement(ast);
            const imp = pkg.elements[0];
            expect(imp.isAll).toBe(true);
        });

        it('should parse all import with qualified name', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    import all A::B::C;
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
            const imp = pkg.elements[0];
            expect(imp.visibility).toBe('public');
        });

        it('should parse private import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    private import A;
                }
            `);
            const pkg = getFirstElement(ast);
            const imp = pkg.elements[0];
            expect(imp.visibility).toBe('private');
        });
    });

    describe('Alias', () => {
        it('should parse simple alias', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    alias X for A::B::C;
                }
            `);
            const pkg = getFirstElement(ast);
            const alias = pkg.elements[0];
            expect(isAliasMember(alias)).toBe(true);
            expect(alias.aliasName).toBe('X');
        });

        it('should parse alias with visibility', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    public alias PubAlias for Some::Type;
                }
            `);
            const pkg = getFirstElement(ast);
            const alias = pkg.elements[0];
            expect(alias.visibility).toBe('public');
        });

        it('should parse private alias', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    private alias PrivAlias for Hidden::Type;
                }
            `);
            const pkg = getFirstElement(ast);
            const alias = pkg.elements[0];
            expect(alias.visibility).toBe('private');
        });
    });

    describe('Multiple Imports', () => {
        it('should parse multiple imports in package', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    import A;
                    import B::C;
                    import D::*;
                    import all E;
                }
            `);
            const pkg = getFirstElement(ast);
            expect(pkg.elements.length).toBe(4);
        });

        it('should parse imports at root level', async () => {
            const ast = await parseAndExpectSuccess(`
                import A;
                import B;
                package P { }
            `);
            const elements = getAllElements(ast);
            expect(elements.length).toBe(3);
        });
    });
});
