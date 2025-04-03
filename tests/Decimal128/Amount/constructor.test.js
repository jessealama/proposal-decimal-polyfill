import { Decimal128 } from "../../../src/Decimal128.mjs";

describe("amount", () => {
    describe("constructor", () => {
        describe("can throw", () => {
            test("non-string given as first argument", () => {
                expect(
                    () => new Decimal128.Amount(42, 2, "fractionalDigits")
                ).toThrow(Error);
            });
            test("non-decimal string given as first argument", () => {
                expect(
                    () => new Decimal128.Amount("foobar", 2, "fractionalDigits")
                ).toThrow(Error);
            });
            test("non-number given as second argument", () => {
                expect(
                    () => new Decimal128.Amount("42", false, "fractionalDigits")
                ).toThrow(Error);
            });
            test("non-integer number given as second argument", () => {
                expect(
                    () => new Decimal128.Amount("42", 1.3, "fractionalDigits")
                ).toThrow(Error);
            });
            test("negative integer number given as second argument", () => {
                expect(
                    () => new Decimal128.Amount("42", -2, "fractionalDigits")
                ).toThrow(Error);
            });
            test("out-of-range argument given as third argument", () => {
                expect(
                    () => new Decimal128.Amount("42", -2, "jimmy rodgers")
                ).toThrow(Error);
            });
        });
        describe("works", () => {
            test("simple case", () => {
                expect(
                    new Decimal128.Amount("42", 3, "significantDigits")
                ).toBeTruthy();
            });
        });
    });
});
