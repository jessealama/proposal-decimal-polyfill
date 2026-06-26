import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
} from "./special-values.js";

describe("exponent", () => {
    describe("NaN", () => {
        test("throws", () => {
            expect(() => NAN.exponent()).toThrow(RangeError);
            expect(() => NAN.exponent()).toThrow(
                "Cannot determine exponent for NaN"
            );
        });
    });

    describe("infinity", () => {
        test("positive throws", () => {
            expect(() => POSITIVE_INFINITY.exponent()).toThrow(RangeError);
            expect(() => POSITIVE_INFINITY.exponent()).toThrow(
                "Cannot determine exponent for an infinite value"
            );
        });
        test("negative throws", () => {
            expect(() => NEGATIVE_INFINITY.exponent()).toThrow(RangeError);
            expect(() => NEGATIVE_INFINITY.exponent()).toThrow(
                "Cannot determine exponent for an infinite value"
            );
        });
    });

    describe("limits", () => {
        test("42", () => {
            expect(new Decimal("42").exponent()).toStrictEqual(1);
        });
        test("4.2", () => {
            expect(new Decimal("4.2").exponent()).toStrictEqual(0);
        });
        test("zero", () => {
            expect(POSITIVE_ZERO.exponent()).toStrictEqual(-6143);
        });
        test("simple number, greater than 10, with exponent apparently at limit", () => {
            expect(new Decimal("42E-6143").exponent()).toStrictEqual(-6142);
        });
        test("simple number between 1 and 10 with exponent apparently at limit", () => {
            expect(new Decimal("4.22E-6143").exponent()).toStrictEqual(-6143);
        });
        test("subnormal number reports its true (sub-Emin) exponent", () => {
            expect(new Decimal("4.22E-6144").exponent()).toStrictEqual(-6144);
        });
    });

    // Subnormal values have adjusted exponents below Emin (-6143), down to
    // Etiny = Emin - (precision - 1) = -6176. The exponent must be reported
    // truthfully rather than clamped up to Emin.
    describe("subnormal range", () => {
        test("just below the normal boundary", () => {
            expect(new Decimal("1E-6144").exponent()).toStrictEqual(-6144);
        });
        test("middle of the subnormal range", () => {
            expect(new Decimal("1.5E-6160").exponent()).toStrictEqual(-6160);
        });
        test("smallest subnormal (Etiny)", () => {
            expect(new Decimal("1E-6176").exponent()).toStrictEqual(-6176);
        });
        test("coefficient with several digits", () => {
            // 123E-6177 = 1.23E-6175, adjusted exponent -6175
            expect(new Decimal("123E-6177").exponent()).toStrictEqual(-6175);
        });
        test("negative subnormal reports the true exponent", () => {
            expect(new Decimal("-1E-6144").exponent()).toStrictEqual(-6144);
        });
    });
});
