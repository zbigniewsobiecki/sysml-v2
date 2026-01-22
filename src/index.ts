/**
 * SysML v2 Parser
 *
 * A TypeScript parser for SysML v2 (Systems Modeling Language version 2.0)
 * that can parse .sysml and .kerml files, validate syntax, detect semantic
 * inconsistencies, and identify missing elements.
 */

// Re-export generated AST types
export * from './language/generated/ast.js';

// Re-export language services
export { createSysMLServices, type SysMLServices, type SysMLAddedServices } from './language/sysml-module.js';
export { SysMLScopeComputation } from './language/scope-computation.js';
export { SysMLScopeProvider } from './language/scope-provider.js';

// Re-export validation
export { SysMLValidator, registerValidationChecks } from './validation/validator.js';

// Export utility functions
export { parseDocument, validateDocument, type ParseResult, type ValidationResult } from './utils/parser-utils.js';
