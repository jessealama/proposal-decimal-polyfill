import { Decimal } from "../../src/Decimal.mjs";

describe("isNormal", () => {
    describe("NaN", () => {
        test("throws", () => {
            expect(() => new Decimal("NaN").isNormal()).toThrow(RangeError);
            expect(() => new Decimal("NaN").isNormal()).toThrow(
                "Cannot determine whether NaN is normal"
            );
        });
    });
    describe("infinity", () => {
        test("positive throws", () => {
            expect(() => new Decimal("Infinity").isNormal()).toThrow(
                RangeError
            );
            expect(() => new Decimal("Infinity").isNormal()).toThrow(
                "Only finite numbers can be said to be normal or not"
            );
        });
        test("negative throws", () => {
            expect(() => new Decimal("-Infinity").isNormal()).toThrow(
                RangeError
            );
            expect(() => new Decimal("-Infinity").isNormal()).toThrow(
                "Only finite numbers can be said to be normal or not"
            );
        });
    });
    describe("limits", () => {
        test("simple number is normal", () => {
            expect(new Decimal("42").isNormal()).toStrictEqual(true);
        });
        test("zero is not normal", () => {
            expect(() => new Decimal("0").isNormal()).toThrow(RangeError);
            expect(() => new Decimal("0").isNormal()).toThrow(
                "Only non-zero numbers can be said to be normal or not"
            );
        });
        test("simple number with exponent at limit", () => {
            expect(new Decimal("42E-6144").isNormal()).toStrictEqual(true);
        });
        test("simple number with exponent beyond limit", () => {
            expect(new Decimal("42E-6145").isNormal()).toStrictEqual(false);
        });
        test("number with exponent at upper limit is normal", () => {
            expect(new Decimal("1E+6144").isNormal()).toStrictEqual(true);
        });
    });
});
