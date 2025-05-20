import { Decimal } from "../../src/Decimal.mjs";

describe("isZero", () => {
    test("0", () => {
        expect(new Decimal("0").isZero()).toStrictEqual(true);
    });
    test("0.00", () => {
        expect(new Decimal("0.00").isZero()).toStrictEqual(true);
    });
    test("-0", () => {
        expect(new Decimal("-0").isZero()).toStrictEqual(true);
    });
    test("-0.0", () => {
        expect(new Decimal("-0.0").isZero()).toStrictEqual(true);
    });
    test("Infinity", () => {
        expect(new Decimal("Infinity").isZero()).toStrictEqual(false);
    });
    test("-Infinity", () => {
        expect(new Decimal("-Infinity").isZero()).toStrictEqual(false);
    });
    test("NaN", () => {
        expect(new Decimal("NaN").isZero()).toStrictEqual(false);
    });
    test("42", () => {
        expect(new Decimal("42").isZero()).toStrictEqual(false);
    });
});
