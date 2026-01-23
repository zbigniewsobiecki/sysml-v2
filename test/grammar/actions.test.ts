/**
 * Action tests
 * Tests for action bodies and control flow
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, parseAndExpectErrors, getFirstElement } from '../helpers/test-utils.js';
import { isActionDefinition, isActionUsage } from '../../src/language/generated/ast.js';

describe('Actions', () => {
    describe('Action Definition', () => {
        it('should parse empty action def', async () => {
            const ast = await parseAndExpectSuccess('action def DoNothing;');
            const def = getFirstElement(ast);
            expect(isActionDefinition(def)).toBe(true);
        });

        it('should parse action def with body', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Process {
                    action step1;
                    action step2;
                }
            `);
        });

        it('should parse action def with parameters', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Transform {
                    in input : Data;
                    out output : Result;
                }
            `);
        });

        it('should parse action def with in/out/inout parameters', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Process {
                    in data : Input;
                    out result : Output;
                    inout state : State;
                }
            `);
        });
    });

    describe('Action Usage', () => {
        it('should parse simple action usage', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Container {
                    action step;
                }
            `);
        });

        it('should parse action usage with type', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Container {
                    action process : ProcessAction;
                }
            `);
        });

        it('should parse nested action', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Outer {
                    action inner {
                        action nested;
                    }
                }
            `);
        });
    });

    describe('If-Then-Else', () => {
        it('should parse simple if', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    if condition { }
                }
            `);
        });

        it('should parse if-else', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    if condition { }
                    else { }
                }
            `);
        });

        it('should parse nested if-else', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    if cond1 { }
                    else if cond2 { }
                    else { }
                }
            `);
        });
    });

    describe('While Loop', () => {
        it('should parse while loop', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    while condition { }
                }
            `);
        });

        it('should parse while loop with until', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    while condition until done { }
                }
            `);
        });
    });

    describe('For Loop', () => {
        it('should parse for loop', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    for x in items { }
                }
            `);
        });

        it('should parse for loop with type', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    for x : Item in items { }
                }
            `);
        });
    });

    describe('Assignment', () => {
        it('should parse assignment action', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    assign target := value;
                }
            `);
        });

        it('should parse assignment with expression', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    assign x := y + 1;
                }
            `);
        });
    });

    describe('Send Action', () => {
        it('should parse send action', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    send payload to receiver;
                }
            `);
        });

        it('should parse send with via', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    send payload via channel to receiver;
                }
            `);
        });
    });

    describe('Accept Action', () => {
        it('should parse accept action', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    accept msg;
                }
            `);
        });

        it('should parse accept with type', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    accept msg : Message;
                }
            `);
        });
    });

    describe('Perform Action', () => {
        it('should parse perform action', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    perform someAction;
                }
            `);
        });
    });

    describe('Assert Constraint', () => {
        it('should parse assert constraint', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    assert constraint;
                }
            `);
        });
    });

    describe('Complex Action Bodies', () => {
        it('should parse action with multiple control structures', async () => {
            const ast = await parseAndExpectSuccess(`
                action def ComplexAction {
                    action setup;
                    if ready {
                        while processing {
                            action doWork;
                        }
                    }
                    action cleanup;
                }
            `);
        });

        it('should parse complex action flow', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Workflow {
                    action start;
                    first start then process;
                    action process;
                    action finish;
                }
            `);
        });

        it('should not hang on redefinition in action body', async () => {
            // This input caused parser to hang due to NamespaceElement being first in ActionBodyElement
            const input = `
                package Test {
                    action def MyAction {
                        action nested {
                            :>> port = 3000;
                        }
                    }
                }
            `;
            // Should complete quickly - valid SysML with redefinition syntax
            const result = await parseAndExpectSuccess(input);
            expect(result).toBeDefined();
        }, 5000);
    });
});
