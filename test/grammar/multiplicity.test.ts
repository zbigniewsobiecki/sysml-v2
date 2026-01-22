/**
 * Multiplicity tests
 * Tests for multiplicity bounds
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess } from '../helpers/test-utils.js';

describe('Multiplicity', () => {
    describe('Single Value', () => {
        it('should parse [1]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [1]; }');
        });

        it('should parse [0]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [0]; }');
        });

        it('should parse [5]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [5]; }');
        });

        it('should parse [*]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [*]; }');
        });
    });

    describe('Range Multiplicity', () => {
        it('should parse [0..1]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [0..1]; }');
        });

        it('should parse [1..*]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [1..*]; }');
        });

        it('should parse [0..*]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [0..*]; }');
        });

        it('should parse [1..5]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [1..5]; }');
        });

        it('should parse [2..10]', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [2..10]; }');
        });
    });

    describe('Multiplicity with Type', () => {
        it('should parse part with type and multiplicity', async () => {
            const ast = await parseAndExpectSuccess('part def P { part wheels : Wheel [4]; }');
        });

        it('should parse attribute with type and multiplicity', async () => {
            const ast = await parseAndExpectSuccess('part def P { attribute items : Item [0..*]; }');
        });

        it('should parse port with type and multiplicity', async () => {
            const ast = await parseAndExpectSuccess('part def P { port connections : Port [1..10]; }');
        });
    });

    describe('Multiplicity in Definitions', () => {
        it('should parse definition with multiplicity', async () => {
            const ast = await parseAndExpectSuccess('part def Component [1..*];');
        });

        it('should parse action def with multiplicity', async () => {
            const ast = await parseAndExpectSuccess('action def Processor [0..1];');
        });
    });

    describe('Multiplicity on Connection Ends', () => {
        it('should parse connection with end multiplicities', async () => {
            const ast = await parseAndExpectSuccess(`
                connection def Association {
                    end part source [1];
                    end part target [0..*];
                }
            `);
        });

        it('should parse flow with end multiplicities', async () => {
            const ast = await parseAndExpectSuccess(`
                flow def DataStream {
                    end part producer [1];
                    end part consumer [1..*];
                }
            `);
        });
    });

    describe('Hex and Binary Bounds', () => {
        it('should parse multiplicity with hex bound', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [0x10]; }');
        });

        it('should parse multiplicity with binary bound', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [0b1000]; }');
        });

        it('should parse range with hex bounds', async () => {
            const ast = await parseAndExpectSuccess('part def P { part x [0x01..0xFF]; }');
        });
    });

    describe('Complex Usages with Multiplicity', () => {
        it('should parse array of typed parts', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Car {
                    part wheels : Wheel [4];
                    part doors : Door [2..4];
                    part seats : Seat [1..*];
                }
            `);
        });

        it('should parse optional attribute', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Person {
                    attribute middleName : String [0..1];
                }
            `);
        });

        it('should parse required collection', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Container {
                    part contents : Item [1..*];
                }
            `);
        });
    });
});
