import { Decimal } from "../../src/Decimal.mjs";

describe("isFinite", () => {
    test("42", () => {
        expect(new Decimal("42").isFinite()).toStrictEqual(true);
    });
    test("0", () => {
        expect(new Decimal("0").isFinite()).toStrictEqual(true);
    });
    test("-0", () => {
        expect(new Decimal("-0").isFinite()).toStrictEqual(true);
    });
    test("Infinity", () => {
        expect(new Decimal("Infinity").isFinite()).toStrictEqual(false);
    });
    test("-Infinity", () => {
        expect(new Decimal("-Infinity").isFinite()).toStrictEqual(false);
    });
    test("NaN", () => {
        expect(new Decimal("NaN").isFinite()).toStrictEqual(false);
    });
});
