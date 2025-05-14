import { Decimal } from "../../src/Decimal.mjs";

describe("withsignificantdigits", () => {
    test("NaN throws", () => {
        expect(() => new Decimal("NaN").withSignificantDigits(5)).toThrow(
            RangeError
        );
    });
    describe("infinity", () => {
        test("positive throws", () => {
            expect(() =>
                new Decimal("Infinity").withSignificantDigits(5)
            ).toThrow(RangeError);
        });
        test("negative throws", () => {
            expect(() =>
                new Decimal("-Infinity").withSignificantDigits(5)
            ).toThrow(RangeError);
        });
    });
    describe("-0", () => {
        test("works", () => {
            expect(
                new Decimal("-0").withSignificantDigits(2).toString()
            ).toStrictEqual("-0.0");
        });
    });
});
