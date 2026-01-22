/**
 * Nested scope tests
 * Tests for nested namespace scoping
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, validateAndExpectSuccess, getFirstElement, getPackageElements } from '../helpers/test-utils.js';

describe('Nested Scope Resolution', () => {
    describe('Package Nesting', () => {
        it('should handle single level nesting', async () => {
            const result = await validateAndExpectSuccess(`
                package Outer {
                    package Inner {
                        part def Type;
                    }
                }
            `);
        });

        it('should handle deep nesting', async () => {
            const result = await validateAndExpectSuccess(`
                package L1 {
                    package L2 {
                        package L3 {
                            package L4 {
                                part def DeepType;
                            }
                        }
                    }
                }
            `);
        });

        it('should resolve reference to parent scope', async () => {
            const result = await validateAndExpectSuccess(`
                package Outer {
                    part def OuterType;
                    package Inner {
                        part def InnerType :> OuterType;
                    }
                }
            `);
        });

        it('should resolve reference to sibling package', async () => {
            const result = await validateAndExpectSuccess(`
                package Parent {
                    package Sibling1 {
                        part def Type1;
                    }
                    package Sibling2 {
                        part def Type2 :> Sibling1::Type1;
                    }
                }
            `);
        });
    });

    describe('Definition Nesting', () => {
        it('should scope features within definition', async () => {
            const result = await validateAndExpectSuccess(`
                part def Container {
                    part inner1;
                    part inner2;

                    part related :> inner1;
                }
            `);
        });

        it('should handle nested definitions', async () => {
            const result = await validateAndExpectSuccess(`
                part def Outer {
                    part def Inner {
                        part def Nested;
                    }
                }
            `);
        });
    });

    describe('Block Scoping', () => {
        it('should scope elements within package body', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    part def A;
                    part def B :> A;
                    part def C :> B;
                }
            `);
        });

        it('should scope elements within part body', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute x : Integer;
                    attribute y : Integer;
                    attribute sum ::= x + y;
                }
            `);
        });
    });

    describe('Action Scoping', () => {
        it('should scope actions within action def', async () => {
            const result = await validateAndExpectSuccess(`
                action def Process {
                    action step1;
                    action step2;
                    succession first step1 then step2;
                }
            `);
        });

        it('should scope nested control flow', async () => {
            const result = await validateAndExpectSuccess(`
                action def A {
                    if condition {
                        action inner1;
                    } else {
                        action inner2;
                    }
                }
            `);
        });
    });

    describe('State Scoping', () => {
        it('should scope states within state def', async () => {
            const result = await validateAndExpectSuccess(`
                state def Machine {
                    state s1;
                    state s2;
                    transition first s1 then s2;
                }
            `);
        });

        it('should scope nested states', async () => {
            const result = await validateAndExpectSuccess(`
                state def Machine {
                    state outer {
                        state inner1;
                        state inner2;
                        transition first inner1 then inner2;
                    }
                }
            `);
        });
    });

    describe('Shadowing in Nested Scopes', () => {
        it('should allow same name in nested scope', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    part def Type;
                    package Inner {
                        part def Type;
                    }
                }
            `);
        });

        it('should allow qualified access to shadowed name', async () => {
            const result = await validateAndExpectSuccess(`
                package Outer {
                    part def X;
                    package Inner {
                        part def X;
                        part def RefOuter :> Outer::X;
                        part def RefInner :> X;
                    }
                }
            `);
        });
    });

    describe('Cross-Scope References', () => {
        it('should resolve references across scopes', async () => {
            const result = await validateAndExpectSuccess(`
                package Types {
                    part def Base;
                }
                package Impl {
                    part def Derived :> Types::Base;
                }
            `);
        });

        it('should resolve deeply nested cross-references', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    package B {
                        part def X;
                    }
                }
                package C {
                    package D {
                        part def Y :> A::B::X;
                    }
                }
            `);
        });
    });

    describe('Scope in Expressions', () => {
        it('should resolve names in expressions', async () => {
            const result = await validateAndExpectSuccess(`
                part def P {
                    attribute a = 1;
                    attribute b = 2;
                    attribute c ::= a + b;
                }
            `);
        });

        it('should resolve feature chains in expressions', async () => {
            // Note: 'derived' is a keyword in SysML, so we use 'computed' instead
            const result = await validateAndExpectSuccess(`
                part def P {
                    part child {
                        attribute value : Integer;
                    }
                    attribute computed ::= child.value;
                }
            `);
        });
    });

    describe('Connection Scoping', () => {
        it('should resolve ends in connector', async () => {
            const result = await validateAndExpectSuccess(`
                part def System {
                    part a;
                    part b;
                    connector from a to b;
                }
            `);
        });

        it('should resolve nested features in flow', async () => {
            const result = await validateAndExpectSuccess(`
                part def System {
                    part source { out port output; }
                    part target { in port input; }
                    flow from source.output to target.input;
                }
            `);
        });
    });
});
