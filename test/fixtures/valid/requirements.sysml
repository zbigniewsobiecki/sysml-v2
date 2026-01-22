/**
 * Requirements test fixture
 * Demonstrates requirement modeling
 */
package Requirements {
    // Part definitions for requirements
    part def System;
    part def User;
    part def Admin;

    // Simple requirement
    requirement def BasicRequirement;

    // Requirement with subject
    requirement def SubjectRequirement {
        subject sys : System;
    }

    // Requirement with actor
    requirement def ActorRequirement {
        actor user : User;
    }

    // Requirement with constraints
    requirement def ConstrainedRequirement {
        assume constraint precondition;
        require constraint postcondition;
    }

    // Complete requirement
    requirement def CompleteRequirement {
        subject sys : System;
        actor user : User;
        actor admin : Admin;

        assume constraint environmentAssumption;
        require constraint systemBehavior;

        requirement subreq1;
        requirement subreq2;
    }

    // Verification
    verification def TestCase {
        subject req : BasicRequirement;
    }

    // Use case
    use case def UserLogin {
        actor user : User;
        subject sys : System;

        objective {
            requirement loginSuccessful;
        }
    }

    // Concern
    concern def SecurityConcern {
        stakeholder securityTeam : Admin;
        require requirement secureAccess;
    }
}
