/**
 * Part definition test fixture
 * Demonstrates various part definition patterns
 */
package PartDefinitions {
    // Simple definitions
    part def Simple;

    // Abstract definition
    abstract part def AbstractComponent;

    // Definition with specialization
    part def Specialized :> AbstractComponent;

    // Definition with multiple specializations
    part def MultiSpecialized :> AbstractComponent, Simple;

    // Definition with body
    part def Container {
        part child : Simple;
        attribute name : String;
    }

    // Definition with multiplicity
    part def Array [0..*];

    // Nested definitions
    part def Outer {
        part def Inner;
    }
}
