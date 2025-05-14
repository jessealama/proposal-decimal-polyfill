import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("tolocalestring", () => {
        test("integer", () => {
            let amount = new Decimal.Amount("42", 1);
            expect(amount.toLocaleString("en-US")).toStrictEqual("42.0");
            expect(amount.toLocaleString("de-DE")).toStrictEqual("42,0");
        });
        test("non-integer", () => {
            let amount = new Decimal.Amount("42.77", 2);
            expect(amount.toLocaleString("en-US")).toStrictEqual("42.77");
            expect(amount.toLocaleString("fr-FR")).toStrictEqual("42,77");
        });
    });
});
