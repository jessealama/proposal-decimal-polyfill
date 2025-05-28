import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("equals", () => {
        test("works", () => {
            let s = "42.75";
            expect(
                Decimal.Amount.from(s).equals(Decimal.Amount.from(s))
            ).toStrictEqual(true);
        });
        test("different", () => {
            let s1 = "42.7500";
            let s2 = "42.75";
            expect(
                Decimal.Amount.from(s1).equals(Decimal.Amount.from(s2))
            ).toStrictEqual(false);
        });
    });
});
