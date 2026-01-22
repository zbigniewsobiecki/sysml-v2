/**
 * AST Serialization utilities
 *
 * Provides functions to serialize Langium AST nodes to JSON-compatible objects,
 * handling circular references and internal Langium properties.
 */
import type { AstNode } from 'langium';
export interface SerializeOptions {
    /** Include $type information in output */
    includeTypes?: boolean;
    /** Custom property filter - return false to exclude a property */
    propertyFilter?: (key: string, value: unknown) => boolean;
}
/**
 * Serialize an AST node to a JSON-compatible object.
 *
 * Handles:
 * - Circular references (via $container)
 * - Internal Langium properties ($ prefixed)
 * - Nested objects and arrays
 *
 * @param node - The AST node to serialize
 * @param options - Serialization options
 * @returns A JSON-compatible object representation
 */
export declare function serializeAst(node: AstNode | undefined | null, options?: SerializeOptions): object | undefined;
/**
 * Simple AST to JSON conversion for parse command output.
 * Removes circular references and internal properties.
 */
export declare function astToJson(ast: AstNode | undefined | null): object | undefined;
//# sourceMappingURL=ast-serializer.d.ts.map