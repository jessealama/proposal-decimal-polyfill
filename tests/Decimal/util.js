import { Decimal } from "../../src/Decimal128.mjs";

export function expectDecimal128(a, b) {
    let lhs = a instanceof Decimal ? a.toString() : a;
    let rhs = b instanceof Decimal ? b.toString() : b;
    expect(lhs).toStrictEqual(rhs);
}
