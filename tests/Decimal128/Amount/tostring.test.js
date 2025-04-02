import { Decimal128 } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("tostring", () => {
        describe("integer", () => {
            test("significantDigits", () => {
                expect(new Decimal128.Amount("42", 3, "significantDigits").toString()).toStrictEqual("42.0");
            });
            test("fractionalDigits", () => {
                expect(new Decimal128.Amount("42", 3, "fractionalDigits").toString()).toStrictEqual("42.000");
            });
        });
        describe("non-integer", () => {
            describe("no rounding needed", () => {
                test("significantDigits", () => {
                    expect(new Decimal128.Amount("42.37", 2, "significantDigits").toString()).toStrictEqual("42");
                });
                test("fractionalDigits", () => {
                    expect(new Decimal128.Amount("42.37", 0, "fractionalDigits").toString()).toStrictEqual("42");
                });
            });
            describe("rounding", () => {
                test("significantDigits", () => {
                   expect(new Decimal128.Amount("42.77", 3, "significantDigits").toString()).toStrictEqual("42.8");
                });
                test("fractionalDigits", () => {
                    expect(new Decimal128.Amount("42.77", 1, "fractionalDigits").toString()).toStrictEqual("42.8");
                });
            });
        });
    });
});
