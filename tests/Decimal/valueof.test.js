import { Decimal } from "../../src/Decimal.mjs";

describe("valueOf", () => {
    test("throws unconditionally", () => {
        expect(() => {
            return 42 - new Decimal("42");
        }).toThrow(TypeError);
    });
});
