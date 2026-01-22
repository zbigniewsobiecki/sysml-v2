import { DefaultScopeComputation, MultiMap } from 'langium';
import { isPackageBody, isOwningMembership, isTypeBodyRule, isFeatureBodyRule } from './generated/ast.js';
import { getElementName } from '../utils/element-utils.js';
/**
 * Custom scope computation for SysML that handles:
 * - Namespace hierarchies (packages, definitions)
 * - Qualified name exports
 * - Visibility rules
 */
export class SysMLScopeComputation extends DefaultScopeComputation {
    constructor(services) {
        super(services);
    }
    /**
     * Compute exports for a document - these are elements visible from other documents.
     */
    async computeExports(document) {
        const exports = [];
        const root = document.parseResult.value;
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
    async computeLocalScopes(document) {
        const scopes = new MultiMap();
        const root = document.parseResult.value;
        if (root && root.namespaceElements) {
            this.processLocalScopes(root, root.namespaceElements, scopes, document);
        }
        return scopes;
    }
    /**
     * Process a namespace element for exports, building qualified names.
     */
    processNamespaceElement(element, qualifiedNameParts, exports, document) {
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
    processDefinitionOrUsage(element, qualifiedNameParts, exports, document) {
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
    processNestedElements(container, qualifiedNameParts, exports, document) {
        // PackageBody has elements directly
        if (isPackageBody(container)) {
            for (const element of container.elements) {
                this.processNamespaceElement(element, qualifiedNameParts, exports, document);
            }
            return;
        }
        // TypeBodyRule and FeatureBodyRule have elements directly
        if (isTypeBodyRule(container) || isFeatureBodyRule(container)) {
            for (const element of container.elements ?? []) {
                if (isOwningMembership(element)) {
                    this.processNamespaceElement(element, qualifiedNameParts, exports, document);
                }
            }
            return;
        }
        // Check for elements directly on the container (for other cases)
        const elementsContainer = container;
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
    processLocalScopes(container, elements, scopes, document) {
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
    processNestedLocalScopes(container, scopes, document) {
        // PackageBody has elements directly
        if (isPackageBody(container)) {
            this.processLocalScopes(container, container.elements, scopes, document);
            return;
        }
        // TypeBodyRule and FeatureBodyRule have elements directly
        if (isTypeBodyRule(container) || isFeatureBodyRule(container)) {
            const bodyElements = container.elements ?? [];
            const namespaceElements = bodyElements.filter(isOwningMembership);
            this.processLocalScopes(container, namespaceElements, scopes, document);
            return;
        }
        // Check for elements directly on the container (for other cases)
        const elementsContainer = container;
        if (elementsContainer.elements && Array.isArray(elementsContainer.elements)) {
            const namespaceElements = elementsContainer.elements.filter(isOwningMembership);
            this.processLocalScopes(container, namespaceElements, scopes, document);
        }
    }
}
//# sourceMappingURL=scope-computation.js.map