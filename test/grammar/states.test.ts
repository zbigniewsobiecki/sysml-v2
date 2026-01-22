/**
 * State machine tests
 * Tests for states, transitions, entry/exit/do actions
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, getFirstElement } from '../helpers/test-utils.js';

describe('State Machines', () => {
    describe('State Definition', () => {
        it('should parse empty state def', async () => {
            const ast = await parseAndExpectSuccess('state def MachineState;');
            const def = getFirstElement(ast);
            expect(def.$type).toBe('StateDefinition');
        });

        it('should parse state def with body', async () => {
            const ast = await parseAndExpectSuccess(`
                state def TrafficLight {
                    state red;
                    state yellow;
                    state green;
                }
            `);
        });

        it('should parse state def with specialization', async () => {
            const ast = await parseAndExpectSuccess(`
                state def ExtendedState :> BaseState;
            `);
        });
    });

    describe('State Usage', () => {
        it('should parse simple state', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state idle;
                }
            `);
        });

        it('should parse state with type', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active : ActiveState;
                }
            `);
        });

        it('should parse nested states', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state outer {
                        state inner;
                    }
                }
            `);
        });
    });

    describe('Parallel States', () => {
        it('should parse parallel state', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    parallel state concurrent {
                        state region1;
                        state region2;
                    }
                }
            `);
        });

        it('should parse multiple parallel regions', async () => {
            const ast = await parseAndExpectSuccess(`
                state def ConcurrentMachine {
                    parallel state active {
                        state regionA {
                            state a1;
                            state a2;
                        }
                        state regionB {
                            state b1;
                            state b2;
                        }
                    }
                }
            `);
        });
    });

    describe('Entry Action', () => {
        it('should parse entry action', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        entry action initialize;
                    }
                }
            `);
        });

        it('should parse entry action with body', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        entry action {
                            attribute count = 0;
                        }
                    }
                }
            `);
        });

        it('should parse entry with type', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        entry action : InitAction;
                    }
                }
            `);
        });
    });

    describe('Exit Action', () => {
        it('should parse exit action', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        exit action cleanup;
                    }
                }
            `);
        });

        it('should parse exit action with body', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        exit action {
                            send notification to observer;
                        }
                    }
                }
            `);
        });
    });

    describe('Do Action', () => {
        it('should parse do action', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state processing {
                        do action work;
                    }
                }
            `);
        });

        it('should parse do action with body', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state running {
                        do action {
                            while active { action step; }
                        }
                    }
                }
            `);
        });
    });

    describe('Transition', () => {
        it('should parse simple transition', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state s1;
                    state s2;
                    transition first s1 then s2;
                }
            `);
        });

        it('should parse named transition', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state s1;
                    state s2;
                    transition t1 first s1 then s2;
                }
            `);
        });

        it('should parse transition with accept trigger', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state idle;
                    state active;
                    transition first idle accept startSignal then active;
                }
            `);
        });

        it('should parse transition with guard', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state s1;
                    state s2;
                    transition first s1 if condition then s2;
                }
            `);
        });

        it('should parse transition with effect', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state s1;
                    state s2;
                    transition first s1 do action effect then s2;
                }
            `);
        });

        it('should parse transition with trigger, guard, and effect', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state s1;
                    state s2;
                    transition first s1 accept trigger if guard do action effect then s2;
                }
            `);
        });
    });

    describe('Complete State Machines', () => {
        it('should parse traffic light state machine', async () => {
            const ast = await parseAndExpectSuccess(`
                state def TrafficLight {
                    entry action startTimer;

                    state red {
                        entry action displayRed;
                    }
                    state yellow {
                        entry action displayYellow;
                    }
                    state green {
                        entry action displayGreen;
                    }

                    transition first red accept timeout then green;
                    transition first green accept timeout then yellow;
                    transition first yellow accept timeout then red;
                }
            `);
        });

        it('should parse state machine with nested states and transitions', async () => {
            const ast = await parseAndExpectSuccess(`
                state def DeviceState {
                    state off;
                    state on {
                        state idle;
                        state working {
                            do action process;
                        }
                        state error {
                            entry action logError;
                        }

                        transition first idle accept start then working;
                        transition first working accept done then idle;
                        transition first working accept failure then error;
                    }

                    transition first off accept powerOn then on;
                    transition first on accept powerOff then off;
                }
            `);
        });
    });

    describe('State with Entry/Exit/Do Combined', () => {
        it('should parse state with all actions', async () => {
            const ast = await parseAndExpectSuccess(`
                state def S {
                    state active {
                        entry action onEnter;
                        do action whileActive;
                        exit action onExit;
                    }
                }
            `);
        });
    });
});
