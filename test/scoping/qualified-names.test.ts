/**
 * Qualified name scoping tests
 * Tests for A::B::C resolution
 */

import { describe, it, expect } from 'vitest';
import { parseAndExpectSuccess, validateAndExpectSuccess } from '../helpers/test-utils.js';

describe('Qualified Name Scoping', () => {
    describe('Simple Resolution', () => {
        it('should resolve direct qualified name', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    part def X;
                }
                part def P :> A::X;
            `);
        });

        it('should resolve deeply nested qualified name', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    package B {
                        package C {
                            part def X;
                        }
                    }
                }
                part def P :> A::B::C::X;
            `);
        });
    });

    describe('Cross-Package References', () => {
        it('should resolve reference from sibling package', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib {
                    part def Widget;
                }
                package App {
                    part def MyWidget :> Lib::Widget;
                }
            `);
        });

        it('should resolve reference from nested package', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    part def X;
                    package B {
                        part def Y :> A::X;
                    }
                }
            `);
        });
    });

    describe('Multiple References', () => {
        it('should resolve multiple specializations', async () => {
            const result = await validateAndExpectSuccess(`
                package Types {
                    part def Base1;
                    part def Base2;
                }
                part def Combined :> Types::Base1, Types::Base2;
            `);
        });

        it('should resolve references in different contexts', async () => {
            const result = await validateAndExpectSuccess(`
                package Lib {
                    part def Component;
                    port def Port;
                }
                part def P {
                    part child : Lib::Component;
                    port p : Lib::Port;
                }
            `);
        });
    });

    describe('Relative vs Absolute References', () => {
        it('should resolve unqualified name in same scope', async () => {
            const result = await validateAndExpectSuccess(`
                package P {
                    part def Base;
                    part def Derived :> Base;
                }
            `);
        });

        it('should resolve qualified name from outer scope', async () => {
            const result = await validateAndExpectSuccess(`
                part def GlobalType;
                package P {
                    package Inner {
                        part def LocalType :> GlobalType;
                    }
                }
            `);
        });
    });

    describe('Qualified Names in Usages', () => {
        it('should resolve type in part usage', async () => {
            const result = await validateAndExpectSuccess(`
                package Components {
                    part def Engine;
                }
                part def Car {
                    part engine : Components::Engine;
                }
            `);
        });

        it('should resolve type in attribute usage', async () => {
            const result = await validateAndExpectSuccess(`
                package Types {
                    attribute def Measurement;
                }
                part def P {
                    attribute length : Types::Measurement;
                }
            `);
        });

        it('should resolve type in port usage', async () => {
            const result = await validateAndExpectSuccess(`
                package Interfaces {
                    port def DataPort;
                }
                part def P {
                    port data : Interfaces::DataPort;
                }
            `);
        });
    });

    describe('Qualified Names in Relationships', () => {
        it('should resolve qualified names in specialization', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    part def X;
                }
                package B {
                    part def Y;
                }
                specialization S subtype A::X :> B::Y;
            `);
        });

        it('should resolve qualified names in dependency', async () => {
            const result = await validateAndExpectSuccess(`
                package Client {
                    part def Module;
                }
                package Server {
                    part def Service;
                }
                dependency from Client::Module to Server::Service;
            `);
        });
    });

    describe('Shadowing', () => {
        it('should allow same name in different scopes', async () => {
            const result = await validateAndExpectSuccess(`
                package A {
                    part def Type;
                }
                package B {
                    part def Type;
                }
                part def P1 :> A::Type;
                part def P2 :> B::Type;
            `);
        });

        it('should prefer local name over outer scope', async () => {
            const result = await validateAndExpectSuccess(`
                part def Type;
                package P {
                    part def Type;
                    part def Local :> Type;
                }
            `);
        });
    });
});
