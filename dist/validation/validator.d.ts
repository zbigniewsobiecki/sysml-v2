import type { ValidationAcceptor } from 'langium';
import type { RootNamespace, PartDefinition, PartUsage, AttributeDefinition, AttributeUsage, MultiplicityBounds, QualifiedName, PackageBody, TypeBodyRule, FeatureBodyRule } from '../language/generated/ast.js';
import type { SysMLServices } from '../language/sysml-module.js';
/**
 * Register custom validation checks for SysML.
 */
export declare function registerValidationChecks(services: SysMLServices): void;
/**
 * SysML Validator implementing semantic validation rules.
 */
export declare class SysMLValidator {
    /**
     * Check root namespace for duplicate top-level names.
     */
    checkRootNamespace(root: RootNamespace, accept: ValidationAcceptor): void;
    /**
     * Check package body for duplicate member names.
     */
    checkPackageBody(pkg: PackageBody, accept: ValidationAcceptor): void;
    /**
     * Check part definition for valid structure (for nodes with $type: 'PartDefinition').
     */
    checkPartDefinition(def: PartDefinition, accept: ValidationAcceptor): void;
    /**
     * Check TypeBodyRule nodes (nodes with $type: 'TypeBodyRule').
     * This handles definitions with { } bodies.
     */
    checkTypeBodyRule(bodyRule: TypeBodyRule, accept: ValidationAcceptor): void;
    /**
     * Check FeatureBodyRule nodes (nodes with $type: 'FeatureBodyRule').
     * Note: With body= property assignment, these nodes are now nested and
     * validation is handled by parent rules (checkPartUsage, etc.)
     */
    checkFeatureBodyRule(_bodyRule: FeatureBodyRule, _accept: ValidationAcceptor): void;
    /**
     * Check part usage for required typing.
     */
    checkPartUsage(usage: PartUsage, accept: ValidationAcceptor): void;
    /**
     * Check attribute definition.
     */
    checkAttributeDefinition(_def: AttributeDefinition, _accept: ValidationAcceptor): void;
    /**
     * Check attribute usage.
     */
    checkAttributeUsage(usage: AttributeUsage, accept: ValidationAcceptor): void;
    /**
     * Check multiplicity bounds are valid.
     */
    checkMultiplicity(mult: MultiplicityBounds, accept: ValidationAcceptor): void;
    /**
     * Check qualified name references.
     */
    checkQualifiedName(qn: QualifiedName, accept: ValidationAcceptor): void;
}
//# sourceMappingURL=validator.d.ts.map