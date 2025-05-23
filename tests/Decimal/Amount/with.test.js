import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("with", () => {
        describe("fractiondigit", () => {
            let amount = new Decimal.Amount("42.75", 2);
            test("rounded needed", () => {
                expect(
                    amount.with({ kind: "fractionDigit", digits: 1 }).toString()
                ).toStrictEqual("42.8");
            });
            test("impute precision", () => {
                expect(
                    amount.with({ kind: "fractionDigit", digits: 4 }).toString()
                ).toStrictEqual("42.7500");
            });
        });
    });
    describe("significantdigit", () => {
        let amount = new Decimal.Amount("42.75", 2);
        test("rounded needed", () => {
            expect(
                amount.with({ kind: "significantDigit", digits: 3 }).toString()
            ).toStrictEqual("42.8");
        });
        test("impute additional precision", () => {
            expect(
                amount.with({ kind: "significantDigit", digits: 5 }).toString()
            ).toStrictEqual("42.750");
        });
    });
    describe("trailingzero", () => {
        let amount = new Decimal.Amount("42.75", 2);
        test("rounded needed", () => {
            expect(
                amount.with({ kind: "trailingZero", digits: 0 }).toString()
            ).toStrictEqual("42.75");
        });
        test("impute additional precision", () => {
            expect(
                amount.with({ kind: "trailingZero", digits: 3 }).toString()
            ).toStrictEqual("42.75000");
        });
    });
});
