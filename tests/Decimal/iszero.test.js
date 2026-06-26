import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";

describe("isZero", () => {
    test("0", () => {
        expect(POSITIVE_ZERO.isZero()).toStrictEqual(true);
    });
    test("0.00", () => {
        expect(new Decimal("0.00").isZero()).toStrictEqual(true);
    });
    test("-0", () => {
        expect(NEGATIVE_ZERO.isZero()).toStrictEqual(true);
    });
    test("-0.0", () => {
        expect(new Decimal("-0.0").isZero()).toStrictEqual(true);
    });
    test("Infinity", () => {
        expect(POSITIVE_INFINITY.isZero()).toStrictEqual(false);
    });
    test("-Infinity", () => {
        expect(NEGATIVE_INFINITY.isZero()).toStrictEqual(false);
    });
    test("NaN", () => {
        expect(NAN.isZero()).toStrictEqual(false);
    });
    test("42", () => {
        expect(new Decimal("42").isZero()).toStrictEqual(false);
    });
});
