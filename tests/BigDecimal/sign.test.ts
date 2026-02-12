import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal sign operations", () => {
    describe("abs", () => {
        test("positive value unchanged", () => {
            expect(BigInt.Decimal.abs(BigInt.Decimal("42")).toString()).toBe(
                "42"
            );
        });
        test("negative becomes positive", () => {
            expect(BigInt.Decimal.abs(BigInt.Decimal("-42")).toString()).toBe(
                "42"
            );
        });
        test("zero stays zero", () => {
            expect(BigInt.Decimal.abs(BigInt.Decimal("0")).toString()).toBe(
                "0"
            );
        });
        test("negative decimal", () => {
            expect(BigInt.Decimal.abs(BigInt.Decimal("-1.5")).toString()).toBe(
                "1.5"
            );
        });
    });

    describe("negate", () => {
        test("positive becomes negative", () => {
            expect(BigInt.Decimal.negate(BigInt.Decimal("42")).toString()).toBe(
                "-42"
            );
        });
        test("negative becomes positive", () => {
            expect(
                BigInt.Decimal.negate(BigInt.Decimal("-42")).toString()
            ).toBe("42");
        });
        test("zero stays zero", () => {
            expect(BigInt.Decimal.negate(BigInt.Decimal("0")).toString()).toBe(
                "0"
            );
        });
    });
});
