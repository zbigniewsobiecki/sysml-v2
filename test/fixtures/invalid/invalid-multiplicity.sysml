/**
 * Invalid: Multiplicity test fixture
 * This file contains invalid multiplicity bounds
 */
package InvalidMultiplicity {
    // Error: Lower bound greater than upper bound
    part def BadBounds {
        part items [10..5];
    }

    // Error: Another invalid range
    part def AlsoBad {
        part x [100..1];
    }

    // Error: Large invalid range
    part def VeryBad {
        part y [1000..100];
    }
}
