import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("negate", () => {
    test("minus zero", () => {
        expect(NEGATIVE_ZERO.negate().toString()).toStrictEqual("0");
    });
    test("zero", () => {
        expect(POSITIVE_ZERO.negate().toString()).toStrictEqual("-0");
    });
    test("NaN", () => {
        expect(NAN.negate().toString()).toStrictEqual("NaN");
    });
    test("negative number", () => {
        expect(new Decimal("-42.51").negate().toString()).toStrictEqual(
            "42.51"
        );
    });
    test("positive number", () => {
        expect(new Decimal("42.51").negate().toString()).toStrictEqual(
            "-42.51"
        );
    });
    test("do not preserve trailing zeros", () => {
        expect(new Decimal("-42.510").negate().toString()).toStrictEqual(
            "42.51"
        );
    });
    test("-Infinity", () => {
        expect(NEGATIVE_INFINITY.negate().toString()).toStrictEqual("Infinity");
    });
    test("Infinity", () => {
        expect(POSITIVE_INFINITY.negate().toString()).toStrictEqual(
            "-Infinity"
        );
    });
    test("limit of digits", () => {
        expect(
            new Decimal("-" + bigDigits).negate().toFixed({ digits: 0 })
        ).toStrictEqual(bigDigits);
    });
});
