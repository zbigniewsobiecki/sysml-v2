/**
 * SysML v2 Parser
 *
 * A TypeScript parser for SysML v2 (Systems Modeling Language version 2.0)
 * that can parse .sysml and .kerml files, validate syntax, detect semantic
 * inconsistencies, and identify missing elements.
 */
export * from './language/generated/ast.js';
export { createSysMLServices, type SysMLServices, type SysMLAddedServices } from './language/sysml-module.js';
export { SysMLScopeComputation } from './language/scope-computation.js';
export { SysMLScopeProvider } from './language/scope-provider.js';
export { SysMLValidator, registerValidationChecks } from './validation/validator.js';
export { parseDocument, validateDocument, type ParseResult, type ValidationResult } from './utils/parser-utils.js';
//# sourceMappingURL=index.d.ts.map