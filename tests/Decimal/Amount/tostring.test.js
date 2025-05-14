import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("tostring", () => {
        test("integer", () => {
            expect(new Decimal.Amount("42", 3).toString()).toStrictEqual(
                "42.0"
            );
        });
        describe("non-integer", () => {
            test("no rounding needed", () => {
                expect(
                    new Decimal.Amount(
                        "42.37",
                        2,
                        "significantDigits"
                    ).toString()
                ).toStrictEqual("42");
            });
            test("rounding", () => {
                expect(
                    new Decimal.Amount(
                        "42.77",
                        3,
                        "significantDigits"
                    ).toString()
                ).toStrictEqual("42.8");
            });
        });
    });
});
