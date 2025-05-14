import { Decimal } from "../../src/Decimal.mjs";

describe("NaN", () => {
    test("throws", () => {
        expect(() => new Decimal("NaN").scale10(5)).toThrow(RangeError);
    });
});

describe("simple examples", () => {
    test("0", () => {
        expect(new Decimal("0").scale10(4).toString()).toStrictEqual("0");
    });
    test("42, 4", () => {
        expect(new Decimal("42").scale10(4).toString()).toStrictEqual("420000");
    });
    test("42, -4", () => {
        expect(new Decimal("42").scale10(-4).toString()).toStrictEqual(
            "0.0042"
        );
    });
    test("zero", () => {
        expect(new Decimal("42").scale10(0).toString()).toStrictEqual("42");
    });
    test("non-integer argument", () => {
        expect(() => new Decimal("42").scale10(1.5)).toThrow(TypeError);
    });
});

describe("infinty", () => {
    test("positive infinity throws", () => {
        expect(() => new Decimal("Infinity").scale10(5)).toThrow(RangeError);
    });
    test("negative infinity throws", () => {
        expect(() => new Decimal("-Infinity").scale10(5)).toThrow(RangeError);
    });
});
