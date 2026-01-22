/**
 * Connector tests
 * Tests for connectors, bindings, successions, and flows
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, getFirstElement, getPackageElements } from '../helpers/test-utils.js';

describe('Connectors', () => {
    describe('Basic Connector', () => {
        it('should parse simple connector', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    part a;
                    part b;
                    connector c from a to b;
                }
            `);
        });

        it('should parse connector with type', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    part a;
                    part b;
                    connector c : ConnectionType from a to b;
                }
            `);
        });

        it('should parse anonymous connector', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    part a;
                    part b;
                    connector from a to b;
                }
            `);
        });

        it('should parse connector with ends', async () => {
            const ast = await parseAndExpectSuccess(`
                connection def Conn {
                    end part source;
                    end part target;
                }
            `);
        });
    });

    describe('Binding Connector', () => {
        it('should parse binding of', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    attribute a : Integer;
                    attribute b : Integer;
                    binding of a = b;
                }
            `);
        });

        it('should parse named binding', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    attribute a : Integer;
                    attribute b : Integer;
                    binding bind of a = b;
                }
            `);
        });
    });

    describe('Succession', () => {
        it('should parse simple succession', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    action step1;
                    action step2;
                    succession first step1 then step2;
                }
            `);
        });

        it('should parse named succession', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    action step1;
                    action step2;
                    succession seq first step1 then step2;
                }
            `);
        });

        it('should parse succession with multiple then', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    action a;
                    action b;
                    action c;
                    succession first a then b then c;
                }
            `);
        });
    });

    describe('Flow Connection', () => {
        it('should parse simple flow', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    part source;
                    part target;
                    flow of Item from source to target;
                }
            `);
        });

        it('should parse named flow', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    part source;
                    part target;
                    flow dataFlow of Data from source to target;
                }
            `);
        });

        it('should parse flow with port references', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    part comp1 { out port outPort; }
                    part comp2 { in port inPort; }
                    flow from comp1.outPort to comp2.inPort;
                }
            `);
        });
    });

    describe('Item Flow', () => {
        it('should parse item flow with type', async () => {
            const ast = await parseAndExpectSuccess(`
                part def System {
                    part producer;
                    part consumer;
                    flow of DataPacket from producer to consumer;
                }
            `);
        });
    });

    describe('Interface Connection', () => {
        it('should parse interface connection', async () => {
            const ast = await parseAndExpectSuccess(`
                part def System {
                    part client;
                    part server;
                    interface api connect client to server;
                }
            `);
        });

        it('should parse interface with type', async () => {
            const ast = await parseAndExpectSuccess(`
                part def System {
                    part a;
                    part b;
                    interface : ServiceInterface connect a to b;
                }
            `);
        });
    });

    describe('Allocation Connection', () => {
        it('should parse allocate', async () => {
            const ast = await parseAndExpectSuccess(`
                part def System {
                    part logical;
                    part physical;
                    allocate logical to physical;
                }
            `);
        });
    });

    describe('Connection End Multiplicity', () => {
        it('should parse connector end with multiplicity', async () => {
            const ast = await parseAndExpectSuccess(`
                connection def Link {
                    end part source[1];
                    end part target[0..*];
                }
            `);
        });
    });

    describe('Connection Definition', () => {
        it('should parse connection def', async () => {
            const ast = await parseAndExpectSuccess(`
                connection def DataLink {
                    end part sender;
                    end part receiver;
                }
            `);
            const def = getFirstElement(ast);
            expect(def.$type).toBe('ConnectionDefinition');
        });

        it('should parse connection def with specialization', async () => {
            const ast = await parseAndExpectSuccess(`
                connection def SecureLink :> DataLink;
            `);
        });
    });

    describe('Flow Connection Definition', () => {
        it('should parse flow def', async () => {
            const ast = await parseAndExpectSuccess(`
                flow def MessageFlow {
                    end part source;
                    end part target;
                }
            `);
            const def = getFirstElement(ast);
            expect(def.$type).toBe('FlowConnectionDefinition');
        });
    });

    describe('Interface Definition', () => {
        it('should parse interface def', async () => {
            const ast = await parseAndExpectSuccess(`
                interface def CommunicationInterface {
                    in port request;
                    out port response;
                }
            `);
            const def = getFirstElement(ast);
            expect(def.$type).toBe('InterfaceDefinition');
        });
    });
});
