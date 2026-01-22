import type { Module, LangiumCoreServices, PartialLangiumCoreServices, LangiumSharedCoreServices, DefaultSharedCoreModuleContext } from 'langium';
import { createDefaultCoreModule, createDefaultSharedCoreModule, inject } from 'langium';
import { SysMLGeneratedModule, SysMLGeneratedSharedModule } from './generated/module.js';
import { SysMLScopeComputation } from './scope-computation.js';
import { SysMLScopeProvider } from './scope-provider.js';
import { SysMLValidator, registerValidationChecks } from '../validation/validator.js';

/**
 * Declaration of custom services - this interface extends the default Langium services.
 */
export interface SysMLAddedServices {
    validation: {
        SysMLValidator: SysMLValidator;
    };
}

/**
 * Union of Langium default services and our custom services.
 */
export type SysMLServices = LangiumCoreServices & SysMLAddedServices;

/**
 * Dependency injection module that overrides Langium default services and contributes custom services.
 */
export const SysMLModule: Module<SysMLServices, PartialLangiumCoreServices & SysMLAddedServices> = {
    references: {
        ScopeComputation: (services: SysMLServices) => new SysMLScopeComputation(services),
        ScopeProvider: (services: SysMLServices) => new SysMLScopeProvider(services),
    },
    validation: {
        SysMLValidator: () => new SysMLValidator(),
    },
};

/**
 * Create the full set of services required for the SysML language.
 */
export function createSysMLServices(context: DefaultSharedCoreModuleContext): {
    shared: LangiumSharedCoreServices;
    SysML: SysMLServices;
} {
    const shared = inject(
        createDefaultSharedCoreModule(context),
        SysMLGeneratedSharedModule
    );
    const SysML = inject(
        createDefaultCoreModule({ shared }),
        SysMLGeneratedModule,
        SysMLModule
    );
    shared.ServiceRegistry.register(SysML);
    registerValidationChecks(SysML);
    return { shared, SysML };
}
