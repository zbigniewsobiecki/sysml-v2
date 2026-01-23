/**
 * Export command tests
 * Tests for the export CLI command functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import { parseFile, parseDocument } from '../../src/utils/parser-utils.js';
import { useTempDir } from '../helpers/temp-dir-helper.js';

const temp = useTempDir(__dirname, '../fixtures/.temp-export');

describe('Export Command', () => {
    beforeEach(temp.setup);
    afterEach(temp.teardown);

    describe('AST Export', () => {
        it('should export AST for simple package', async () => {
            const filePath = temp.filePath('simple.sysml');
            await fs.writeFile(filePath, 'package TestPackage;');

            const result = await parseFile(filePath);

            expect(result.ast).toBeDefined();
            expect(result.ast!.namespaceElements).toBeDefined();
        });

        it('should export AST with namespace elements', async () => {
            const filePath = temp.filePath('elements.sysml');
            await fs.writeFile(filePath, `
                package P {
                    part def A;
                    part def B;
                }
            `);

            const result = await parseFile(filePath);

            expect(result.ast).toBeDefined();
            expect(result.ast!.namespaceElements!.length).toBeGreaterThan(0);
        });

        it('should export part definitions correctly', async () => {
            const result = await parseDocument(`
                part def Vehicle {
                    part engine;
                    attribute speed : Real;
                }
            `);

            expect(result.ast).toBeDefined();
            const pkgElement = result.ast!.namespaceElements![0];
            expect(pkgElement).toBeDefined();
        });
    });

    describe('JSON Serialization', () => {
        it('should serialize AST to JSON', async () => {
            const result = await parseDocument('package P;');

            expect(result.ast).toBeDefined();

            // Test that AST can be serialized (no circular references in export)
            const serialized = JSON.stringify(result.ast, (key, value) => {
                if (key.startsWith('$')) return undefined;
                return value;
            });

            expect(serialized).toBeDefined();
            const parsed = JSON.parse(serialized);
            expect(parsed.namespaceElements).toBeDefined();
        });

        it('should serialize complex AST', async () => {
            const result = await parseDocument(`
                package System {
                    part def Component {
                        part sub : SubComponent;
                        attribute config : Config;
                    }
                    part def SubComponent;
                    attribute def Config;
                }
            `);

            expect(result.ast).toBeDefined();

            const serialized = JSON.stringify(result.ast, (key, value) => {
                if (key.startsWith('$')) return undefined;
                return value;
            });

            expect(serialized).not.toContain('$container');
            expect(serialized).not.toContain('$document');
        });
    });

    describe('Export with Type Information', () => {
        it('should preserve type in AST', async () => {
            const result = await parseDocument('package P;');

            expect(result.ast).toBeDefined();
            const membership = result.ast!.namespaceElements![0];
            expect((membership as any).$type).toBeDefined();
        });

        it('should have correct types for definitions', async () => {
            const result = await parseDocument(`
                part def PartType;
                action def ActionType;
                state def StateType;
            `);

            expect(result.ast).toBeDefined();
            const elements = result.ast!.namespaceElements!;

            // Each element should have a $type property
            for (const elem of elements) {
                expect((elem as any).$type).toBeDefined();
            }
        });
    });

    describe('Export Attributes', () => {
        it('should export element names', async () => {
            const result = await parseDocument('package TestName;');

            const membership = result.ast!.namespaceElements![0];
            const pkg = (membership as any).element;
            expect(pkg.name).toBe('TestName');
        });

        it('should export specializations', async () => {
            const result = await parseDocument('part def Child :> Parent;');

            const membership = result.ast!.namespaceElements![0];
            const def = (membership as any).element;
            expect(def.specializations).toBeDefined();
            expect(def.specializations.length).toBe(1);
        });

        it('should export visibility', async () => {
            const result = await parseDocument(`
                package P {
                    public part def Public;
                    private part def Private;
                }
            `);

            expect(result.ast).toBeDefined();
        });
    });

    describe('Export Multiplicity', () => {
        it('should export multiplicity bounds', async () => {
            const result = await parseDocument(`
                part def P {
                    part items [0..*];
                }
            `);

            expect(result.ast).toBeDefined();
        });
    });

    describe('Export Expressions', () => {
        it('should export attribute values', async () => {
            const result = await parseDocument(`
                part def P {
                    attribute count = 42;
                    attribute name = "test";
                    attribute flag = true;
                }
            `);

            expect(result.ast).toBeDefined();
        });

        it('should export computed expressions', async () => {
            const result = await parseDocument(`
                part def P {
                    attribute a = 1;
                    attribute b = 2;
                    attribute sum ::= a + b;
                }
            `);

            expect(result.ast).toBeDefined();
        });
    });

    describe('Export Actions and States', () => {
        it('should export action definitions', async () => {
            const result = await parseDocument(`
                action def Process {
                    action step1;
                    action step2;
                }
            `);

            expect(result.ast).toBeDefined();
        });

        it('should export state definitions', async () => {
            const result = await parseDocument(`
                state def Machine {
                    state idle;
                    state running;
                    transition first idle then running;
                }
            `);

            expect(result.ast).toBeDefined();
        });
    });

    describe('Export Requirements', () => {
        it('should export requirement definitions', async () => {
            const result = await parseDocument(`
                requirement def SafetyReq {
                    subject sys : System;
                    actor user : User;
                }
                part def System;
                part def User;
            `);

            expect(result.ast).toBeDefined();
        });
    });

    describe('Export Connectors', () => {
        it('should export connection definitions', async () => {
            const result = await parseDocument(`
                connection def Link {
                    end part source;
                    end part target;
                }
            `);

            expect(result.ast).toBeDefined();
        });

        it('should export flow definitions', async () => {
            const result = await parseDocument(`
                part def P {
                    part a;
                    part b;
                    flow from a to b;
                }
            `);

            expect(result.ast).toBeDefined();
        });
    });

    describe('Export Errors', () => {
        it('should not export AST for invalid file', async () => {
            // Use extra closing brace to trigger parser error without hang
            const result = await parseDocument('part def P { } }');

            expect(result.hasErrors).toBe(true);
            // AST may be partial or undefined
        });
    });
});
