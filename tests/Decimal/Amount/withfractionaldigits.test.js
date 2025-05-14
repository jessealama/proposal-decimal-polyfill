import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("withfractionaldigits", () => {
        let amount = new Decimal.Amount("42.75", 2);
        test("rounded needed", () => {
            expect(amount.withFractionalDigits(1).toString()).toStrictEqual(
                "42.8"
            );
        });
        test("impute precision", () => {
            expect(amount.withFractionalDigits(4).toString()).toStrictEqual(
                "42.7500"
            );
        });
    });
});
