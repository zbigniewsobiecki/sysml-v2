/**
 * Visibility scoping tests
 * Tests for public/private/protected visibility
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, validateAndExpectSuccess, getFirstElement } from '../helpers/test-utils.js';
import { isOwningMembership } from '../../src/language/generated/ast.js';

describe('Visibility Scoping', () => {
    describe('Public Visibility', () => {
        it('should parse public part def', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    public part def Visible;
                }
            `);
            const pkg = getFirstElement(ast);
            // Visibility is on the membership (NamespaceElement), not the element inside
            const membership = pkg.elements?.[0];
            expect(membership?.visibility).toBe('public');
        });

        it('should parse public package', async () => {
            const ast = await parseAndExpectSuccess(`
                package Outer {
                    public package Inner { }
                }
            `);
            const outer = getFirstElement(ast);
            const membership = outer.elements?.[0];
            expect(membership?.visibility).toBe('public');
        });

        it('should parse public part usage', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    public part visible;
                }
            `);
        });
    });

    describe('Private Visibility', () => {
        it('should parse private part def', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    private part def Hidden;
                }
            `);
            const pkg = getFirstElement(ast);
            const membership = pkg.elements?.[0];
            expect(membership?.visibility).toBe('private');
        });

        it('should parse private attribute', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    private attribute secret : String;
                }
            `);
        });

        it('should parse private import', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    private import A::B;
                }
            `);
            const pkg = getFirstElement(ast);
            // Import is directly in elements, not wrapped in membership
            expect(pkg.elements?.[0]?.visibility).toBe('private');
        });
    });

    describe('Protected Visibility', () => {
        it('should parse protected part def', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    protected part def Internal;
                }
            `);
            const pkg = getFirstElement(ast);
            const membership = pkg.elements?.[0];
            expect(membership?.visibility).toBe('protected');
        });

        it('should parse protected feature', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    protected part internal;
                }
            `);
        });
    });

    describe('Default Visibility', () => {
        it('should have undefined visibility by default', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    part def Default;
                }
            `);
            const pkg = getFirstElement(ast);
            const membership = pkg.elements?.[0];
            // Default visibility is undefined (not explicitly set)
            expect(membership?.visibility).toBeUndefined();
        });
    });

    describe('Visibility in Nested Scopes', () => {
        it('should parse mixed visibility in nested structure', async () => {
            const result = await validateAndExpectSuccess(`
                package Outer {
                    public part def PublicType;
                    private part def PrivateType;

                    package Inner {
                        protected part def ProtectedType;
                    }
                }
            `);
        });
    });

    describe('Visibility on Various Elements', () => {
        it('should parse visibility on action def', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    public action def PublicAction;
                    private action def PrivateAction;
                }
            `);
        });

        it('should parse visibility on state def', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    public state def PublicState;
                    private state def PrivateState;
                }
            `);
        });

        it('should parse visibility on requirement def', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    public requirement def PublicReq;
                    private requirement def PrivateReq;
                }
            `);
        });
    });

    describe('Visibility on Usages', () => {
        it('should parse visibility on all usage types', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Container {
                    public part publicPart;
                    private part privatePart;
                    protected part protectedPart;

                    public attribute publicAttr;
                    private attribute privateAttr;

                    public port publicPort;
                    private port privatePort;
                }
            `);
        });
    });

    describe('Visibility with Other Modifiers', () => {
        it('should parse visibility with abstract', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    public abstract part def AbstractPublic;
                    private abstract part def AbstractPrivate;
                }
            `);
        });

        it('should parse visibility with readonly', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    public readonly attribute constant = 42;
                    private readonly attribute secret = "hidden";
                }
            `);
        });

        it('should parse visibility with direction', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    public in port publicIn;
                    private out port privateOut;
                }
            `);
        });
    });
});
