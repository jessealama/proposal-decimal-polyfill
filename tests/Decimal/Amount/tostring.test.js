import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("tostring", () => {
        test("integer", () => {
            expect(new Decimal.Amount("42", 0).toString()).toStrictEqual("42");
        });
        test("integer with imputed precision", () => {
            expect(new Decimal.Amount("42", 2).toString()).toStrictEqual(
                "42.00"
            );
        });
        describe("non-integer", () => {
            test("no rounding needed", () => {
                expect(new Decimal.Amount("42.37", 2).toString()).toStrictEqual(
                    "42.37"
                );
            });
            test("rounding needed", () => {
                expect(new Decimal.Amount("42.37", 1).toString()).toStrictEqual(
                    "42.4"
                );
            });
        });
    });
});
