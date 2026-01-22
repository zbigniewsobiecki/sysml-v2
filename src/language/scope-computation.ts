import type { AstNode, AstNodeDescription, LangiumDocument, PrecomputedScopes } from 'langium';
import { DefaultScopeComputation, MultiMap } from 'langium';
import type { SysMLServices } from './sysml-module.js';
import type { RootNamespace, NamespaceElement } from './generated/ast.js';
import {
    isPackageBody,
    isOwningMembership,
    isTypeBodyRule,
    isFeatureBodyRule
} from './generated/ast.js';
import { getElementName } from '../utils/element-utils.js';

/**
 * Custom scope computation for SysML that handles:
 * - Namespace hierarchies (packages, definitions)
 * - Qualified name exports
 * - Visibility rules
 */
export class SysMLScopeComputation extends DefaultScopeComputation {
    constructor(services: SysMLServices) {
        super(services);
    }

    /**
     * Compute exports for a document - these are elements visible from other documents.
     */
    override async computeExports(document: LangiumDocument): Promise<AstNodeDescription[]> {
        const exports: AstNodeDescription[] = [];
        const root = document.parseResult.value as RootNamespace;

        if (root && root.namespaceElements) {
            for (const element of root.namespaceElements) {
                this.processNamespaceElement(element, [], exports, document);
            }
        }

        return exports;
    }

    /**
     * Compute local scopes within a document.
     */
    override async computeLocalScopes(document: LangiumDocument): Promise<PrecomputedScopes> {
        const scopes = new MultiMap<AstNode, AstNodeDescription>();
        const root = document.parseResult.value as RootNamespace;

        if (root && root.namespaceElements) {
            this.processLocalScopes(root, root.namespaceElements, scopes, document);
        }

        return scopes;
    }

    /**
     * Process a namespace element for exports, building qualified names.
     */
    private processNamespaceElement(
        element: NamespaceElement,
        qualifiedNameParts: string[],
        exports: AstNodeDescription[],
        document: LangiumDocument
    ): void {
        if (isOwningMembership(element)) {
            const visibility = element.visibility;
            // Only export public and default (no visibility specified) elements
            if (visibility === 'private' || visibility === 'protected') {
                return;
            }

            const innerElement = element.element;
            if (innerElement) {
                this.processDefinitionOrUsage(innerElement, qualifiedNameParts, exports, document);
            }
        }
    }

    /**
     * Process a definition or usage element.
     */
    private processDefinitionOrUsage(
        element: AstNode,
        qualifiedNameParts: string[],
        exports: AstNodeDescription[],
        document: LangiumDocument
    ): void {
        const name = getElementName(element);

        if (name) {
            const newQualifiedParts = [...qualifiedNameParts, name];
            const qualifiedName = newQualifiedParts.join('::');

            // Add this element to exports with both simple and qualified names
            exports.push(this.descriptions.createDescription(element, name, document));
            if (qualifiedNameParts.length > 0) {
                exports.push(this.descriptions.createDescription(element, qualifiedName, document));
            }

            // Process nested elements
            this.processNestedElements(element, newQualifiedParts, exports, document);
        }
    }

    /**
     * Process nested elements within a container.
     */
    private processNestedElements(
        container: AstNode,
        qualifiedNameParts: string[],
        exports: AstNodeDescription[],
        document: LangiumDocument
    ): void {
        // PackageBody has elements directly
        if (isPackageBody(container)) {
            for (const element of container.elements) {
                this.processNamespaceElement(element, qualifiedNameParts, exports, document);
            }
            return;
        }

        // TypeBodyRule and FeatureBodyRule have elements directly
        if (isTypeBodyRule(container) || isFeatureBodyRule(container)) {
            for (const element of (container as { elements?: AstNode[] }).elements ?? []) {
                if (isOwningMembership(element)) {
                    this.processNamespaceElement(element, qualifiedNameParts, exports, document);
                }
            }
            return;
        }

        // Check for elements directly on the container (for other cases)
        const elementsContainer = container as { elements?: AstNode[] };
        if (elementsContainer.elements && Array.isArray(elementsContainer.elements)) {
            for (const element of elementsContainer.elements) {
                if (isOwningMembership(element)) {
                    this.processNamespaceElement(element, qualifiedNameParts, exports, document);
                }
            }
        }
    }

    /**
     * Process elements for local scopes.
     */
    private processLocalScopes(
        container: AstNode,
        elements: NamespaceElement[],
        scopes: MultiMap<AstNode, AstNodeDescription>,
        document: LangiumDocument
    ): void {
        for (const element of elements) {
            if (isOwningMembership(element) && element.element) {
                const innerElement = element.element;
                const name = getElementName(innerElement);

                if (name) {
                    // Add to the container's scope
                    scopes.add(container, this.descriptions.createDescription(innerElement, name, document));

                    // Process nested scopes
                    this.processNestedLocalScopes(innerElement, scopes, document);
                }
            }
        }
    }

    /**
     * Process nested local scopes.
     */
    private processNestedLocalScopes(
        container: AstNode,
        scopes: MultiMap<AstNode, AstNodeDescription>,
        document: LangiumDocument
    ): void {
        // PackageBody has elements directly
        if (isPackageBody(container)) {
            this.processLocalScopes(container, container.elements, scopes, document);
            return;
        }

        // TypeBodyRule and FeatureBodyRule have elements directly
        if (isTypeBodyRule(container) || isFeatureBodyRule(container)) {
            const bodyElements = (container as { elements?: AstNode[] }).elements ?? [];
            const namespaceElements = bodyElements.filter(isOwningMembership);
            this.processLocalScopes(container, namespaceElements, scopes, document);
            return;
        }

        // Check for elements directly on the container (for other cases)
        const elementsContainer = container as { elements?: AstNode[] };
        if (elementsContainer.elements && Array.isArray(elementsContainer.elements)) {
            const namespaceElements = elementsContainer.elements.filter(isOwningMembership);
            this.processLocalScopes(container, namespaceElements, scopes, document);
        }
    }
}
