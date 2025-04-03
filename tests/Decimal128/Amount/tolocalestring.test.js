import { Decimal128 } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("tolocalestring", () => {
        test("integer", () => {
            let amount = new Decimal128.Amount("42", 3);
            expect(amount.toLocaleString("en-US")).toStrictEqual("42.0");
            expect(amount.toLocaleString("de-DE")).toStrictEqual("42,0");
        });
        test("non-integer", () => {
            let amount = new Decimal128.Amount("42.77", 3);
            expect(amount.toLocaleString("en-US")).toStrictEqual("42.8");
            expect(amount.toLocaleString("fr-FR")).toStrictEqual("42,8");
        });
    });
});
