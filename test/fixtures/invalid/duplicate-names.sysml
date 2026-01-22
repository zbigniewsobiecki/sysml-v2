/**
 * Invalid: Duplicate names test fixture
 * This file contains duplicate name errors
 */
package DuplicateNames {
    // Error: Duplicate part definition name
    part def Component;
    part def Component;

    // Error: Duplicate package name
    package Inner;
    package Inner;
}

// Error: Duplicate at root level
part def RootType;
part def RootType;
