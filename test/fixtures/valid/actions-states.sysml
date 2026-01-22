/**
 * Actions and states test fixture
 * Demonstrates behavioral modeling
 */
package Behavior {
    // Action definitions
    action def SimpleAction;

    action def ParameterizedAction(
        in input : Data,
        out output : Result
    );

    action def ProcessAction {
        action step1;
        action step2;
        action step3;

        succession first step1 then step2;
        succession first step2 then step3;
    }

    action def ControlFlowAction {
        attribute condition = true;

        if condition {
            action thenAction;
        } else {
            action elseAction;
        }

        while condition {
            action loopBody;
        }

        for item in items {
            action processItem;
        }
    }

    // State definitions
    state def SimpleState;

    state def StateMachine {
        state idle {
            entry action onEnter;
            exit action onExit;
        }

        state running {
            do action process;
        }

        state error;

        transition first idle accept start then running;
        transition first running accept stop then idle;
        transition first running accept fault then error;
    }

    state def ParallelState {
        parallel state concurrent {
            state region1 {
                state a;
                state b;
            }
            state region2 {
                state c;
                state d;
            }
        }
    }

    // Types used by actions
    item def Data;
    item def Result;
    item def items [*];
}
