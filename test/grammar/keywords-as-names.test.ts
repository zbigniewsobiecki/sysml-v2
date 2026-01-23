/**
 * Keywords as identifier names tests
 * Tests that reserved keywords can be used as identifier names without parser hangs
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess } from '../helpers/test-utils.js';

describe('Keywords as identifier names', () => {
    // These keywords were previously causing parser hangs when used as identifiers
    const problematicKeywords = [
        'package', 'import', 'class', 'in', 'out', 'inout',
        'private', 'protected', 'public', 'def', 'from', 'to',
        'alias', 'all', 'as', 'by', 'for', 'of', 'then', 'until', 'via'
    ];

    problematicKeywords.forEach(keyword => {
        it(`should allow "${keyword}" as attribute name`, async () => {
            const content = `package Test { attribute ${keyword} : String; }`;
            await parseAndExpectSuccess(content);
        });
    });

    it('should parse the original failing case with attribute named "package"', async () => {
        const content = `package DomainEntities {
            import SysMLPrimitives::*;
            item def SharedTypeRegistry {
                attribute package : String = "@car-dealership/shared-types";
            }
        }`;
        await parseAndExpectSuccess(content);
    });

    it('should allow "import" as a part name', async () => {
        await parseAndExpectSuccess('part def Container { part import : Data; }');
    });

    it('should allow "class" as an attribute name', async () => {
        await parseAndExpectSuccess('part def Element { attribute class : String; }');
    });

    it('should allow "in" and "out" as attribute names', async () => {
        await parseAndExpectSuccess(`
            part def DataTransfer {
                attribute in : Integer;
                attribute out : Integer;
            }
        `);
    });

    it('should allow "from" and "to" as attribute names', async () => {
        await parseAndExpectSuccess(`
            part def Range {
                attribute from : Integer;
                attribute to : Integer;
            }
        `);
    });

    it('should allow visibility keywords as attribute names', async () => {
        await parseAndExpectSuccess(`
            part def AccessLevels {
                attribute public : Boolean;
                attribute private : Boolean;
                attribute protected : Boolean;
            }
        `);
    });

    it('should allow "def" as a feature name', async () => {
        await parseAndExpectSuccess('item def Definition { attribute def : String; }');
    });

    it('should allow "alias" as an attribute name', async () => {
        await parseAndExpectSuccess('part def Named { attribute alias : String; }');
    });

    it('should allow "all" as an attribute name', async () => {
        await parseAndExpectSuccess('part def Query { attribute all : Boolean; }');
    });
});
