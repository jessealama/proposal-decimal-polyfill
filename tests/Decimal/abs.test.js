import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("abs", () => {
    test("minus zero", () => {
        expect(new Decimal("-0").abs().toString()).toStrictEqual("0");
    });
    test("NaN", () => {
        expect(new Decimal("NaN").abs().toString()).toStrictEqual("NaN");
    });
    test("-Infinity", () => {
        expect(new Decimal("-Infinity").abs().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("Infinity", () => {
        expect(new Decimal("Infinity").abs().toString()).toStrictEqual(
            "Infinity"
        );
    });
    test("limit of digits", () => {
        expect(new Decimal("-" + bigDigits).abs().toString()).toStrictEqual(
            "9.999999999999999999999999999999999e+33"
        );
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    test("2.1", () => {
        expect(new Decimal("2.1").abs().toString()).toStrictEqual("2.1");
    });
    test("-100", () => {
        expect(new Decimal("-100").abs().toString()).toStrictEqual("100");
    });
    test("101.5", () => {
        expect(new Decimal("101.5").abs().toString()).toStrictEqual("101.5");
    });
    test("-101.5", () => {
        expect(new Decimal("-101.5").abs().toString()).toStrictEqual("101.5");
    });
});
