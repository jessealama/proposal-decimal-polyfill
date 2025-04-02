import { Decimal128 } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("equals", () => {
        describe("true", () => {
            test("identical", () => {
                let amount = new Decimal128.Amount("42.7", 2, "fractionalDigits");
                expect(amount.equals(amount)).toStrictEqual(true);
            });
            test("distinct", () => {
                let amount1 = new Decimal128.Amount("42.7", 1, "fractionalDigits");
                let amount2 = new Decimal128.Amount("42.7", 3, "significantDigits");
                expect(amount1.equals(amount2)).toStrictEqual(true);
            });
        });
        describe("false", () => {
            test("same value", () => {
                let amount1 = new Decimal128.Amount("42.7", 1, "fractionalDigits");
                let amount2 = new Decimal128.Amount("42.7", 4, "significantDigits");
                expect(amount1.equals(amount2)).toStrictEqual(false);
            });

        });
    });
});
