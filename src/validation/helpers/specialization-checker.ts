/**
 * Specialization validation utilities
 *
 * Provides helpers for checking circular and invalid specializations.
 */

import type { AstNode, ValidationAcceptor } from 'langium';
import type { QualifiedName } from '../../language/generated/ast.js';

/**
 * Check for circular self-specialization.
 *
 * Reports an error if any specialization references the element itself.
 *
 * @param node - The AST node being validated
 * @param specializations - Array of QualifiedName specializations to check
 * @param selfName - The name of the element being validated
 * @param accept - The ValidationAcceptor to report errors to
 * @param elementType - Type name for error message (e.g., "Part definition")
 */
export function checkCircularSpecialization(
    node: AstNode,
    specializations: QualifiedName[] | undefined,
    selfName: string | undefined,
    accept: ValidationAcceptor,
    elementType: string = 'Part definition'
): void {
    if (!specializations || !selfName) {
        return;
    }

    for (const spec of specializations) {
        // Check if single-part qualified name matches self
        if (spec.names && spec.names.length === 1 && spec.names[0] === selfName) {
            accept('error', `${elementType} '${selfName}' cannot specialize itself`, {
                node,
                property: 'specializations'
            });
        }
    }
}
