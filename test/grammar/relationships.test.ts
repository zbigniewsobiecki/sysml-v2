/**
 * Relationship tests
 * Tests for specialization, subsetting, redefinition, etc.
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, getFirstElement, getAllElements } from '../helpers/test-utils.js';

describe('Relationships', () => {
    describe('Specialization', () => {
        it('should parse specialization relationship', async () => {
            const ast = await parseAndExpectSuccess(`
                specialization S subtype SubType :> SuperType;
            `);
            const spec = getFirstElement(ast);
            expect(spec.$type).toBe('Specialization');
        });

        it('should parse specialization with qualified names', async () => {
            const ast = await parseAndExpectSuccess(`
                specialization S subtype A::B :> C::D;
            `);
        });

        it('should parse anonymous specialization', async () => {
            const ast = await parseAndExpectSuccess(`
                specialization subtype A :> B;
            `);
        });
    });

    describe('Subclassification', () => {
        it('should parse subclassification relationship', async () => {
            const ast = await parseAndExpectSuccess(`
                subclassification S subclassifier ChildClass :> ParentClass;
            `);
            const sub = getFirstElement(ast);
            expect(sub.$type).toBe('Subclassification');
        });

        it('should parse anonymous subclassification', async () => {
            const ast = await parseAndExpectSuccess(`
                subclassification subclassifier A :> B;
            `);
        });
    });

    describe('Subsetting', () => {
        it('should parse subset relationship', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Container {
                    subset S subsettingFeature :> subsettedFeature;
                }
            `);
        });

        it('should parse subset with qualified names', async () => {
            // Note: Using 'feat' instead of 'feature' because 'feature' is a keyword
            const ast = await parseAndExpectSuccess(`
                part def P {
                    subset S subsettingFeat :> A::B::feat;
                }
            `);
        });
    });

    describe('Redefinition', () => {
        it('should parse redefinition relationship', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Container {
                    redefinition R redefiningFeature :>> redefinedFeature;
                }
            `);
        });

        it('should parse redefinition with qualified names', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    redefinition R newFeature :>> A::B::oldFeature;
                }
            `);
        });
    });

    describe('Dependency', () => {
        it('should parse dependency relationship', async () => {
            const ast = await parseAndExpectSuccess(`
                dependency D from Client to Supplier;
            `);
            const dep = getFirstElement(ast);
            expect(dep.$type).toBe('Dependency');
        });

        it('should parse anonymous dependency', async () => {
            const ast = await parseAndExpectSuccess(`
                dependency from A to B;
            `);
        });

        it('should parse dependency with qualified names', async () => {
            const ast = await parseAndExpectSuccess(`
                dependency Dep from Pkg1::Component to Pkg2::Service;
            `);
        });
    });

    describe('Feature Typing', () => {
        it('should parse feature typing declaration', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    feature f typed by Type;
                }
            `);
        });

        it('should parse feature typing with multiple types', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    feature f typed by T1, T2;
                }
            `);
        });
    });

    describe('Inline Relationships', () => {
        it('should parse definition with specialization', async () => {
            const ast = await parseAndExpectSuccess('part def Child :> Parent;');
            const def = getFirstElement(ast);
            expect(def.specializations.length).toBe(1);
        });

        it('should parse definition with multiple specializations', async () => {
            const ast = await parseAndExpectSuccess('part def Child :> P1, P2, P3;');
            const def = getFirstElement(ast);
            expect(def.specializations.length).toBe(3);
        });

        it('should parse usage with subset using :>', async () => {
            const ast = await parseAndExpectSuccess('part def P { part child :> parent; }');
        });

        it('should parse usage with redefinition using :>>', async () => {
            const ast = await parseAndExpectSuccess('part def P { part child :>> inherited; }');
        });

        it('should parse usage with subsets keyword', async () => {
            const ast = await parseAndExpectSuccess('part def P { part child subsets parent; }');
        });

        it('should parse usage with redefines keyword', async () => {
            const ast = await parseAndExpectSuccess('part def P { part child redefines inherited; }');
        });

        it('should parse usage with references keyword', async () => {
            const ast = await parseAndExpectSuccess('part def P { part child references target; }');
        });
    });

    describe('Conjugation', () => {
        it('should parse conjugate type', async () => {
            const ast = await parseAndExpectSuccess('part def ConjPart conjugate OriginalPart;');
        });

        it('should parse conjugated port def', async () => {
            const ast = await parseAndExpectSuccess('port def Response conjugate Request;');
        });
    });

    describe('Disjoint Types', () => {
        it('should parse disjoint from', async () => {
            const ast = await parseAndExpectSuccess('part def A disjoint from B;');
            const def = getFirstElement(ast);
            expect(def.disjointTypes).toBeDefined();
        });

        it('should parse multiple disjoint types', async () => {
            const ast = await parseAndExpectSuccess('part def A disjoint from B, C, D;');
            const def = getFirstElement(ast);
            expect(def.disjointTypes.length).toBe(3);
        });
    });

    describe('Combined Relationships', () => {
        it('should parse specialization with disjoint', async () => {
            const ast = await parseAndExpectSuccess('part def Child :> Parent disjoint from Sibling;');
        });

        it('should parse usage with type and subset', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x : Type :> superPart; }');
        });

        it('should parse usage with multiple subsets', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x subsets a, b, c; }');
        });
    });
});
