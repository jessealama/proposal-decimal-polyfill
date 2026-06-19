import { Decimal } from "../../src/Decimal.mjs";

describe("toBigInt", () => {
    describe("NaN", () => {
        test("does not work", () => {
            expect(() => new Decimal("NaN").toBigInt()).toThrow(RangeError);
            expect(() => new Decimal("NaN").toBigInt()).toThrow(
                "NaN cannot be converted to a BigInt"
            );
        });
    });

    describe("zero", () => {
        test("positive zero", () => {
            expect(new Decimal("0").toBigInt()).toStrictEqual(0n);
        });
        test("negative zero", () => {
            expect(new Decimal("-0").toBigInt()).toStrictEqual(0n);
        });
    });

    describe("infinity", () => {
        test("positive", () => {
            expect(() => new Decimal("Infinity").toBigInt()).toThrow(
                RangeError
            );
            expect(() => new Decimal("Infinity").toBigInt()).toThrow(
                "Infinity cannot be converted to a BigInt"
            );
        });
        test("negative", () => {
            expect(() => new Decimal("-Infinity").toBigInt()).toThrow(
                RangeError
            );
        });
    });

    describe("non-integer", () => {
        test("throws", () => {
            expect(() => new Decimal("1.2").toBigInt()).toThrow(RangeError);
            expect(() => new Decimal("1.2").toBigInt()).toThrow(
                "Non-integer decimal cannot be converted to a BigInt"
            );
        });
        test("work with mathematical value (ignore trailing zeroes)", () => {
            expect(new Decimal("1.00").toBigInt()).toStrictEqual(1n);
        });
    });
    describe("simple examples", () => {
        test("42", () => {
            expect(new Decimal("42").toBigInt()).toStrictEqual(42n);
        });
        test("-123", () => {
            expect(new Decimal("-123").toBigInt()).toStrictEqual(-123n);
        });
    });
});
