import type { Module, LangiumCoreServices, PartialLangiumCoreServices, LangiumSharedCoreServices, DefaultSharedCoreModuleContext } from 'langium';
import { SysMLValidator } from '../validation/validator.js';
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
export declare const SysMLModule: Module<SysMLServices, PartialLangiumCoreServices & SysMLAddedServices>;
/**
 * Create the full set of services required for the SysML language.
 */
export declare function createSysMLServices(context: DefaultSharedCoreModuleContext): {
    shared: LangiumSharedCoreServices;
    SysML: SysMLServices;
};
//# sourceMappingURL=sysml-module.d.ts.map