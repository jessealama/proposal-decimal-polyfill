import { Decimal } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("withfractionaldigits", () => {
        describe("constructed with fractional digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal.Amount("42.75", 2)
                        .withFractionalDigits(1)
                        .toString()
                ).toStrictEqual("42.8");
            });
        });
        describe("constructed with significant digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal.Amount("42.75", 4)
                        .withFractionalDigits(1)
                        .toString()
                ).toStrictEqual("42.8");
            });
        });
    });
});
