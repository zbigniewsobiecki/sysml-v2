/**
 * Invalid: Self-specialization test fixture
 * This file contains circular specialization errors
 */
package SelfSpecialization {
    // Error: Part definition specializes itself
    part def A :> A;

    // Error: Using keyword form
    part def B specializes B;
}
