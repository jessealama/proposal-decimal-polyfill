import { Decimal } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("constructor", () => {
        describe("can throw", () => {
            test("non-string given as first argument", () => {
                expect(() => new Decimal.Amount(42, 2)).toThrow(Error);
            });
            test("non-decimal string given as first argument", () => {
                expect(() => new Decimal.Amount("foobar", 2)).toThrow(Error);
            });
            test("non-number given as second argument", () => {
                expect(() => new Decimal.Amount("42", false)).toThrow(Error);
            });
            test("non-integer number given as second argument", () => {
                expect(() => new Decimal.Amount("42", 1.3)).toThrow(Error);
            });
            test("negative integer number given as second argument", () => {
                expect(() => new Decimal.Amount("42", -2)).toThrow(Error);
            });
            test("number too big", () => {
                expect(() => new Decimal.Amount("42", 100)).toThrow(
                    RangeError
                );
            });
        });
        describe("works", () => {
            test("simple case", () => {
                expect(new Decimal.Amount("42", 3)).toBeTruthy();
            });
        });
    });
});
