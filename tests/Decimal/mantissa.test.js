import { Decimal } from "../../src/Decimal.mjs";

describe("mantissa", () => {
    test("0", () => {
        expect(() => new Decimal("0").mantissa()).toThrow(RangeError);
    });
    test("0.0", () => {
        expect(() => new Decimal("0.0").mantissa()).toThrow(RangeError);
    });
    test("-0", () => {
        expect(() => new Decimal("-0").mantissa()).toThrow(RangeError);
    });
    let data = [
        ["123.456", "1.23456", 2],
        ["5", "5", 0],
        ["1.20", "1.2", 0],
        ["-123.456", "-1.23456", 2],
        ["0.0042", "4.2", -3],
        ["0.00000000000000000000000000000000000001", "1", -38],
        ["1000", "1", 3],
        ["-1000", "-1", 3],
        ["-0.00001", "-1", -5],
        ["0.5", "5", -1],
        ["-10", "-1", 1],
        ["10", "1", 1],
        ["0.000001", "1", -6],
        ["0.0000012", "1.2", -6],
    ];
    for (const [n, sigDigits, exponent] of data) {
        test(`simple example (${n})`, () => {
            let d = new Decimal(n);
            expect(d.mantissa().toString()).toStrictEqual(sigDigits);
        });
    }
});
