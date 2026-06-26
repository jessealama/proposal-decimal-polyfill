import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";

describe("significand", () => {
    describe("NaN", () => {
        test("throws", () => {
            expect(() => NAN.significand()).toThrow(RangeError);
            expect(() => NAN.significand()).toThrow(
                "NaN does not have a scaled significand"
            );
        });
    });
    describe("infinities", () => {
        test("positive throws", () => {
            expect(() => POSITIVE_INFINITY.significand()).toThrow(RangeError);
            expect(() => POSITIVE_INFINITY.significand()).toThrow(
                "Infinity does not have a scaled significand"
            );
        });
        test("negative throws", () => {
            expect(() => NEGATIVE_INFINITY.significand()).toThrow(RangeError);
        });
    });
    describe("finite values", () => {
        test("0", () => {
            expect(POSITIVE_ZERO.significand()).toStrictEqual(0n);
        });
        test("-0", () => {
            expect(NEGATIVE_ZERO.significand()).toStrictEqual(0n);
        });
        test("123.456", () => {
            expect(new Decimal("123.456").significand()).toStrictEqual(123456n);
        });
        test("simple number, greater than 10, with exponent apparently at limit", () => {
            expect(new Decimal("42E-6143").significand()).toStrictEqual(42n);
        });
        test("simple number between 1 and 10 with exponent apparently at limit", () => {
            expect(new Decimal("4.2E-6143").significand()).toStrictEqual(42n);
        });
        test("simple number with exponent beyond limit", () => {
            expect(new Decimal("4.2E-6150").significand()).toStrictEqual(42n);
        });
        test("large positive exponent", () => {
            expect(new Decimal("42E+6000").significand()).toStrictEqual(42n);
        });
        test("1", () => {
            expect(new Decimal("1").significand()).toStrictEqual(1n);
        });
        test("1000", () => {
            expect(new Decimal("1000").significand()).toStrictEqual(1n);
        });
        test("0.001", () => {
            expect(new Decimal("0.001").significand()).toStrictEqual(1n);
        });
    });
});
