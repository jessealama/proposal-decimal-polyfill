import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("with", () => {
        describe("fractiondigit", () => {
            let amount = new Decimal.Amount("42.75", 2);
            test("rounded needed", () => {
                expect(
                    amount.with({ fractionDigit: 1 }).toString()
                ).toStrictEqual("42.8");
            });
            test("impute precision", () => {
                expect(
                    amount.with({ fractionDigit: 4 }).toString()
                ).toStrictEqual("42.7500");
            });
        });
    });
    describe("significantdigit", () => {
        let amount = new Decimal.Amount("42.75", 2);
        test("rounded needed", () => {
            expect(
                amount.with({ significantDigit: 3 }).toString()
            ).toStrictEqual("42.8");
        });
        test("impute additional precision", () => {
            expect(
                amount.with({ significantDigit: 5 }).toString()
            ).toStrictEqual("42.750");
        });
    });
    describe("trailingzero", () => {
        let amount = new Decimal.Amount("42.75", 2);
        test("rounded needed", () => {
            expect(amount.with({ trailingZero: 0 }).toString()).toStrictEqual(
                "42.75"
            );
        });
        test("impute additional precision", () => {
            expect(amount.with({ trailingZero: 3 }).toString()).toStrictEqual(
                "42.75000"
            );
        });
    });
});
