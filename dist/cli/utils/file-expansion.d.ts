/**
 * File pattern expansion utility
 *
 * Shared utility for expanding glob patterns and directory paths to file lists.
 * Used by parse, validate, and export commands.
 */
/**
 * Expand file patterns (globs) to actual file paths.
 *
 * Handles:
 * - Glob patterns (*.sysml, **\/*.kerml, etc.)
 * - Direct file paths
 * - Directory paths (recursively finds .sysml and .kerml files)
 *
 * @param patterns - Array of file patterns, paths, or directories
 * @returns Array of absolute file paths with duplicates removed
 */
export declare function expandFilePatterns(patterns: string[]): Promise<string[]>;
//# sourceMappingURL=file-expansion.d.ts.map