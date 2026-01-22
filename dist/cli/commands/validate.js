/**
 * Validate command implementation
 *
 * Validates SysML files and outputs diagnostics in various formats.
 */
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { validateFile } from '../../utils/parser-utils.js';
import { formatText } from '../reporters/text.js';
import { formatJson } from '../reporters/json.js';
import { formatSarif } from '../reporters/sarif.js';
import { expandFilePatterns } from '../utils/file-expansion.js';
/**
 * Validate command handler.
 */
export async function validateCommand(filePatterns, options) {
    const files = await expandFilePatterns(filePatterns);
    if (files.length === 0) {
        if (!options.quiet) {
            console.error(chalk.yellow('No files found matching the provided patterns.'));
        }
        process.exit(1);
    }
    const fileResults = [];
    let totalErrors = 0;
    let totalWarnings = 0;
    let totalHints = 0;
    for (const file of files) {
        try {
            const result = await validateFile(file);
            fileResults.push({
                file: path.relative(process.cwd(), file),
                absolutePath: file,
                result
            });
            totalErrors += result.errors.length;
            totalWarnings += result.warnings.length;
            totalHints += result.hints.length;
        }
        catch (error) {
            // Create a synthetic error result
            const errorDiagnostic = {
                message: String(error),
                severity: 1,
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 }
                }
            };
            fileResults.push({
                file: path.relative(process.cwd(), file),
                absolutePath: file,
                result: {
                    diagnostics: [errorDiagnostic],
                    errors: [errorDiagnostic],
                    warnings: [],
                    hints: [],
                    isValid: false
                }
            });
            totalErrors++;
        }
    }
    // Filter diagnostics based on options
    const filteredResults = fileResults.map(fr => ({
        ...fr,
        result: {
            ...fr.result,
            diagnostics: filterDiagnostics(fr.result.diagnostics, options)
        }
    }));
    // Format and output results
    if (!options.quiet) {
        const output = formatResults(filteredResults, options);
        if (options.output) {
            await fs.writeFile(options.output, output, 'utf-8');
            console.log(chalk.green(`Output written to ${options.output}`));
        }
        else {
            console.log(output);
        }
        // Print summary
        printSummary(files.length, totalErrors, totalWarnings, totalHints, options);
    }
    // Exit with error code if any errors found
    process.exit(totalErrors > 0 ? 1 : 0);
}
/**
 * Filter diagnostics based on options.
 */
function filterDiagnostics(diagnostics, options) {
    return diagnostics.filter(d => {
        // Always show errors
        if (d.severity === 1)
            return true;
        // Show warnings if requested
        if (d.severity === 2 && options.warnings)
            return true;
        // Show hints if requested
        if ((d.severity === 3 || d.severity === 4) && options.hints)
            return true;
        return false;
    });
}
/**
 * Format results based on output format.
 */
function formatResults(fileResults, options) {
    switch (options.format) {
        case 'json':
            return formatJson(fileResults);
        case 'sarif':
            return formatSarif(fileResults);
        case 'text':
        default:
            return formatText(fileResults, options.colors);
    }
}
/**
 * Print validation summary.
 */
function printSummary(fileCount, errors, warnings, hints, options) {
    if (options.quiet)
        return;
    console.log('');
    console.log(chalk.bold('Summary:'));
    console.log(`  Files checked: ${fileCount}`);
    if (errors > 0) {
        console.log(chalk.red(`  Errors: ${errors}`));
    }
    else {
        console.log(chalk.green(`  Errors: ${errors}`));
    }
    if (options.warnings) {
        if (warnings > 0) {
            console.log(chalk.yellow(`  Warnings: ${warnings}`));
        }
        else {
            console.log(`  Warnings: ${warnings}`);
        }
    }
    if (options.hints) {
        console.log(`  Hints: ${hints}`);
    }
    console.log('');
    if (errors === 0) {
        console.log(chalk.green.bold('Validation passed!'));
    }
    else {
        console.log(chalk.red.bold('Validation failed.'));
    }
}
//# sourceMappingURL=validate.js.map