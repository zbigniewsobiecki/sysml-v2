/**
 * Expression test fixture
 * Demonstrates various expression types and operators
 */
package Expressions {
    part def Calculator {
        // Literals
        attribute intLit = 42;
        attribute realLit = 3.14159;
        attribute strLit = "hello world";
        attribute boolLit = true;
        attribute nullLit = null;

        // Arithmetic
        attribute sum = 1 + 2;
        attribute diff = 10 - 3;
        attribute prod = 4 * 5;
        attribute quot = 20 / 4;
        attribute mod = 17 % 5;
        attribute power = 2 ** 8;

        // Comparison
        attribute eq = 1 == 1;
        attribute neq = 1 != 2;
        attribute lt = 1 < 2;
        attribute lte = 1 <= 1;
        attribute gt = 2 > 1;
        attribute gte = 2 >= 2;

        // Logical
        attribute andOp = true and false;
        attribute orOp = true or false;
        attribute notOp = not true;
        attribute xorOp = true xor false;
        attribute impliesOp = true implies false;

        // Conditional
        attribute cond = true ? 1 : 0;

        // Null coalescing
        attribute coalesce = null ?? "default";

        // Complex expressions
        attribute complex = (1 + 2) * (3 - 4) / 5;
        attribute precedence = 1 + 2 * 3;
    }
}
