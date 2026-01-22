/**
 * Export command implementation
 *
 * Exports SysML files to different formats (JSON, etc.)
 */

import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseFile } from '../../utils/parser-utils.js';
import { expandFilePatterns } from '../utils/file-expansion.js';
import { serializeAst } from '../../utils/ast-serializer.js';

interface ExportOptions {
    output?: string;
    format: 'json' | 'ast';
}

interface ExportOutput {
    file: string;
    content?: object;
    error?: string;
}

/**
 * Export command handler.
 */
export async function exportCommand(filePatterns: string[], options: ExportOptions): Promise<void> {
    const files = await expandFilePatterns(filePatterns);

    if (files.length === 0) {
        console.error(chalk.yellow('No files found matching the provided patterns.'));
        process.exit(1);
    }

    const results: ExportOutput[] = [];
    let hasErrors = false;

    for (const file of files) {
        try {
            const result = await parseFile(file);

            if (result.hasErrors) {
                results.push({
                    file: path.relative(process.cwd(), file),
                    error: 'Parse errors encountered'
                });
                hasErrors = true;
            } else {
                results.push({
                    file: path.relative(process.cwd(), file),
                    content: exportAst(result.ast, options.format)
                });
            }
        } catch (error) {
            results.push({
                file: path.relative(process.cwd(), file),
                error: String(error)
            });
            hasErrors = true;
        }
    }

    // Format output
    const output = formatExportOutput(results, options);

    if (options.output) {
        await fs.writeFile(options.output, output, 'utf-8');
        console.log(chalk.green(`Exported to ${options.output}`));
    } else {
        console.log(output);
    }

    process.exit(hasErrors ? 1 : 0);
}

/**
 * Export AST to the specified format.
 */
function exportAst(ast: unknown, format: string): object {
    if (!ast) return {};

    switch (format) {
        case 'ast':
            // Full AST with type information
            return serializeAst(ast as any, { includeTypes: true }) ?? {};
        case 'json':
        default:
            // Simplified JSON representation
            return serializeAst(ast as any, { includeTypes: false }) ?? {};
    }
}

/**
 * Format the export output.
 */
function formatExportOutput(results: ExportOutput[], _options: ExportOptions): string {
    if (results.length === 1 && results[0].content) {
        return JSON.stringify(results[0].content, null, 2);
    }

    return JSON.stringify(results, null, 2);
}
