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
export function serializeAst(node: AstNode | undefined | null, options: SerializeOptions = {}): object | undefined {
    if (!node) return undefined;

    return serializeNode(node, options) as object;
}

/**
 * Internal recursive serialization function.
 */
function serializeNode(node: unknown, options: SerializeOptions): unknown {
    if (node === null || node === undefined) {
        return node;
    }

    if (typeof node !== 'object') {
        return node;
    }

    if (Array.isArray(node)) {
        return node.map(item => serializeNode(item, options));
    }

    const result: Record<string, unknown> = {};
    const obj = node as Record<string, unknown>;

    // Include type information if requested
    if (options.includeTypes && obj.$type) {
        result.$type = obj.$type;
    }

    for (const key of Object.keys(obj)) {
        // Skip internal Langium properties
        if (key.startsWith('$')) continue;

        const value = obj[key];

        // Apply custom filter if provided
        if (options.propertyFilter && !options.propertyFilter(key, value)) {
            continue;
        }

        if (value === undefined || value === null) {
            continue;
        }

        if (typeof value === 'object') {
            result[key] = serializeNode(value, options);
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Simple AST to JSON conversion for parse command output.
 * Removes circular references and internal properties.
 */
export function astToJson(ast: AstNode | undefined | null): object | undefined {
    if (!ast) return undefined;

    return JSON.parse(JSON.stringify(ast, (key, value) => {
        // Skip internal Langium properties
        if (key.startsWith('$')) return undefined;
        // Skip circular references
        if (key === '$container') return undefined;
        return value;
    }));
}
