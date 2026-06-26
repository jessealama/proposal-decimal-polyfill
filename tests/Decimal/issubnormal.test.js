import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
} from "./special-values.js";

describe("isSubnormal", () => {
    describe("NaN", () => {
        test("throws", () => {
            expect(() => NAN.isSubnormal()).toThrow(RangeError);
            expect(() => NAN.isSubnormal()).toThrow(
                "Cannot determine whether NaN is subnormal"
            );
        });
    });

    describe("infinity", () => {
        test("positive throws", () => {
            expect(() => POSITIVE_INFINITY.isSubnormal()).toThrow(RangeError);
            expect(() => POSITIVE_INFINITY.isSubnormal()).toThrow(
                "Only finite numbers can be said to be subnormal or not"
            );
        });
        test("negative throws", () => {
            expect(() => NEGATIVE_INFINITY.isSubnormal()).toThrow(RangeError);
            expect(() => NEGATIVE_INFINITY.isSubnormal()).toThrow(
                "Only finite numbers can be said to be subnormal or not"
            );
        });
    });

    describe("limits", () => {
        test("simple number is not subnormal", () => {
            expect(new Decimal("42").isSubnormal()).toStrictEqual(false);
        });
        test("zero is not subnormal", () => {
            expect(POSITIVE_ZERO.isSubnormal()).toStrictEqual(false);
        });
        test("simple number with exponent at limit", () => {
            expect(new Decimal("42E-6144").isSubnormal()).toStrictEqual(false);
        });
        test("simple number with exponent beyond limit", () => {
            expect(new Decimal("42E-6145").isSubnormal()).toStrictEqual(true);
        });
        // Classification must not depend on sign: a negative value is
        // subnormal exactly when its magnitude is.
        test("negative subnormal is subnormal", () => {
            expect(new Decimal("-1E-6144").isSubnormal()).toStrictEqual(true);
        });
        test("negative deep subnormal is subnormal", () => {
            expect(new Decimal("-1E-6176").isSubnormal()).toStrictEqual(true);
        });
        test("negative normal is not subnormal", () => {
            expect(new Decimal("-42").isSubnormal()).toStrictEqual(false);
        });
    });
});
