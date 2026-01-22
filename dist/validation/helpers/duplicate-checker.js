/**
 * Duplicate name detection utilities for validation
 *
 * Provides reusable logic for finding and reporting duplicate element names
 * within namespaces and packages.
 */
import { getElementName } from '../../utils/element-utils.js';
/**
 * Find duplicate names among a collection of elements.
 *
 * @param elements - Array of elements to check
 * @param getName - Optional custom function to extract name (defaults to getElementName)
 * @returns Result containing maps of duplicates and name counts
 */
export function findDuplicateNames(elements, getName = getElementName) {
    const nameCounts = new Map();
    const elementsByName = new Map();
    for (const element of elements) {
        const name = getName(element);
        if (name) {
            nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
            const existing = elementsByName.get(name) ?? [];
            existing.push(element);
            elementsByName.set(name, existing);
        }
    }
    // Filter to only duplicates (count > 1)
    const duplicates = new Map();
    for (const [name, elements] of elementsByName) {
        if (elements.length > 1) {
            duplicates.set(name, elements);
        }
    }
    return { duplicates, nameCounts };
}
/**
 * Report duplicate name errors using a ValidationAcceptor.
 *
 * @param result - The result from findDuplicateNames
 * @param accept - The ValidationAcceptor to report errors to
 * @param options - Configuration for how to report duplicates
 */
export function reportDuplicates(result, accept, options = {}) {
    const { reportAll = true, contextName, property = 'name' } = options;
    for (const [name, elements] of result.duplicates) {
        const message = contextName
            ? `Duplicate element name '${name}' in ${contextName}`
            : `Duplicate element name: '${name}'`;
        if (reportAll) {
            // Report on all instances
            for (const element of elements) {
                accept('error', message, { node: element, property });
            }
        }
        else {
            // Report only on the first instance
            accept('error', message, { node: elements[0], property });
        }
    }
}
/**
 * Combined helper that finds and reports duplicates in one call.
 *
 * @param elements - Array of elements to check
 * @param accept - The ValidationAcceptor to report errors to
 * @param options - Configuration for detection and reporting
 */
export function checkAndReportDuplicates(elements, accept, options = {}) {
    const { getName = getElementName, ...reportOptions } = options;
    const result = findDuplicateNames(elements, getName);
    reportDuplicates(result, accept, reportOptions);
}
//# sourceMappingURL=duplicate-checker.js.map