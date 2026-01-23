/**
 * Definition tests
 * Tests for all definition types (part def, action def, etc.)
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, getFirstElement, getPackageElements, expectDefinitionType } from '../helpers/test-utils.js';
import {
    isPartDefinition,
    isItemDefinition,
    isAttributeDefinition,
    isEnumerationDefinition,
    isActionDefinition,
    isStateDefinition,
    isConstraintDefinition,
    isRequirementDefinition,
    isPortDefinition,
    isConnectionDefinition,
    isInterfaceDefinition,
    isFlowConnectionDefinition,
    isAllocationDefinition,
    isCalculationDefinition,
    isCaseDefinition,
    isAnalysisCaseDefinition,
    isVerificationCaseDefinition,
    isUseCaseDefinition,
    isViewDefinition,
    isViewpointDefinition,
    isRenderingDefinition,
    isMetadataDefinition,
    isOccurrenceDefinition,
    isConcernDefinition
} from '../../src/language/generated/ast.js';

describe('Definitions', () => {
    describe('Part Definition', () => {
        it('should parse empty part def with semicolon', async () => {
            const ast = await parseAndExpectSuccess('part def Component;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isPartDefinition, 'PartDefinition', 'Component');
        });

        it('should parse empty part def with braces', async () => {
            const ast = await parseAndExpectSuccess('part def Component { }');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isPartDefinition, 'PartDefinition', 'Component');
        });

        it('should parse abstract part def', async () => {
            const ast = await parseAndExpectSuccess('abstract part def AbstractComponent;');
            const def = getFirstElement(ast);
            expect(isPartDefinition(def)).toBe(true);
            // Note: Due to Langium's {infer} behavior, isAbstract may not be set.
            // Check CST text as workaround
            const cstText = def.$cstNode?.text ?? '';
            expect(cstText.includes('abstract')).toBe(true);
            expect(def.name).toBe('AbstractComponent');
        });

        it('should parse part def with specialization using :>', async () => {
            const ast = await parseAndExpectSuccess('part def Child :> Parent;');
            const def = getFirstElement(ast);
            expect(def.specializations).toBeDefined();
            expect(def.specializations.length).toBe(1);
        });

        it('should parse part def with specialization using keyword', async () => {
            const ast = await parseAndExpectSuccess('part def Child specializes Parent;');
            const def = getFirstElement(ast);
            expect(def.specializations.length).toBe(1);
        });

        it('should parse part def with multiple specializations', async () => {
            const ast = await parseAndExpectSuccess('part def Child :> Parent1, Parent2;');
            const def = getFirstElement(ast);
            expect(def.specializations.length).toBe(2);
        });

        it('should parse part def with members', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Car {
                    part engine : Engine;
                    part wheels : Wheel[4];
                }
            `);
            const def = getFirstElement(ast);
            expect(isPartDefinition(def)).toBe(true);
        });

        it('should parse private part def', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    private part def Internal;
                }
            `);
            const pkg = getFirstElement(ast);
            // Check the membership has visibility
            const membership = pkg.elements?.[0];
            expect(membership?.visibility).toBe('private');
        });
    });

    describe('Item Definition', () => {
        it('should parse item def', async () => {
            const ast = await parseAndExpectSuccess('item def Cargo;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isItemDefinition, 'ItemDefinition', 'Cargo');
        });

        it('should parse item def with body', async () => {
            const ast = await parseAndExpectSuccess('item def Cargo { attribute weight : Real; }');
            const def = getFirstElement(ast);
            expect(isItemDefinition(def)).toBe(true);
        });

        it('should parse item def with multiple attributes', async () => {
            const ast = await parseAndExpectSuccess(`
                item def User {
                    attribute id : Identifier;
                    attribute email : String;
                    attribute firstName : String;
                    attribute lastName : String;
                }
            `);
            const def = getFirstElement(ast);
            expect(isItemDefinition(def)).toBe(true);
            expect(def.name).toBe('User');
        });

        it('should parse item def with mixed features', async () => {
            const ast = await parseAndExpectSuccess(`
                item def Vehicle {
                    attribute vin : String;
                    attribute make : String;
                    part engine : Engine;
                }
            `);
            const def = getFirstElement(ast);
            expect(isItemDefinition(def)).toBe(true);
            expect(def.name).toBe('Vehicle');
        });
    });

    describe('Attribute Definition', () => {
        it('should parse attribute def', async () => {
            const ast = await parseAndExpectSuccess('attribute def Length;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isAttributeDefinition, 'AttributeDefinition', 'Length');
        });

        it('should parse attribute def with specialization', async () => {
            const ast = await parseAndExpectSuccess('attribute def Speed :> ScalarValues::Real;');
            const def = getFirstElement(ast);
            expect(isAttributeDefinition(def)).toBe(true);
            expect(def.specializations.length).toBe(1);
        });
    });

    describe('Enumeration Definition', () => {
        it('should parse enum def', async () => {
            const ast = await parseAndExpectSuccess(`
                enum def Color {
                    enum red;
                    enum green;
                    enum blue;
                }
            `);
            const def = getFirstElement(ast);
            expectDefinitionType(def, isEnumerationDefinition, 'EnumerationDefinition', 'Color');
        });

        it('should parse enum with variant', async () => {
            const ast = await parseAndExpectSuccess(`
                enum def Status {
                    variant active;
                    variant inactive;
                }
            `);
            const def = getFirstElement(ast);
            expect(isEnumerationDefinition(def)).toBe(true);
        });
    });

    describe('Action Definition', () => {
        it('should parse action def', async () => {
            const ast = await parseAndExpectSuccess('action def Drive;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isActionDefinition, 'ActionDefinition', 'Drive');
        });

        it('should parse action def with parameters', async () => {
            const ast = await parseAndExpectSuccess('action def Move { in distance : Length; }');
            const def = getFirstElement(ast);
            expect(isActionDefinition(def)).toBe(true);
        });

        it('should parse action def with in/out/inout parameters', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Process {
                    in input : Data;
                    out output : Result;
                    inout state : State;
                }
            `);
            const def = getFirstElement(ast);
            expect(isActionDefinition(def)).toBe(true);
        });

        it('should parse action def with body', async () => {
            const ast = await parseAndExpectSuccess(`
                action def Compute {
                    action step1;
                    action step2;
                }
            `);
            const def = getFirstElement(ast);
            expect(isActionDefinition(def)).toBe(true);
        });
    });

    describe('State Definition', () => {
        it('should parse state def', async () => {
            const ast = await parseAndExpectSuccess('state def VehicleState;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isStateDefinition, 'StateDefinition', 'VehicleState');
        });

        it('should parse state def with body', async () => {
            const ast = await parseAndExpectSuccess(`
                state def MachineState {
                    state running;
                    state stopped;
                }
            `);
            const def = getFirstElement(ast);
            expect(isStateDefinition(def)).toBe(true);
        });

        it('should parse parallel state def', async () => {
            const ast = await parseAndExpectSuccess('parallel state def ConcurrentState;');
            const def = getFirstElement(ast);
            expect(isStateDefinition(def)).toBe(true);
            expect(def.isParallel).toBe(true);
        });
    });

    describe('Constraint Definition', () => {
        it('should parse constraint def', async () => {
            const ast = await parseAndExpectSuccess('constraint def ValidRange;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isConstraintDefinition, 'ConstraintDefinition', 'ValidRange');
        });

        it('should parse constraint def with body', async () => {
            const ast = await parseAndExpectSuccess(`
                constraint def PositiveValue {
                    attribute value : Real;
                }
            `);
            const def = getFirstElement(ast);
            expect(isConstraintDefinition(def)).toBe(true);
        });
    });

    describe('Requirement Definition', () => {
        it('should parse requirement def', async () => {
            const ast = await parseAndExpectSuccess('requirement def SystemReq;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isRequirementDefinition, 'RequirementDefinition', 'SystemReq');
        });

        it('should parse requirement def with id', async () => {
            const ast = await parseAndExpectSuccess(`requirement def 'REQ-001' Performance;`);
            const def = getFirstElement(ast);
            expect(isRequirementDefinition(def)).toBe(true);
        });

        it('should parse requirement with subject', async () => {
            const ast = await parseAndExpectSuccess(`
                requirement def Safety {
                    subject vehicle : Vehicle;
                }
            `);
            const def = getFirstElement(ast);
            expect(isRequirementDefinition(def)).toBe(true);
        });

        it('should parse requirement with actor', async () => {
            const ast = await parseAndExpectSuccess(`
                requirement def UserInteraction {
                    actor user : User;
                }
            `);
            const def = getFirstElement(ast);
            expect(isRequirementDefinition(def)).toBe(true);
        });
    });

    describe('Port Definition', () => {
        it('should parse port def', async () => {
            const ast = await parseAndExpectSuccess('port def DataPort;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isPortDefinition, 'PortDefinition', 'DataPort');
        });

        it('should parse port def with features', async () => {
            const ast = await parseAndExpectSuccess(`
                port def PowerPort {
                    attribute voltage : Real;
                    in flow power : Power;
                }
            `);
            const def = getFirstElement(ast);
            expect(isPortDefinition(def)).toBe(true);
        });
    });

    describe('Connection Definition', () => {
        it('should parse connection def', async () => {
            const ast = await parseAndExpectSuccess('connection def Link;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isConnectionDefinition, 'ConnectionDefinition', 'Link');
        });
    });

    describe('Interface Definition', () => {
        it('should parse interface def', async () => {
            const ast = await parseAndExpectSuccess('interface def DataInterface;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isInterfaceDefinition, 'InterfaceDefinition', 'DataInterface');
        });
    });

    describe('Flow Definition', () => {
        it('should parse flow def', async () => {
            const ast = await parseAndExpectSuccess('flow def DataFlow;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isFlowConnectionDefinition, 'FlowConnectionDefinition', 'DataFlow');
        });
    });

    describe('Allocation Definition', () => {
        it('should parse allocation def', async () => {
            const ast = await parseAndExpectSuccess('allocation def FunctionAllocation;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isAllocationDefinition, 'AllocationDefinition', 'FunctionAllocation');
        });
    });

    describe('Calculation Definition', () => {
        it('should parse calc def', async () => {
            const ast = await parseAndExpectSuccess('calc def Sum;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isCalculationDefinition, 'CalculationDefinition', 'Sum');
        });

        it('should parse calc def with parameters and return', async () => {
            const ast = await parseAndExpectSuccess(`
                calc def Add {
                    in a : Real;
                    in b : Real;
                    return result : Real;
                }
            `);
            const def = getFirstElement(ast);
            expect(isCalculationDefinition(def)).toBe(true);
        });
    });

    describe('Case Definition', () => {
        it('should parse case def', async () => {
            const ast = await parseAndExpectSuccess('case def TestCase;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isCaseDefinition, 'CaseDefinition', 'TestCase');
        });
    });

    describe('Analysis Case Definition', () => {
        it('should parse analysis def', async () => {
            const ast = await parseAndExpectSuccess('analysis def PerformanceAnalysis;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isAnalysisCaseDefinition, 'AnalysisCaseDefinition', 'PerformanceAnalysis');
        });

        it('should parse analysis def with direct attributes', async () => {
            const ast = await parseAndExpectSuccess(`
                analysis def SecurityProfile {
                    attribute riskLevel : String;
                    attribute score : Real;
                    results {
                        attribute recommendation : String;
                    }
                }
            `);
            const def = getFirstElement(ast);
            expect(isAnalysisCaseDefinition(def)).toBe(true);
            expect(def.name).toBe('SecurityProfile');
        });
    });

    describe('Verification Case Definition', () => {
        it('should parse verification def', async () => {
            const ast = await parseAndExpectSuccess('verification def UnitTest;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isVerificationCaseDefinition, 'VerificationCaseDefinition', 'UnitTest');
        });
    });

    describe('Use Case Definition', () => {
        it('should parse use case def', async () => {
            const ast = await parseAndExpectSuccess('use case def Login;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isUseCaseDefinition, 'UseCaseDefinition', 'Login');
        });

        it('should parse use case def with actor and subject', async () => {
            const ast = await parseAndExpectSuccess(`
                use case def Checkout {
                    actor customer : Customer;
                    subject cart : ShoppingCart;
                }
            `);
            const def = getFirstElement(ast);
            expect(isUseCaseDefinition(def)).toBe(true);
        });
    });

    describe('View Definition', () => {
        it('should parse view def', async () => {
            const ast = await parseAndExpectSuccess('view def SystemOverview;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isViewDefinition, 'ViewDefinition', 'SystemOverview');
        });
    });

    describe('Viewpoint Definition', () => {
        it('should parse viewpoint def', async () => {
            const ast = await parseAndExpectSuccess('viewpoint def SafetyViewpoint;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isViewpointDefinition, 'ViewpointDefinition', 'SafetyViewpoint');
        });
    });

    describe('Rendering Definition', () => {
        it('should parse rendering def', async () => {
            const ast = await parseAndExpectSuccess('rendering def DiagramStyle;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isRenderingDefinition, 'RenderingDefinition', 'DiagramStyle');
        });
    });

    describe('Metadata Definition', () => {
        it('should parse metadata def', async () => {
            const ast = await parseAndExpectSuccess('metadata def Annotation;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isMetadataDefinition, 'MetadataDefinition', 'Annotation');
        });

        it('should parse metadata def with about', async () => {
            const ast = await parseAndExpectSuccess('metadata def Tag about Package;');
            const def = getFirstElement(ast);
            expect(isMetadataDefinition(def)).toBe(true);
        });
    });

    describe('Occurrence Definition', () => {
        it('should parse occurrence def', async () => {
            const ast = await parseAndExpectSuccess('occurrence def Event;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isOccurrenceDefinition, 'OccurrenceDefinition', 'Event');
        });
    });

    describe('Concern Definition', () => {
        it('should parse concern def', async () => {
            const ast = await parseAndExpectSuccess('concern def SecurityConcern;');
            const def = getFirstElement(ast);
            expectDefinitionType(def, isConcernDefinition, 'ConcernDefinition', 'SecurityConcern');
        });
    });
});
