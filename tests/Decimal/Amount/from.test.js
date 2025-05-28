import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("from", () => {
        describe("can throw", () => {
            test("non-string given as first argument", () => {
                expect(() => Decimal.Amount.from(42)).toThrow(Error);
            });
            test("non-decimal string given as first argument", () => {
                expect(() => Decimal.Amount.from("foobar")).toThrow(Error);
            });
        });
        describe("NaN", () => {
            test("string works", () => {
                expect(Decimal.Amount.from("NaN")).toBeInstanceOf(
                    Decimal.Amount
                );
            });
        });
        describe("works", () => {
            test("simple case", () => {
                let a = Decimal.Amount.from("6.200");
                expect(a.significantDigits).toStrictEqual(4);
                expect(a.fractionalDigits).toStrictEqual(3);
                expect(a.trailingZeroes).toStrictEqual(2);
            });
        });
    });
});
