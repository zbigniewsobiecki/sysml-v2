import type { AstNodeDescription, LangiumDocument, PrecomputedScopes } from 'langium';
import { DefaultScopeComputation } from 'langium';
import type { SysMLServices } from './sysml-module.js';
/**
 * Custom scope computation for SysML that handles:
 * - Namespace hierarchies (packages, definitions)
 * - Qualified name exports
 * - Visibility rules
 */
export declare class SysMLScopeComputation extends DefaultScopeComputation {
    constructor(services: SysMLServices);
    /**
     * Compute exports for a document - these are elements visible from other documents.
     */
    computeExports(document: LangiumDocument): Promise<AstNodeDescription[]>;
    /**
     * Compute local scopes within a document.
     */
    computeLocalScopes(document: LangiumDocument): Promise<PrecomputedScopes>;
    /**
     * Process a namespace element for exports, building qualified names.
     */
    private processNamespaceElement;
    /**
     * Process a definition or usage element.
     */
    private processDefinitionOrUsage;
    /**
     * Process nested elements within a container.
     */
    private processNestedElements;
    /**
     * Process elements for local scopes.
     */
    private processLocalScopes;
    /**
     * Process nested local scopes.
     */
    private processNestedLocalScopes;
}
//# sourceMappingURL=scope-computation.d.ts.map