/**
 * Parse command implementation
 *
 * Parses SysML files and outputs the AST in various formats.
 */
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseFile } from '../../utils/parser-utils.js';
import { expandFilePatterns } from '../utils/file-expansion.js';
import { astToJson } from '../../utils/ast-serializer.js';
/**
 * Parse command handler.
 */
export async function parseCommand(filePatterns, options) {
    const files = await expandFilePatterns(filePatterns);
    if (files.length === 0) {
        console.error(chalk.yellow('No files found matching the provided patterns.'));
        process.exit(1);
    }
    const results = [];
    let hasErrors = false;
    for (const file of files) {
        try {
            const result = await parseFile(file);
            const output = {
                file: path.relative(process.cwd(), file),
                success: !result.hasErrors,
                ast: result.hasErrors ? undefined : astToJson(result.ast),
                errors: [...result.lexerErrors, ...result.parserErrors]
            };
            results.push(output);
            if (result.hasErrors) {
                hasErrors = true;
            }
        }
        catch (error) {
            results.push({
                file: path.relative(process.cwd(), file),
                success: false,
                errors: [{ message: String(error), line: 0, column: 0 }]
            });
            hasErrors = true;
        }
    }
    // Output results
    const output = formatOutput(results, options);
    if (options.output) {
        await fs.writeFile(options.output, output, 'utf-8');
        console.log(chalk.green(`Output written to ${options.output}`));
    }
    else {
        console.log(output);
    }
    // Exit with error code if any files failed to parse
    process.exit(hasErrors ? 1 : 0);
}
/**
 * Format output based on options.
 */
function formatOutput(results, options) {
    if (options.format === 'compact') {
        return JSON.stringify(results);
    }
    return JSON.stringify(results, null, 2);
}
//# sourceMappingURL=parse.js.map