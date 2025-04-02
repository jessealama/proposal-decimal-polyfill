import { Decimal128 } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("tolocalestring", () => {
        describe("integer", () => {
            test("significantDigits", () => {
                let amount = new Decimal128.Amount("42", 3, "significantDigits");
                expect(amount.toLocaleString("en-US")).toStrictEqual("42.0");
                expect(amount.toLocaleString("de-DE")).toStrictEqual("42,0");
            });
            test("fractionalDigits", () => {
                let amount = new Decimal128.Amount("42", 3, "fractionalDigits");
                expect(amount.toLocaleString()).toStrictEqual("42.000");
                expect(amount.toLocaleString("de-DE")).toStrictEqual("42,000");
            });
        });
        describe("non-integer", () => {
            test("significantDigits", () => {
                let amount = new Decimal128.Amount("42.77", 3, "significantDigits");
                expect(amount.toLocaleString("en-US")).toStrictEqual("42.8");
                expect(amount.toLocaleString("fr-FR")).toStrictEqual("42,8");
            });
        });
    });
});
