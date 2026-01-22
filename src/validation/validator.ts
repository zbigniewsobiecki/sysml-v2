import type { AstNode, ValidationAcceptor, ValidationChecks } from 'langium';
import type { SysMLAstType, RootNamespace, PartDefinition, PartUsage, AttributeDefinition, AttributeUsage, MultiplicityBounds, QualifiedName, PackageBody, TypeBodyRule, FeatureBodyRule, NamespaceElement } from '../language/generated/ast.js';
import type { SysMLServices } from '../language/sysml-module.js';
import { isOwningMembership } from '../language/generated/ast.js';
import { checkAndReportDuplicates } from './helpers/duplicate-checker.js';
import { checkCircularSpecialization } from './helpers/specialization-checker.js';
import { validateMultiplicityBounds } from './helpers/multiplicity-checker.js';

/**
 * Extract inner elements from OwningMembership wrappers.
 */
function extractInnerElements(elements: NamespaceElement[]): AstNode[] {
    const result: AstNode[] = [];
    for (const el of elements) {
        if (isOwningMembership(el) && el.element) {
            result.push(el.element);
        }
    }
    return result;
}

/**
 * Register custom validation checks for SysML.
 */
export function registerValidationChecks(services: SysMLServices): void {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SysMLValidator;

    const checks: ValidationChecks<SysMLAstType> = {
        RootNamespace: validator.checkRootNamespace,
        PackageBody: validator.checkPackageBody,
        PartDefinition: validator.checkPartDefinition,
        TypeBodyRule: validator.checkTypeBodyRule,
        PartUsage: validator.checkPartUsage,
        FeatureBodyRule: validator.checkFeatureBodyRule,
        AttributeDefinition: validator.checkAttributeDefinition,
        AttributeUsage: validator.checkAttributeUsage,
        MultiplicityBounds: validator.checkMultiplicity,
        QualifiedName: validator.checkQualifiedName,
    };

    registry.register(checks, validator);
}

/**
 * SysML Validator implementing semantic validation rules.
 */
export class SysMLValidator {
    /**
     * Check root namespace for duplicate top-level names.
     */
    checkRootNamespace(root: RootNamespace, accept: ValidationAcceptor): void {
        const elements = extractInnerElements(root.namespaceElements ?? []);
        checkAndReportDuplicates(elements, accept, { reportAll: true });
    }

    /**
     * Check package body for duplicate member names.
     */
    checkPackageBody(pkg: PackageBody, accept: ValidationAcceptor): void {
        const pkgName = pkg.name ?? '<anonymous>';
        const elements = extractInnerElements(pkg.elements ?? []);

        checkAndReportDuplicates(elements, accept, {
            reportAll: false,
            contextName: `package '${pkgName}'`
        });
    }

    /**
     * Check part definition for valid structure (for nodes with $type: 'PartDefinition').
     */
    checkPartDefinition(def: PartDefinition, accept: ValidationAcceptor): void {
        // Skip if this is actually a TypeBodyRule
        const nodeType = (def as unknown as { $type: string }).$type;
        if (nodeType !== 'PartDefinition') {
            return;
        }

        // Check for abstract part definition with no members
        if (def.isAbstract) {
            const body = (def as unknown as { body?: TypeBodyRule }).body;
            const hasNoMembers = !body || (body.elements ?? []).length === 0;
            if (hasNoMembers && def.name) {
                accept('hint', `Abstract part definition '${def.name}' has no members`, {
                    node: def,
                    property: 'name'
                });
            }
        }

        checkCircularSpecialization(def, def.specializations, def.name, accept);
    }

    /**
     * Check TypeBodyRule nodes (nodes with $type: 'TypeBodyRule').
     * This handles definitions with { } bodies.
     */
    checkTypeBodyRule(bodyRule: TypeBodyRule, accept: ValidationAcceptor): void {
        const asPartDef = bodyRule as unknown as PartDefinition;

        // Check for abstract part definition with no members
        const cstText = bodyRule.$cstNode?.text ?? '';
        const isAbstractFromCst = /^\s*abstract\s/.test(cstText);
        const hasNoMembers = (bodyRule.elements ?? []).length === 0;

        if ((asPartDef.isAbstract || isAbstractFromCst) && hasNoMembers) {
            accept('hint', `Abstract part definition '${asPartDef.name ?? '<anonymous>'}' has no members`, {
                node: bodyRule,
                property: 'name'
            });
        }

        checkCircularSpecialization(bodyRule, asPartDef.specializations, asPartDef.name, accept);
    }

    /**
     * Check FeatureBodyRule nodes (nodes with $type: 'FeatureBodyRule').
     * Note: With body= property assignment, these nodes are now nested and
     * validation is handled by parent rules (checkPartUsage, etc.)
     */
    checkFeatureBodyRule(_bodyRule: FeatureBodyRule, _accept: ValidationAcceptor): void {
        // Validation handled by parent usage rules
    }

    /**
     * Check part usage for required typing.
     */
    checkPartUsage(usage: PartUsage, accept: ValidationAcceptor): void {
        // Skip if this is actually a FeatureBodyRule
        const nodeType = (usage as unknown as { $type: string }).$type;
        if (nodeType !== 'PartUsage') {
            return;
        }

        // Part usages should typically have a type
        if (!usage.featureTypes || usage.featureTypes.length === 0) {
            // This is just a hint - untyped parts are allowed
            if (usage.name) {
                accept('hint', `Part '${usage.name}' has no explicit type`, {
                    node: usage,
                    property: 'name'
                });
            }
        }
    }

    /**
     * Check attribute definition.
     */
    checkAttributeDefinition(_def: AttributeDefinition, _accept: ValidationAcceptor): void {
        // Attribute definitions typically specialize DataType
        // This is informational for now
    }

    /**
     * Check attribute usage.
     */
    checkAttributeUsage(usage: AttributeUsage, accept: ValidationAcceptor): void {
        // Check if value expression is provided for computed attributes
        if (usage.valueComputed && !usage.valueExpression) {
            accept('error', `Computed attribute '${usage.name ?? '<anonymous>'}' requires a value expression`, {
                node: usage,
                property: 'valueComputed'
            });
        }
    }

    /**
     * Check multiplicity bounds are valid.
     */
    checkMultiplicity(mult: MultiplicityBounds, accept: ValidationAcceptor): void {
        const result = validateMultiplicityBounds(mult.lowerBound, mult.upperBound);

        if (!result.isValid && result.error) {
            accept('error', result.error, {
                node: mult,
                property: result.errorProperty
            });
        }
    }

    /**
     * Check qualified name references.
     */
    checkQualifiedName(qn: QualifiedName, accept: ValidationAcceptor): void {
        // Basic check - qualified name should have at least one part
        if (!qn.names || qn.names.length === 0) {
            accept('error', 'Qualified name must have at least one part', {
                node: qn
            });
        }
    }
}
