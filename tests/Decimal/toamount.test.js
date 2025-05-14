import { Decimal } from "../../src/Decimal.mjs";

describe("toAmount", () => {
    test("toString", () => {
        expect(new Decimal("42.75").toAmount().toString()).toStrictEqual(
            "42.75"
        );
    });
});
