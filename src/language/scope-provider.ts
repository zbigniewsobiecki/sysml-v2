import type { AstNode, AstNodeDescription, ReferenceInfo, Scope } from 'langium';
import { AstUtils, DefaultScopeProvider, EMPTY_SCOPE } from 'langium';
import type { SysMLServices } from './sysml-module.js';
import type { QualifiedName } from './generated/ast.js';
import { isQualifiedName, isRootNamespace, isPackageBody, isOwningMembership } from './generated/ast.js';
import { getElementName } from '../utils/element-utils.js';

/**
 * Custom scope provider for SysML that handles:
 * - Qualified name resolution (A::B::C)
 * - Import resolution (import A::*;)
 * - Nested namespace scopes
 */
export class SysMLScopeProvider extends DefaultScopeProvider {
    private readonly sysmlServices: SysMLServices;

    constructor(services: SysMLServices) {
        super(services);
        this.sysmlServices = services;
    }

    /**
     * Get the scope for a reference.
     */
    override getScope(context: ReferenceInfo): Scope {
        // Handle qualified names specially
        if (this.isPartOfQualifiedName(context)) {
            return this.getQualifiedNameScope(context);
        }

        // Default behavior for simple references
        return super.getScope(context);
    }

    /**
     * Check if this reference is part of a qualified name.
     */
    private isPartOfQualifiedName(context: ReferenceInfo): boolean {
        const container = context.container;
        return isQualifiedName(container);
    }

    /**
     * Get scope for qualified name resolution.
     */
    private getQualifiedNameScope(context: ReferenceInfo): Scope {
        const qualifiedName = context.container as QualifiedName;
        const parts = qualifiedName.names;
        const index = context.index ?? 0;

        if (index === 0) {
            // First part - search in current scope and imports
            return this.getInitialScope(context);
        } else {
            // Subsequent parts - search within the previously resolved namespace
            const previousParts = parts.slice(0, index);
            return this.getNestedScope(previousParts);
        }
    }

    /**
     * Get the initial scope for the first part of a qualified name.
     * This includes:
     * - Elements in the current namespace
     * - Imported elements
     * - Global elements
     */
    private getInitialScope(context: ReferenceInfo): Scope {
        const document = AstUtils.getDocument(context.container);
        const rootNamespace = document.parseResult.value;

        if (!isRootNamespace(rootNamespace)) {
            return EMPTY_SCOPE;
        }

        // Collect all visible names
        const descriptions = this.indexManager.allElements().toArray();

        // Add local scope descriptions
        const localScope = this.getLocalScopeDescriptions(context.container);

        // Combine and create scope
        const combined: AstNodeDescription[] = [...descriptions];
        for (const local of localScope) {
            if (local.node) {
                combined.push({
                    name: local.name,
                    type: local.node.$type,
                    documentUri: AstUtils.getDocument(local.node).uri,
                    path: this.getNodePath(local.node),
                    node: local.node
                });
            }
        }

        return this.createScope(combined);
    }

    /**
     * Get nested scope for subsequent parts of a qualified name.
     */
    private getNestedScope(previousParts: string[]): Scope {
        const qualifiedPrefix = previousParts.join('::');

        // Find all elements that start with this prefix
        const descriptions = this.indexManager.allElements()
            .filter(desc => {
                const name = desc.name;
                // Match elements that are direct children of the namespace
                if (name.startsWith(qualifiedPrefix + '::')) {
                    const remainder = name.substring(qualifiedPrefix.length + 2);
                    // Only direct children (no more :: in the remainder)
                    return !remainder.includes('::');
                }
                return false;
            })
            .map(desc => {
                // Return with just the local name
                const fullName = desc.name;
                const localName = fullName.substring(qualifiedPrefix.length + 2);
                return {
                    ...desc,
                    name: localName
                };
            });

        return this.createScope(descriptions);
    }

    /**
     * Get local scope descriptions for an AST node.
     */
    private getLocalScopeDescriptions(node: AstNode): Array<{ name: string; node: AstNode }> {
        const descriptions: Array<{ name: string; node: AstNode }> = [];
        let current: AstNode | undefined = node;

        // Walk up the AST tree collecting visible names
        while (current) {
            this.collectVisibleNames(current, descriptions);
            current = current.$container;
        }

        return descriptions;
    }

    /**
     * Collect visible names from a scope container.
     */
    private collectVisibleNames(container: AstNode, descriptions: Array<{ name: string; node: AstNode }>): void {
        if (isRootNamespace(container) && container.namespaceElements) {
            for (const element of container.namespaceElements) {
                if (isOwningMembership(element) && element.element) {
                    const name = getElementName(element.element);
                    if (name) {
                        descriptions.push({ name, node: element.element });
                    }
                }
            }
        } else if (isPackageBody(container) && container.elements) {
            for (const element of container.elements) {
                if (isOwningMembership(element) && element.element) {
                    const name = getElementName(element.element);
                    if (name) {
                        descriptions.push({ name, node: element.element });
                    }
                }
            }
        }
    }

    /**
     * Get the path to an AST node for creating descriptions.
     */
    private getNodePath(node: AstNode): string {
        return this.sysmlServices.workspace.AstNodeLocator.getAstNodePath(node);
    }
}
