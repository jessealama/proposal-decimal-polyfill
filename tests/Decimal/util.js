import { Decimal } from "../../src/Decimal.mjs";

export function expectDecimal128(a, b) {
    let lhs = a instanceof Decimal ? a.toString() : a;
    let rhs = b instanceof Decimal ? b.toString() : b;
    expect(lhs).toStrictEqual(rhs);
}

export function describeOptionsBagValidation(method, expected) {
    describe("options bag validation", () => {
        let a = new Decimal("1");
        let b = new Decimal("2");
        test("non-object options throws TypeError", () => {
            expect(() => a[method](b, "ceil")).toThrow(TypeError);
        });
        test("non-string roundingMode throws TypeError", () => {
            expect(() => a[method](b, { roundingMode: 42 })).toThrow(TypeError);
        });
        test("invalid roundingMode string throws RangeError", () => {
            expect(() => a[method](b, { roundingMode: "bogus" })).toThrow(
                RangeError
            );
        });
        test("unknown keys are ignored", () => {
            expect(a[method](b, { digits: 1 }).toString()).toStrictEqual(
                expected
            );
        });
    });
}
