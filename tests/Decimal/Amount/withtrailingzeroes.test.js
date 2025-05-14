import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("withtrailingzeroes", () => {
        let amount = new Decimal.Amount("42.75");
        test("rounded needed", () => {
            expect(amount.withTrailingZeroes(0).toString()).toStrictEqual(
                "42.75"
            );
        });
        test("impute additional precision", () => {
            expect(amount.withTrailingZeroes(3).toString()).toStrictEqual(
                "42.75000"
            );
        });
    });
});
