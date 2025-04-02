import { Decimal128 } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("withfractionaldigits", () => {
        describe("constructed with fractional digits", () => {
            test("rounded needed", () => {
                expect(new Decimal128.Amount("42.75", 2, "fractionalDigits").withFractionalDigits(1).toString()).toStrictEqual("42.8");
            });
        });
        describe("constructed with significant digits", () => {
            test("rounded needed", () => {
                expect(new Decimal128.Amount("42.75", 4, "significantDigits").withFractionalDigits(1).toString()).toStrictEqual("42.8");
            });
        });
    });
});
