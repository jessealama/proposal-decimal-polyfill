import { Decimal } from "../../src/Decimal.mjs";

describe("withfractionaldigits", () => {
    test("NaN throws", () => {
        expect(() => new Decimal("NaN").withFractionalDigits(5)).toThrow(
            RangeError
        );
    });
    describe("infinity", () => {
        test("positive throws", () => {
            expect(() =>
                new Decimal("Infinity").withFractionalDigits(5)
            ).toThrow(RangeError);
        });
        test("negative throws", () => {
            expect(() =>
                new Decimal("-Infinity").withFractionalDigits(5)
            ).toThrow(RangeError);
        });
    });
    describe("-0", () => {
        test("works", () => {
            expect(
                new Decimal("-0").withFractionalDigits(2).toString()
            ).toStrictEqual("-0.00");
        });
    });
});
