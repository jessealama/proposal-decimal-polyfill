import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("constructor", () => {
        describe("can throw", () => {
            test("non-string given as first argument", () => {
                expect(() => new Decimal.Amount(42)).toThrow(Error);
            });
            test("non-decimal string given as first argument", () => {
                expect(() => new Decimal.Amount("foobar")).toThrow(Error);
            });
        });
        describe("works", () => {
            test("simple case", () => {
                let a = new Decimal.Amount("6.200", 3);
                expect(a.significantDigits).toStrictEqual(4);
                expect(a.fractionalDigits).toStrictEqual(3);
                expect(a.trailingZeroes).toStrictEqual(2);
            });
        });
        describe("rounding", () => {
            test("might occur", () => {
                let amount = new Decimal.Amount("7.5", 0);
                expect(amount.toString()).toStrictEqual("8");
                expect(amount.significantDigits).toStrictEqual(1);
                expect(amount.fractionalDigits).toStrictEqual(0);
                expect(amount.trailingZeroes).toStrictEqual(0);
            });
        });
    });
});
