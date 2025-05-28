import { Decimal } from "../../../src/Decimal.mjs";

describe("amount", () => {
    describe("constructor", () => {
        test("throws", () => {
            expect(() => new Decimal.Amount("42")).toThrow(Error);
        });
    });
});
