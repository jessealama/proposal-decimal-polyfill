import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("withsignificantdigits", () => {
        let amount = new Decimal.Amount("42.75");
        test("rounded needed", () => {
            expect(amount.withSignificantDigits(3).toString()).toStrictEqual(
                "42.8"
            );
        });
        test("impute additional precision", () => {
            expect(amount.withSignificantDigits(5).toString()).toStrictEqual(
                "42.750"
            );
        });
    });
});
