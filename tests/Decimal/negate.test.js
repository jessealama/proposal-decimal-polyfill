import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("negate", () => {
    test("minus zero", () => {
        expect(new Decimal("-0").negate().toString()).toStrictEqual("0");
    });
    test("zero", () => {
        expect(new Decimal("0").negate().toString()).toStrictEqual("-0");
    });
    test("NaN", () => {
        expect(new Decimal("NaN").negate().toString()).toStrictEqual("NaN");
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
        expect(new Decimal("-Infinity").negate().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("Infinity", () => {
        expect(new Decimal("Infinity").negate().toString()).toStrictEqual(
            "-Infinity"
        );
    });
    test("limit of digits", () => {
        expect(
            new Decimal("-" + bigDigits).negate().toFixed({ digits: Infinity })
        ).toStrictEqual(bigDigits);
    });
});
