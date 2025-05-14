import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("tostring", () => {
        test("integer", () => {
            expect(new Decimal.Amount("42").toString()).toStrictEqual("42");
        });
        describe("non-integer", () => {
            test("no rounding needed", () => {
                expect(new Decimal.Amount("42.37").toString()).toStrictEqual(
                    "42.37"
                );
            });
        });
    });
});
