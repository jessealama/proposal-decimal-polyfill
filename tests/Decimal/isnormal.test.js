import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
} from "./special-values.js";

describe("isNormal", () => {
    describe("NaN", () => {
        test("throws", () => {
            expect(() => NAN.isNormal()).toThrow(RangeError);
            expect(() => NAN.isNormal()).toThrow(
                "Cannot determine whether NaN is normal"
            );
        });
    });
    describe("infinity", () => {
        test("positive throws", () => {
            expect(() => POSITIVE_INFINITY.isNormal()).toThrow(RangeError);
            expect(() => POSITIVE_INFINITY.isNormal()).toThrow(
                "Only finite numbers can be said to be normal or not"
            );
        });
        test("negative throws", () => {
            expect(() => NEGATIVE_INFINITY.isNormal()).toThrow(RangeError);
            expect(() => NEGATIVE_INFINITY.isNormal()).toThrow(
                "Only finite numbers can be said to be normal or not"
            );
        });
    });
    describe("limits", () => {
        test("simple number is normal", () => {
            expect(new Decimal("42").isNormal()).toStrictEqual(true);
        });
        test("zero is not normal", () => {
            expect(() => POSITIVE_ZERO.isNormal()).toThrow(RangeError);
            expect(() => POSITIVE_ZERO.isNormal()).toThrow(
                "Only non-zero numbers can be said to be normal or not"
            );
        });
        test("simple number with exponent at limit", () => {
            expect(new Decimal("42E-6144").isNormal()).toStrictEqual(true);
        });
        test("simple number with exponent beyond limit", () => {
            expect(new Decimal("42E-6145").isNormal()).toStrictEqual(false);
        });
        test("number with exponent at upper limit is normal", () => {
            expect(new Decimal("1E+6144").isNormal()).toStrictEqual(true);
        });
        // Classification must not depend on sign: a negative subnormal is not
        // normal, just like its positive counterpart.
        test("negative subnormal is not normal", () => {
            expect(new Decimal("-1E-6144").isNormal()).toStrictEqual(false);
        });
        test("negative normal is normal", () => {
            expect(new Decimal("-42").isNormal()).toStrictEqual(true);
        });
    });
});
