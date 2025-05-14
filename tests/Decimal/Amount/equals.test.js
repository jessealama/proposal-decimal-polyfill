import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("equals", () => {
        describe("true", () => {
            test("identical", () => {
                let amount = new Decimal.Amount("42.7", 2);
                expect(amount.equals(amount)).toStrictEqual(true);
            });
        });
        describe("false", () => {
            test("same value", () => {
                let amount1 = new Decimal.Amount("42.7", 1);
                let amount2 = new Decimal.Amount("42.7", 4);
                expect(amount1.equals(amount2)).toStrictEqual(false);
            });
        });
    });
});
