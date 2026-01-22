/**
 * Element utilities
 *
 * Shared utilities for working with SysML AST elements,
 * particularly for extracting names from various element types.
 */

import type { AstNode } from 'langium';

/** Interface for elements with an optional name property */
export interface NamedElement {
    name?: string;
}

/**
 * Type guard to check if an element has a name property.
 */
export function isNamedElement(element: unknown): element is NamedElement {
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
export function getElementName(element: AstNode): string | undefined {
    return (element as NamedElement).name;
}

/**
 * Result of extracting named elements from a collection.
 */
export interface NamedElementEntry<T> {
    name: string;
    element: T;
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
export function extractNamedElements<T extends AstNode>(
    elements: T[],
    getName: (el: T) => string | undefined = getElementName
): NamedElementEntry<T>[] {
    const result: NamedElementEntry<T>[] = [];

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
export function countElementNames<T extends AstNode>(
    elements: T[],
    getName: (el: T) => string | undefined = getElementName
): Map<string, number> {
    const counts = new Map<string, number>();

    for (const element of elements) {
        const name = getName(element);
        if (name) {
            counts.set(name, (counts.get(name) ?? 0) + 1);
        }
    }

    return counts;
}
