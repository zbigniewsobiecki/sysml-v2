/**
 * Element utilities
 *
 * Shared utilities for working with SysML AST elements,
 * particularly for extracting names from various element types.
 */
/**
 * Type guard to check if an element has a name property.
 */
export function isNamedElement(element) {
    return typeof element === 'object' &&
        element !== null &&
        'name' in element;
}
/**
 * Get the name of an element, if it has one.
 *
 * Works with any AST node that has a `name` property (string | undefined).
 * This covers all SysML definition and usage types including:
 * - PackageBody, LibraryPackage
 * - PartDefinition, PartUsage
 * - AttributeDefinition, AttributeUsage
 * - ActionDefinition, ActionUsage
 * - ConstraintDefinition, ConstraintUsage
 * - RequirementDefinition, RequirementUsage
 * - ItemDefinition, ItemUsage
 * - And all other named elements
 *
 * @param element - The AST node to get the name from
 * @returns The element's name, or undefined if it has no name
 */
export function getElementName(element) {
    return element.name;
}
/**
 * Extract elements with names from a collection.
 *
 * Filters and maps a collection of elements to only those with names,
 * returning pairs of (name, element).
 *
 * @param elements - Array of elements to process
 * @param getName - Optional custom function to extract name (defaults to getElementName)
 * @returns Array of {name, element} pairs for elements that have names
 */
export function extractNamedElements(elements, getName = getElementName) {
    const result = [];
    for (const element of elements) {
        const name = getName(element);
        if (name) {
            result.push({ name, element });
        }
    }
    return result;
}
/**
 * Count occurrences of each name in a collection of elements.
 *
 * @param elements - Array of elements to count
 * @param getName - Optional custom function to extract name
 * @returns Map from name to count
 */
export function countElementNames(elements, getName = getElementName) {
    const counts = new Map();
    for (const element of elements) {
        const name = getName(element);
        if (name) {
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }
    }
    return counts;
}
//# sourceMappingURL=element-utils.js.map