/**
 * Simple package test fixture
 * Demonstrates basic package structure
 */
package SimplePackage {
    // Part definitions
    part def Component;
    part def SubComponent;

    // Part usages
    part def Assembly {
        part main : Component;
        part sub : SubComponent;
    }
}
