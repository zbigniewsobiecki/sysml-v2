/**
 * Common SysML fixture helpers for tests
 *
 * Provides simple functions to generate common SysML code snippets
 * for use in tests.
 */

export const fixtures = {
    /**
     * Create a part definition.
     * @param name - The part definition name
     * @param body - Optional body content (without braces)
     * @returns SysML part def code
     */
    partDef: (name: string, body = ''): string =>
        body ? `part def ${name} { ${body} }` : `part def ${name};`,

    /**
     * Create a package with content.
     * @param name - The package name
     * @param body - The package body content (without braces)
     * @returns SysML package code
     */
    pkg: (name: string, body: string): string =>
        `package ${name} { ${body} }`,

    /**
     * Create a part definition with a single child part.
     * @param childName - The child part name
     * @param type - The type of the child part (default: 'Type')
     * @returns SysML part def with child
     */
    partWithChild: (childName: string, type = 'Type'): string =>
        `part def P { part ${childName} : ${type}; }`,

    /**
     * Create an attribute definition.
     * @param name - The attribute definition name
     * @param body - Optional body content
     * @returns SysML attribute def code
     */
    attrDef: (name: string, body = ''): string =>
        body ? `attribute def ${name} { ${body} }` : `attribute def ${name};`,

    /**
     * Create an action definition.
     * @param name - The action definition name
     * @param body - Optional body content
     * @returns SysML action def code
     */
    actionDef: (name: string, body = ''): string =>
        body ? `action def ${name} { ${body} }` : `action def ${name};`,

    /**
     * Create a state definition.
     * @param name - The state definition name
     * @param body - Optional body content
     * @returns SysML state def code
     */
    stateDef: (name: string, body = ''): string =>
        body ? `state def ${name} { ${body} }` : `state def ${name};`,

    /**
     * Create a port definition.
     * @param name - The port definition name
     * @param body - Optional body content
     * @returns SysML port def code
     */
    portDef: (name: string, body = ''): string =>
        body ? `port def ${name} { ${body} }` : `port def ${name};`,

    /**
     * Create a requirement definition.
     * @param name - The requirement definition name
     * @param body - Optional body content
     * @returns SysML requirement def code
     */
    reqDef: (name: string, body = ''): string =>
        body ? `requirement def ${name} { ${body} }` : `requirement def ${name};`,

    /**
     * Create an import statement.
     * @param path - The import path (e.g., 'A::B::C')
     * @returns SysML import code
     */
    import: (path: string): string => `import ${path};`,

    /**
     * Create a wildcard import statement.
     * @param path - The import path (e.g., 'A::B')
     * @returns SysML wildcard import code
     */
    importWildcard: (path: string): string => `import ${path}::*;`,
};
