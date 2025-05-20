import { Decimal } from "../../src/Decimal.mjs";

describe("exponent", () => {
    describe("NaN", () => {
        test("throws", () => {
            expect(() => new Decimal("NaN").exponent()).toThrow(RangeError);
        });
    });

    describe("infinity", () => {
        test("positive throws", () => {
            expect(() => new Decimal("Infinity").exponent()).toThrow(
                RangeError
            );
        });
        test("negative throws", () => {
            expect(() => new Decimal("-Infinity").exponent()).toThrow(
                RangeError
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
            expect(new Decimal("0").exponent()).toStrictEqual(-6143);
        });
        test("simple number, greater than 10, with exponent apparently at limit", () => {
            expect(new Decimal("42E-6143").exponent()).toStrictEqual(-6142);
        });
        test("simple number between 1 and 10 with exponent apparently at limit", () => {
            expect(new Decimal("4.22E-6143").exponent()).toStrictEqual(-6143);
        });
        test("simple number with exponent beyond limit", () => {
            expect(new Decimal("4.22E-6144").exponent()).toStrictEqual(-6143);
        });
    });
});
