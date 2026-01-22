/**
 * SARIF reporter for validation results
 *
 * Outputs diagnostics in SARIF (Static Analysis Results Interchange Format)
 * for integration with GitHub Actions and other CI tools.
 *
 * SARIF Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html
 */

import type { Diagnostic } from 'vscode-languageserver-types';
import type { ValidationResult } from '../../utils/parser-utils.js';
import { severityToSarifLevel, DiagnosticSeverity } from '../utils/diagnostic-utils.js';

interface FileResult {
    file: string;
    absolutePath: string;
    result: ValidationResult;
}

// SARIF types
interface SarifLog {
    $schema: string;
    version: string;
    runs: SarifRun[];
}

interface SarifRun {
    tool: SarifTool;
    results: SarifResult[];
    artifacts?: SarifArtifact[];
}

interface SarifTool {
    driver: SarifToolComponent;
}

interface SarifToolComponent {
    name: string;
    version: string;
    informationUri?: string;
    rules?: SarifReportingDescriptor[];
}

interface SarifReportingDescriptor {
    id: string;
    name?: string;
    shortDescription?: { text: string };
}

interface SarifResult {
    ruleId: string;
    level: 'none' | 'note' | 'warning' | 'error';
    message: { text: string };
    locations: SarifLocation[];
}

interface SarifLocation {
    physicalLocation: SarifPhysicalLocation;
}

interface SarifPhysicalLocation {
    artifactLocation: { uri: string };
    region: SarifRegion;
}

interface SarifRegion {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}

interface SarifArtifact {
    location: { uri: string };
}

/**
 * Format validation results as SARIF.
 */
export function formatSarif(fileResults: FileResult[]): string {
    const results: SarifResult[] = [];
    const artifacts: SarifArtifact[] = [];
    const seenFiles = new Set<string>();

    for (const { file, result } of fileResults) {
        // Add artifact for each file
        if (!seenFiles.has(file)) {
            seenFiles.add(file);
            artifacts.push({
                location: { uri: file }
            });
        }

        // Convert diagnostics to SARIF results
        for (const diagnostic of result.diagnostics) {
            results.push(convertToSarifResult(diagnostic, file));
        }
    }

    const sarifLog: SarifLog = {
        $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
        version: '2.1.0',
        runs: [
            {
                tool: {
                    driver: {
                        name: 'sysml-parser',
                        version: '0.1.0',
                        informationUri: 'https://github.com/your-org/sysml-parser',
                        rules: [
                            {
                                id: 'syntax-error',
                                name: 'Syntax Error',
                                shortDescription: { text: 'Syntax error in SysML source' }
                            },
                            {
                                id: 'semantic-error',
                                name: 'Semantic Error',
                                shortDescription: { text: 'Semantic error in SysML model' }
                            },
                            {
                                id: 'validation-warning',
                                name: 'Validation Warning',
                                shortDescription: { text: 'Potential issue in SysML model' }
                            },
                            {
                                id: 'validation-hint',
                                name: 'Validation Hint',
                                shortDescription: { text: 'Suggestion for SysML model' }
                            }
                        ]
                    }
                },
                results,
                artifacts
            }
        ]
    };

    return JSON.stringify(sarifLog, null, 2);
}

/**
 * Convert a Langium Diagnostic to a SARIF Result.
 */
function convertToSarifResult(diagnostic: Diagnostic, file: string): SarifResult {
    return {
        ruleId: getRuleId(diagnostic),
        level: severityToSarifLevel(diagnostic.severity),
        message: { text: diagnostic.message },
        locations: [
            {
                physicalLocation: {
                    artifactLocation: { uri: file },
                    region: {
                        startLine: diagnostic.range.start.line + 1,
                        startColumn: diagnostic.range.start.character + 1,
                        endLine: diagnostic.range.end.line + 1,
                        endColumn: diagnostic.range.end.character + 1
                    }
                }
            }
        ]
    };
}

/**
 * Get rule ID based on diagnostic.
 */
function getRuleId(diagnostic: Diagnostic): string {
    switch (diagnostic.severity) {
        case DiagnosticSeverity.Error:
            return diagnostic.code ? String(diagnostic.code) : 'semantic-error';
        case DiagnosticSeverity.Warning:
            return 'validation-warning';
        default:
            return 'validation-hint';
    }
}
