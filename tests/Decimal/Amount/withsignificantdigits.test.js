import { Decimal } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("withsignificant", () => {
        describe("constructed with fractional digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal.Amount("42.75", 2, "fractionalDigits")
                        .withSignificantDigits(3)
                        .toString()
                ).toStrictEqual("42.8");
            });
        });
        describe("constructed with significant digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal.Amount("42.75", 4, "significantDigits")
                        .withSignificantDigits(2)
                        .toString()
                ).toStrictEqual("43");
            });
        });
    });
});
