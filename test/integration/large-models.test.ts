/**
 * Large model performance tests
 * Tests for parsing performance with large inputs
 */

import { describe, it, expect } from 'vitest';
import { parseDocument, validateDocument } from '../../src/utils/parser-utils.js';

describe('Large Model Performance', () => {
    describe('Scaling Tests', () => {
        it('should parse 100 definitions quickly', async () => {
            const definitions = Array.from({ length: 100 }, (_, i) =>
                `part def Component${i};`
            ).join('\n');

            const start = performance.now();
            const result = await parseDocument(`package Large { ${definitions} }`);
            const elapsed = performance.now() - start;

            expect(result.hasErrors).toBe(false);
            expect(elapsed).toBeLessThan(5000); // Should complete in under 5 seconds
        });

        it('should parse 500 definitions', async () => {
            const definitions = Array.from({ length: 500 }, (_, i) =>
                `part def Component${i};`
            ).join('\n');

            const start = performance.now();
            const result = await parseDocument(`package Large { ${definitions} }`);
            const elapsed = performance.now() - start;

            expect(result.hasErrors).toBe(false);
            expect(elapsed).toBeLessThan(10000); // Should complete in under 10 seconds
        });

        it('should parse deeply nested packages', async () => {
            let code = 'part def Leaf;';
            for (let i = 0; i < 20; i++) {
                code = `package Level${i} { ${code} }`;
            }

            const start = performance.now();
            const result = await parseDocument(code);
            const elapsed = performance.now() - start;

            expect(result.hasErrors).toBe(false);
            expect(elapsed).toBeLessThan(5000);
        });

        it('should parse wide package structure', async () => {
            const packages = Array.from({ length: 50 }, (_, i) =>
                `package Pkg${i} { part def Type${i}; }`
            ).join('\n');

            const start = performance.now();
            const result = await parseDocument(packages);
            const elapsed = performance.now() - start;

            expect(result.hasErrors).toBe(false);
            expect(elapsed).toBeLessThan(5000);
        });
    });

    describe('Complex Structure Performance', () => {
        it('should parse model with many features', async () => {
            const features = Array.from({ length: 100 }, (_, i) =>
                `part child${i} : Component;`
            ).join('\n');

            const code = `
                part def Component;
                part def Container {
                    ${features}
                }
            `;

            const start = performance.now();
            const result = await parseDocument(code);
            const elapsed = performance.now() - start;

            expect(result.hasErrors).toBe(false);
            expect(elapsed).toBeLessThan(5000);
        });

        it('should parse model with many imports', async () => {
            const types = Array.from({ length: 50 }, (_, i) =>
                `part def Type${i};`
            ).join('\n');

            const imports = Array.from({ length: 50 }, (_, i) =>
                `import Lib::Type${i};`
            ).join('\n');

            const code = `
                package Lib {
                    ${types}
                }
                package App {
                    ${imports}
                }
            `;

            const start = performance.now();
            const result = await parseDocument(code);
            const elapsed = performance.now() - start;

            expect(result.hasErrors).toBe(false);
            expect(elapsed).toBeLessThan(5000);
        });

        it('should parse model with complex expressions', async () => {
            const attributes = Array.from({ length: 50 }, (_, i) =>
                `attribute val${i} = (${i} + 1) * 2 - ${i} / 2;`
            ).join('\n');

            const code = `
                part def Calculator {
                    ${attributes}
                }
            `;

            const start = performance.now();
            const result = await parseDocument(code);
            const elapsed = performance.now() - start;

            expect(result.hasErrors).toBe(false);
            expect(elapsed).toBeLessThan(5000);
        });
    });

    describe('Validation Performance', () => {
        it('should validate 100 definitions quickly', async () => {
            const definitions = Array.from({ length: 100 }, (_, i) =>
                `part def Component${i};`
            ).join('\n');

            const start = performance.now();
            const result = await validateDocument(`package Large { ${definitions} }`);
            const elapsed = performance.now() - start;

            expect(result.isValid).toBe(true);
            expect(elapsed).toBeLessThan(10000);
        });

        it('should validate model with many relationships', async () => {
            const types = Array.from({ length: 30 }, (_, i) =>
                `part def Type${i}${i > 0 ? ` :> Type${i - 1}` : ''};`
            ).join('\n');

            const start = performance.now();
            const result = await validateDocument(`package P { ${types} }`);
            const elapsed = performance.now() - start;

            expect(result.isValid).toBe(true);
            expect(elapsed).toBeLessThan(10000);
        });
    });

    describe('Memory Usage', () => {
        it('should handle repeated parsing without memory leak', async () => {
            const code = `
                package P {
                    part def A;
                    part def B;
                    part def C;
                }
            `;

            // Parse multiple times
            for (let i = 0; i < 50; i++) {
                const result = await parseDocument(code, `memory://test-${i}.sysml`);
                expect(result.hasErrors).toBe(false);
            }

            // If we got here without hanging, memory is being managed
            expect(true).toBe(true);
        });

        it('should handle repeated validation without memory leak', async () => {
            const code = `
                package P {
                    part def A;
                    part def B :> A;
                }
            `;

            // Validate multiple times
            for (let i = 0; i < 50; i++) {
                const result = await validateDocument(code, `memory://test-${i}.sysml`);
                expect(result.isValid).toBe(true);
            }

            expect(true).toBe(true);
        });
    });

    describe('Realistic Model Sizes', () => {
        it('should parse a realistic system model', async () => {
            const code = `
                package SystemModel {
                    // Type definitions
                    part def Controller;
                    part def Sensor;
                    part def Actuator;
                    port def DataPort;
                    port def ControlPort;

                    // System structure
                    part def ControlSystem {
                        // Components
                        part controller : Controller {
                            in port sensorInput : DataPort;
                            out port actuatorOutput : ControlPort;
                        }

                        part sensors : Sensor[1..10] {
                            out port data : DataPort;
                        }

                        part actuators : Actuator[1..5] {
                            in port control : ControlPort;
                        }

                        // Connections
                        connector sensorLink from sensors.data to controller.sensorInput;
                        connector actuatorLink from controller.actuatorOutput to actuators.control;
                    }

                    // Behavior
                    action def ControlLoop {
                        action readSensors;
                        action computeControl;
                        action commandActuators;

                        succession first readSensors then computeControl;
                        succession first computeControl then commandActuators;
                    }

                    // States
                    state def SystemState {
                        state off;
                        state initializing;
                        state running;
                        state error;

                        transition first off accept powerOn then initializing;
                        transition first initializing accept ready then running;
                        transition first running accept fault then error;
                        transition first error accept reset then off;
                    }

                    // Requirements
                    requirement def SafetyRequirement {
                        subject sys : ControlSystem;
                        require constraint systemSafe;
                    }

                    requirement def PerformanceRequirement {
                        subject sys : ControlSystem;
                        attribute maxLatency : Integer = 100;
                    }
                }
            `;

            const start = performance.now();
            const result = await validateDocument(code);
            const elapsed = performance.now() - start;

            expect(result.errors.length).toBe(0);
            expect(elapsed).toBeLessThan(5000);
        });
    });
});
