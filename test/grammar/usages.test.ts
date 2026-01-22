/**
 * Usage tests
 * Tests for all usage types (part, action, etc.) with various modifiers
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, getFirstElement, getPackageElements } from '../helpers/test-utils.js';

describe('Usages', () => {
    describe('Part Usage', () => {
        it('should parse simple part usage', async () => {
            const ast = await parseAndExpectSuccess('part def P { part engine; }');
        });

        it('should parse part with typing', async () => {
            const ast = await parseAndExpectSuccess('part def P { part engine : Engine; }');
        });

        it('should parse part with subsetting using :>', async () => {
            const ast = await parseAndExpectSuccess('part def P { part engine :> baseEngine; }');
        });

        it('should parse part with redefinition using :>>', async () => {
            const ast = await parseAndExpectSuccess('part def P { part engine :>> inheritedEngine; }');
        });

        it('should parse part with multiplicity', async () => {
            const ast = await parseAndExpectSuccess('part def P { part wheels : Wheel[4]; }');
        });

        it('should parse part with range multiplicity', async () => {
            const ast = await parseAndExpectSuccess('part def P { part items : Item[0..*]; }');
        });

        it('should parse ref part', async () => {
            const ast = await parseAndExpectSuccess('part def P { ref part external : Component; }');
        });

        it('should parse abstract part', async () => {
            const ast = await parseAndExpectSuccess('part def P { abstract part template; }');
        });

        it('should parse readonly part', async () => {
            const ast = await parseAndExpectSuccess('part def P { readonly part config : Config; }');
        });

        it('should parse derived part', async () => {
            const ast = await parseAndExpectSuccess('part def P { derived part computed : Result; }');
        });

        it('should parse end part', async () => {
            const ast = await parseAndExpectSuccess('connection def C { end part source; end part target; }');
        });
    });

    describe('Item Usage', () => {
        it('should parse simple item usage', async () => {
            const ast = await parseAndExpectSuccess('part def P { item data; }');
        });

        it('should parse item with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { item file : Document; }');
        });
    });

    describe('Attribute Usage', () => {
        it('should parse simple attribute', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute name; }');
        });

        it('should parse attribute with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute count : Integer; }');
        });

        it('should parse attribute with default value using =', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute count = 0; }');
        });

        it('should parse attribute with initial value using :=', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute count := 5; }');
        });

        it('should parse computed attribute using ::=', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute total ::= a + b; }');
        });

        it('should parse attribute with type and value', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute name : String = "default"; }');
        });

        it('should parse readonly attribute', async () => {
            const ast = await parseAndExpectSuccess('part def P { readonly attribute id : Integer; }');
        });

        it('should parse derived attribute', async () => {
            const ast = await parseAndExpectSuccess('part def P { derived attribute computed : Real; }');
        });
    });

    describe('Port Usage', () => {
        it('should parse simple port', async () => {
            const ast = await parseAndExpectSuccess('part def P { port dataPort; }');
        });

        it('should parse port with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { port comm : CommunicationPort; }');
        });

        it('should parse in port', async () => {
            const ast = await parseAndExpectSuccess('part def P { in port input : DataPort; }');
        });

        it('should parse out port', async () => {
            const ast = await parseAndExpectSuccess('part def P { out port output : DataPort; }');
        });

        it('should parse inout port', async () => {
            const ast = await parseAndExpectSuccess('part def P { inout port bidirectional : DataPort; }');
        });
    });

    describe('Action Usage', () => {
        it('should parse simple action', async () => {
            const ast = await parseAndExpectSuccess('action def A { action step1; }');
        });

        it('should parse action with type', async () => {
            const ast = await parseAndExpectSuccess('action def A { action process : ProcessAction; }');
        });

        it('should parse action with body', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    action process {
                        action substep;
                    }
                }
            `);
        });
    });

    describe('State Usage', () => {
        it('should parse simple state', async () => {
            const ast = await parseAndExpectSuccess('state def S { state idle; }');
        });

        it('should parse parallel state', async () => {
            const ast = await parseAndExpectSuccess('state def S { parallel state concurrent; }');
        });

        it('should parse state with entry action', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        entry action initialize;
                    }
                }
            `);
        });

        it('should parse state with exit action', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        exit action cleanup;
                    }
                }
            `);
        });

        it('should parse state with do action', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state processing {
                        do action work;
                    }
                }
            `);
        });
    });

    describe('Constraint Usage', () => {
        it('should parse simple constraint', async () => {
            const ast = await parseAndExpectSuccess('part def P { constraint valid; }');
        });

        it('should parse constraint with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { constraint check : Validation; }');
        });
    });

    describe('Requirement Usage', () => {
        it('should parse simple requirement', async () => {
            const ast = await parseAndExpectSuccess('part def P { requirement safety; }');
        });

        it('should parse requirement with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { requirement safety : SafetyReq; }');
        });
    });

    describe('Calculation Usage', () => {
        it('should parse simple calc', async () => {
            const ast = await parseAndExpectSuccess('part def P { calc compute; }');
        });

        it('should parse calc with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { calc area : AreaCalculation; }');
        });
    });

    describe('Connection Usage', () => {
        it('should parse simple connection', async () => {
            const ast = await parseAndExpectSuccess('part def P { connection link; }');
        });

        it('should parse connection with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { connection dataLink : DataConnection; }');
        });
    });

    describe('Interface Usage', () => {
        it('should parse simple interface', async () => {
            const ast = await parseAndExpectSuccess('part def P { interface api; }');
        });

        it('should parse interface with type', async () => {
            const ast = await parseAndExpectSuccess('part def P { interface api : RestAPI; }');
        });
    });

    describe('Allocation Usage', () => {
        it('should parse simple allocation', async () => {
            const ast = await parseAndExpectSuccess('part def P { allocation mapping; }');
        });
    });

    describe('Flow Usage', () => {
        it('should parse simple flow', async () => {
            const ast = await parseAndExpectSuccess('part def P { flow dataFlow; }');
        });
    });

    describe('Occurrence Usage', () => {
        it('should parse simple occurrence', async () => {
            const ast = await parseAndExpectSuccess('part def P { occurrence event; }');
        });
    });

    describe('View Usage', () => {
        it('should parse simple view', async () => {
            const ast = await parseAndExpectSuccess('part def P { view overview; }');
        });
    });

    describe('Rendering Usage', () => {
        it('should parse simple rendering', async () => {
            const ast = await parseAndExpectSuccess('part def P { rendering diagram; }');
        });
    });

    describe('Metadata Usage', () => {
        it('should parse metadata usage with @', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    @Annotation;
                }
            `);
        });

        it('should parse named metadata usage', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    @tag : Annotation;
                }
            `);
        });
    });

    describe('Visibility Modifiers', () => {
        it('should parse public usage', async () => {
            const ast = await parseAndExpectSuccess('part def P { public part visible; }');
        });

        it('should parse private usage', async () => {
            const ast = await parseAndExpectSuccess('part def P { private part hidden; }');
        });

        it('should parse protected usage', async () => {
            const ast = await parseAndExpectSuccess('part def P { protected part internal; }');
        });
    });

    describe('Combined Modifiers', () => {
        it('should parse multiple modifiers', async () => {
            // Grammar expects: visibility, direction, abstract, readonly, derived, end, composite, portion
            const ast = await parseAndExpectSuccess('part def P { private abstract readonly part special; }');
        });

        it('should parse direction with type and multiplicity', async () => {
            const ast = await parseAndExpectSuccess('part def P { in port input : DataPort[1..*]; }');
        });
    });
});
