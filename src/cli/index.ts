#!/usr/bin/env node

/**
 * SysML v2 Parser CLI
 *
 * Command-line interface for parsing and validating SysML v2 files.
 */

import { Command } from 'commander';
import { parseCommand } from './commands/parse.js';
import { validateCommand } from './commands/validate.js';
import { exportCommand } from './commands/export.js';

const program = new Command();

program
    .name('sysml-parser')
    .description('SysML v2 Parser - Parse and validate SysML v2 files')
    .version('0.1.0');

// Parse command
program
    .command('parse')
    .description('Parse SysML files and output the AST')
    .argument('<files...>', 'Files or glob patterns to parse')
    .option('-o, --output <file>', 'Output file (default: stdout)')
    .option('-f, --format <format>', 'Output format: json, compact', 'json')
    .option('--no-colors', 'Disable colored output')
    .action(parseCommand);

// Validate command
program
    .command('validate')
    .description('Validate SysML files and report diagnostics')
    .argument('<files...>', 'Files or glob patterns to validate')
    .option('-f, --format <format>', 'Output format: text, json, sarif', 'text')
    .option('-o, --output <file>', 'Output file (default: stdout)')
    .option('--no-colors', 'Disable colored output')
    .option('-w, --warnings', 'Show warnings (default: only errors)', false)
    .option('--hints', 'Show hints (default: only errors)', false)
    .option('-q, --quiet', 'Suppress output, only use exit code', false)
    .action(validateCommand);

// Export command
program
    .command('export')
    .description('Export SysML files to different formats')
    .argument('<files...>', 'Files or glob patterns to export')
    .option('-f, --format <format>', 'Export format: json, ast', 'json')
    .option('-o, --output <file>', 'Output file (default: stdout)')
    .action(exportCommand);

// Default action (help)
program.parse();

// If no command was provided, show help
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
