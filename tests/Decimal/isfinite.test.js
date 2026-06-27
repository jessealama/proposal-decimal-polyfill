import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";

describe("isFinite", () => {
    test("42", () => {
        expect(new Decimal("42").isFinite()).toStrictEqual(true);
    });
    test("0", () => {
        expect(POSITIVE_ZERO.isFinite()).toStrictEqual(true);
    });
    test("-0", () => {
        expect(NEGATIVE_ZERO.isFinite()).toStrictEqual(true);
    });
    test("Infinity", () => {
        expect(POSITIVE_INFINITY.isFinite()).toStrictEqual(false);
    });
    test("-Infinity", () => {
        expect(NEGATIVE_INFINITY.isFinite()).toStrictEqual(false);
    });
    test("NaN", () => {
        expect(NAN.isFinite()).toStrictEqual(false);
    });
});
