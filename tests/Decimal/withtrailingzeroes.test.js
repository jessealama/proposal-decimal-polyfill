import { Decimal } from "../../src/Decimal.mjs";

describe("withtrailingzeroes", () => {
    test("NaN throws", () => {
        expect(() => new Decimal("NaN").withTrailingZeroes(5)).toThrow(
            RangeError
        );
    });
    describe("infinity", () => {
        test("positive throws", () => {
            expect(() => new Decimal("Infinity").withTrailingZeroes(5)).toThrow(
                RangeError
            );
        });
        test("negative throws", () => {
            expect(() =>
                new Decimal("-Infinity").withTrailingZeroes(5)
            ).toThrow(RangeError);
        });
    });
    describe("-0", () => {
        test("works", () => {
            expect(
                new Decimal("-0").withTrailingZeroes(3).toString()
            ).toStrictEqual("-0.000");
        });
    });
});
