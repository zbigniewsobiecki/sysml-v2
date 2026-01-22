import { createDefaultCoreModule, createDefaultSharedCoreModule, inject } from 'langium';
import { SysMLGeneratedModule, SysMLGeneratedSharedModule } from './generated/module.js';
import { SysMLScopeComputation } from './scope-computation.js';
import { SysMLScopeProvider } from './scope-provider.js';
import { SysMLValidator, registerValidationChecks } from '../validation/validator.js';
/**
 * Dependency injection module that overrides Langium default services and contributes custom services.
 */
export const SysMLModule = {
    references: {
        ScopeComputation: (services) => new SysMLScopeComputation(services),
        ScopeProvider: (services) => new SysMLScopeProvider(services),
    },
    validation: {
        SysMLValidator: () => new SysMLValidator(),
    },
};
/**
 * Create the full set of services required for the SysML language.
 */
export function createSysMLServices(context) {
    const shared = inject(createDefaultSharedCoreModule(context), SysMLGeneratedSharedModule);
    const SysML = inject(createDefaultCoreModule({ shared }), SysMLGeneratedModule, SysMLModule);
    shared.ServiceRegistry.register(SysML);
    registerValidationChecks(SysML);
    return { shared, SysML };
}
//# sourceMappingURL=sysml-module.js.map