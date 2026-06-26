import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";

describe("toBigInt", () => {
    describe("NaN", () => {
        test("does not work", () => {
            expect(() => NAN.toBigInt()).toThrow(RangeError);
            expect(() => NAN.toBigInt()).toThrow(
                "NaN cannot be converted to a BigInt"
            );
        });
    });

    describe("zero", () => {
        test("positive zero", () => {
            expect(POSITIVE_ZERO.toBigInt()).toStrictEqual(0n);
        });
        test("negative zero", () => {
            expect(NEGATIVE_ZERO.toBigInt()).toStrictEqual(0n);
        });
    });

    describe("infinity", () => {
        test("positive", () => {
            expect(() => POSITIVE_INFINITY.toBigInt()).toThrow(RangeError);
            expect(() => POSITIVE_INFINITY.toBigInt()).toThrow(
                "Infinity cannot be converted to a BigInt"
            );
        });
        test("negative", () => {
            expect(() => NEGATIVE_INFINITY.toBigInt()).toThrow(RangeError);
        });
    });

    describe("non-integer", () => {
        test("throws", () => {
            expect(() => new Decimal("1.2").toBigInt()).toThrow(RangeError);
        });
        test("throws for a value smaller than its own fractional scale", () => {
            // coefficient (5) is smaller than 10^(-exponent) (1000), so the
            // divisibility check must use the remainder, not integer division:
            // 5 / 1000 would floor to 0 and wrongly report an integer.
            expect(() => new Decimal("0.005").toBigInt()).toThrow(RangeError);
            expect(() => new Decimal("0.005").toBigInt()).toThrow(
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
