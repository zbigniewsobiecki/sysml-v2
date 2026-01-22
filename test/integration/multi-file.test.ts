/**
 * Multi-file integration tests
 * Tests for cross-file references and imports
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseDocument, validateDocument } from '../../src/utils/parser-utils.js';
import { useTempDir } from '../helpers/temp-dir-helper.js';

const temp = useTempDir(__dirname, '../fixtures/.temp-multifile');

describe('Multi-File Integration', () => {
    beforeEach(temp.setup);
    afterEach(temp.teardown);

    describe('Cross-Package References', () => {
        it('should parse file with import from another package', async () => {
            // Simulating multi-file by having imports in single document
            const result = await parseDocument(`
                package Library {
                    part def Widget;
                    part def Button;
                }

                package Application {
                    import Library::Widget;
                    import Library::Button;

                    part def MainWindow {
                        part toolbar : Widget;
                        part okButton : Button;
                    }
                }
            `);

            expect(result.hasErrors).toBe(false);
        });

        it('should parse file with wildcard import', async () => {
            const result = await parseDocument(`
                package BaseComponents {
                    part def Container;
                    part def Panel;
                    part def Grid;
                }

                package App {
                    import BaseComponents::*;

                    part def Dashboard {
                        part mainPanel : Panel;
                        part layout : Grid;
                    }
                }
            `);

            expect(result.hasErrors).toBe(false);
        });

        it('should parse file with recursive import', async () => {
            const result = await parseDocument(`
                package Root {
                    package Sub1 {
                        part def A;
                    }
                    package Sub2 {
                        part def B;
                    }
                }

                package Consumer {
                    import Root::**;
                }
            `);

            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Import Chains', () => {
        it('should handle chained package references', async () => {
            const result = await parseDocument(`
                package Level1 {
                    part def Base;
                }

                package Level2 {
                    import Level1::Base;
                    part def Middle :> Base;
                }

                package Level3 {
                    import Level2::Middle;
                    part def Top :> Middle;
                }
            `);

            expect(result.hasErrors).toBe(false);
        });

        it('should handle deep nesting with imports', async () => {
            const result = await parseDocument(`
                package A {
                    package B {
                        package C {
                            part def DeepType;
                        }
                    }
                }

                package Consumer {
                    import A::B::C::DeepType;
                    part def User :> DeepType;
                }
            `);

            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Library Package Usage', () => {
        it('should parse library package with consumers', async () => {
            const result = await parseDocument(`
                library package StandardLibrary {
                    part def Integer;
                    part def String;
                    part def Boolean;
                }

                package App {
                    import StandardLibrary::*;

                    part def Data {
                        attribute count : Integer;
                        attribute name : String;
                        attribute active : Boolean;
                    }
                }
            `);

            expect(result.hasErrors).toBe(false);
        });

        it('should parse standard library package', async () => {
            const result = await parseDocument(`
                standard library package ISQ {
                    attribute def Length;
                    attribute def Mass;
                    attribute def Time;
                }
            `);

            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Alias Usage', () => {
        it('should parse file with aliases', async () => {
            const result = await parseDocument(`
                package VeryLongPackageName {
                    package AnotherLongName {
                        part def SomeType;
                    }
                }

                package User {
                    alias Short for VeryLongPackageName::AnotherLongName::SomeType;
                    part def Consumer :> Short;
                }
            `);

            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Complex Multi-Package Scenarios', () => {
        it('should parse system with multiple subsystems', async () => {
            const result = await parseDocument(`
                package Interfaces {
                    port def DataPort;
                    port def ControlPort;
                }

                package Components {
                    import Interfaces::*;

                    part def Sensor {
                        out port data : DataPort;
                    }

                    part def Controller {
                        in port sensorData : DataPort;
                        out port commands : ControlPort;
                    }

                    part def Actuator {
                        in port control : ControlPort;
                    }
                }

                package System {
                    import Components::*;

                    part def ControlSystem {
                        part sensor : Sensor;
                        part controller : Controller;
                        part actuator : Actuator;
                    }
                }
            `);

            expect(result.hasErrors).toBe(false);
        });

        it('should parse requirements with linked parts', async () => {
            const result = await parseDocument(`
                package Requirements {
                    requirement def Safety;
                    requirement def Performance;
                }

                package Design {
                    import Requirements::*;

                    part def System {
                        requirement safety : Safety;
                        requirement perf : Performance;
                    }
                }
            `);

            expect(result.hasErrors).toBe(false);
        });
    });

    describe('Validation Across Packages', () => {
        it('should validate duplicate names in separate packages (allowed)', async () => {
            const result = await validateDocument(`
                package A {
                    part def Type;
                }
                package B {
                    part def Type;
                }
            `);

            // Same name in different packages should be allowed
            expect(result.errors.filter(e => e.message.includes('Duplicate')).length).toBe(0);
        });

        it('should validate duplicate names in same package (error)', async () => {
            const result = await validateDocument(`
                package P {
                    part def Type;
                    part def Type;
                }
            `);

            expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
        });
    });
});
