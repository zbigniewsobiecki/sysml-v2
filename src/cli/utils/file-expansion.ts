/**
 * File pattern expansion utility
 *
 * Shared utility for expanding glob patterns and directory paths to file lists.
 * Used by parse, validate, and export commands.
 */

import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';

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
export async function expandFilePatterns(patterns: string[]): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of patterns) {
        // Check if it's a glob pattern
        if (pattern.includes('*') || pattern.includes('?')) {
            const matches = await glob(pattern, {
                nodir: true,
                absolute: true
            });
            files.push(...matches);
        } else {
            // Direct file path
            const absolutePath = path.resolve(pattern);
            try {
                const stat = await fs.stat(absolutePath);
                if (stat.isFile()) {
                    files.push(absolutePath);
                } else if (stat.isDirectory()) {
                    // If directory, find all .sysml and .kerml files
                    const dirFiles = await glob(`${absolutePath}/**/*.{sysml,kerml}`, {
                        nodir: true,
                        absolute: true
                    });
                    files.push(...dirFiles);
                }
            } catch {
                // File doesn't exist, will be reported as error later
                files.push(absolutePath);
            }
        }
    }

    // Remove duplicates
    return [...new Set(files)];
}
