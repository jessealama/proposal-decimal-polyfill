import { Decimal } from "../../src/Decimal.mjs";

describe("toAmount", () => {
    describe("fractionalDigits", () => {
        describe("constructed with fractional digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal("42.75")
                        .toAmount(1, "fractionalDigits")
                        .toString()
                ).toStrictEqual("42.8");
            });
        });
        describe("constructed with significant digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal("42.75")
                        .toAmount(1, "fractionalDigits")
                        .toString()
                ).toStrictEqual("42.8");
            });
        });
    });
    describe("significantDigits", () => {
        describe("constructed with fractional digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal("42.75")
                        .toAmount(3, "significantDigits")
                        .toString()
                ).toStrictEqual("42.8");
            });
        });
        describe("constructed with significant digits", () => {
            test("rounded needed", () => {
                expect(
                    new Decimal("42.75")
                        .toAmount(2, "significantDigits")
                        .toString()
                ).toStrictEqual("43");
            });
        });
    });
});
