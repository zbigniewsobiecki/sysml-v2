/**
 * Metadata tests
 * Tests for metadata, annotations, comments, and documentation
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, getFirstElement, getAllElements, getPackageElements } from '../helpers/test-utils.js';

describe('Metadata', () => {
    describe('Metadata Definition', () => {
        it('should parse metadata def', async () => {
            const ast = await parseAndExpectSuccess('metadata def Status;');
            const def = getFirstElement(ast);
            // Note: Due to Langium grammar structure, $type may be 'TypeBodyRule'
            // when ';' terminator is used, or 'MetadataDefinition' with '{ }'
            expect(['MetadataDefinition', 'TypeBodyRule']).toContain(def.$type);
            expect(def.name).toBe('Status');
        });

        it('should parse metadata def with body', async () => {
            const ast = await parseAndExpectSuccess(`
                metadata def Annotation {
                    attribute author : String;
                    attribute date : String;
                }
            `);
        });

        it('should parse metadata def with specialization', async () => {
            const ast = await parseAndExpectSuccess('metadata def ExtendedMeta :> BaseMeta;');
        });
    });

    describe('Metadata Usage with #', () => {
        it('should parse prefixed metadata', async () => {
            const ast = await parseAndExpectSuccess(`
                #MetaType
                part def P;
            `);
        });

        it('should parse multiple prefixed metadata', async () => {
            const ast = await parseAndExpectSuccess(`
                #Type1
                #Type2
                part def P;
            `);
        });
    });

    describe('Metadata Usage with @', () => {
        it('should parse inline metadata', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    @Annotation;
                }
            `);
        });

        it('should parse named metadata', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    @status : Status;
                }
            `);
        });

        it('should parse metadata with values', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    @tag : Annotation {
                        attribute author = "John";
                    }
                }
            `);
        });
    });

    describe('Comment', () => {
        it('should parse comment about element', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P;
                comment about P /** This is a comment about P */
            `);
        });

        it('should parse standalone comment', async () => {
            const ast = await parseAndExpectSuccess(`
                comment /** General comment */
            `);
            const elem = getFirstElement(ast);
            expect(elem.$type).toBe('Comment');
        });

        it('should parse comment with locale', async () => {
            const ast = await parseAndExpectSuccess(`
                comment about P language "en" /** English comment */
            `);
        });
    });

    describe('Documentation', () => {
        it('should parse doc comment', async () => {
            const ast = await parseAndExpectSuccess(`
                doc /** This is documentation */
            `);
            const elem = getFirstElement(ast);
            expect(elem.$type).toBe('Documentation');
        });

        it('should parse doc about element', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Widget;
                doc about Widget /** Widget documentation */
            `);
        });

        it('should parse doc with locale', async () => {
            const ast = await parseAndExpectSuccess(`
                doc language "en" /** English docs */
            `);
        });
    });

    describe('Textual Representation', () => {
        it('should parse rep', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    rep language "JavaScript" /** console.log('hello'); */
                }
            `);
        });
    });

    describe('Metadata in Packages', () => {
        it('should parse metadata in package', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    @PackageAnnotation;
                    part def Component;
                }
            `);
        });

        it('should parse multiple metadata elements', async () => {
            const ast = await parseAndExpectSuccess(`
                package P {
                    @Created;
                    @Modified;
                    @Version { attribute v = "1.0"; }
                }
            `);
        });
    });

    describe('Metadata with Qualified Types', () => {
        it('should parse metadata with qualified type', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    @myMeta : Annotations::Important;
                }
            `);
        });
    });

    describe('Combined Comment and Doc', () => {
        it('should parse comment and doc together', async () => {
            const ast = await parseAndExpectSuccess(`
                part def Widget;

                doc about Widget /**
                    Official documentation for Widget.
                */

                comment about Widget /**
                    Implementation note: This needs review.
                */
            `);
        });
    });

    describe('Metadata on Various Elements', () => {
        it('should parse metadata on part usage', async () => {
            const ast = await parseAndExpectSuccess(`
                part def P {
                    @Important
                    part critical : Component;
                }
            `);
        });

        it('should parse metadata on action', async () => {
            const ast = await parseAndExpectSuccess(`
                action def A {
                    @Deprecated
                    action oldStep;
                }
            `);
        });

        it('should parse metadata on requirement', async () => {
            const ast = await parseAndExpectSuccess(`
                requirement def R {
                    @Priority { attribute level = 1; }
                }
            `);
        });
    });
});
