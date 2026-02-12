import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal type checks", () => {
    describe("isBigDecimal", () => {
        test("BigDecimal value", () => {
            expect(BigInt.Decimal.isBigDecimal(BigInt.Decimal("42"))).toBe(
                true
            );
        });
        test("number is not BigDecimal", () => {
            expect(BigInt.Decimal.isBigDecimal(42)).toBe(false);
        });
        test("bigint is not BigDecimal", () => {
            expect(BigInt.Decimal.isBigDecimal(42n)).toBe(false);
        });
        test("string is not BigDecimal", () => {
            expect(BigInt.Decimal.isBigDecimal("42")).toBe(false);
        });
        test("null is not BigDecimal", () => {
            expect(BigInt.Decimal.isBigDecimal(null)).toBe(false);
        });
        test("undefined is not BigDecimal", () => {
            expect(BigInt.Decimal.isBigDecimal(undefined)).toBe(false);
        });
        test("plain object is not BigDecimal", () => {
            expect(BigInt.Decimal.isBigDecimal({})).toBe(false);
        });
    });

    describe("BigInt.isInteger", () => {
        test("bigint is integer", () => {
            expect(BigInt.isInteger(42n)).toBe(true);
        });
        test("integer BigDecimal is integer", () => {
            expect(BigInt.isInteger(BigInt.Decimal("42"))).toBe(true);
        });
        test("non-integer BigDecimal is not integer", () => {
            expect(BigInt.isInteger(BigInt.Decimal("1.5"))).toBe(false);
        });
        test("BigDecimal 42.0 is integer (normalized)", () => {
            expect(BigInt.isInteger(BigInt.Decimal("42.0"))).toBe(true);
        });
        test("number is not integer via this method", () => {
            expect(BigInt.isInteger(42)).toBe(false);
        });
    });
});
