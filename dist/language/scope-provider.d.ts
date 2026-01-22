import type { ReferenceInfo, Scope } from 'langium';
import { DefaultScopeProvider } from 'langium';
import type { SysMLServices } from './sysml-module.js';
/**
 * Custom scope provider for SysML that handles:
 * - Qualified name resolution (A::B::C)
 * - Import resolution (import A::*;)
 * - Nested namespace scopes
 */
export declare class SysMLScopeProvider extends DefaultScopeProvider {
    private readonly sysmlServices;
    constructor(services: SysMLServices);
    /**
     * Get the scope for a reference.
     */
    getScope(context: ReferenceInfo): Scope;
    /**
     * Check if this reference is part of a qualified name.
     */
    private isPartOfQualifiedName;
    /**
     * Get scope for qualified name resolution.
     */
    private getQualifiedNameScope;
    /**
     * Get the initial scope for the first part of a qualified name.
     * This includes:
     * - Elements in the current namespace
     * - Imported elements
     * - Global elements
     */
    private getInitialScope;
    /**
     * Get nested scope for subsequent parts of a qualified name.
     */
    private getNestedScope;
    /**
     * Get local scope descriptions for an AST node.
     */
    private getLocalScopeDescriptions;
    /**
     * Collect visible names from a scope container.
     */
    private collectVisibleNames;
    /**
     * Get the path to an AST node for creating descriptions.
     */
    private getNodePath;
}
//# sourceMappingURL=scope-provider.d.ts.map