import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal comparison", () => {
    describe("equals", () => {
        test("same value", () => {
            expect(
                BigInt.Decimal.equals(
                    BigInt.Decimal("1.5"),
                    BigInt.Decimal("1.5")
                )
            ).toBe(true);
        });
        test("different trailing zeros are equal", () => {
            expect(
                BigInt.Decimal.equals(
                    BigInt.Decimal("1.20"),
                    BigInt.Decimal("1.2")
                )
            ).toBe(true);
        });
        test("different values", () => {
            expect(
                BigInt.Decimal.equals(BigInt.Decimal("1"), BigInt.Decimal("2"))
            ).toBe(false);
        });
        test("zero equals zero", () => {
            expect(
                BigInt.Decimal.equals(
                    BigInt.Decimal("0"),
                    BigInt.Decimal("0.0")
                )
            ).toBe(true);
        });
    });

    describe("compare", () => {
        test("less than", () => {
            expect(
                BigInt.Decimal.compare(BigInt.Decimal("1"), BigInt.Decimal("2"))
            ).toBe(-1);
        });
        test("greater than", () => {
            expect(
                BigInt.Decimal.compare(BigInt.Decimal("2"), BigInt.Decimal("1"))
            ).toBe(1);
        });
        test("equal", () => {
            expect(
                BigInt.Decimal.compare(
                    BigInt.Decimal("1.5"),
                    BigInt.Decimal("1.5")
                )
            ).toBe(0);
        });
        test("negative less than positive", () => {
            expect(
                BigInt.Decimal.compare(
                    BigInt.Decimal("-1"),
                    BigInt.Decimal("1")
                )
            ).toBe(-1);
        });
        test("different scales", () => {
            expect(
                BigInt.Decimal.compare(
                    BigInt.Decimal("1.5"),
                    BigInt.Decimal("1.50")
                )
            ).toBe(0);
        });
        test("compare with different magnitudes", () => {
            expect(
                BigInt.Decimal.compare(
                    BigInt.Decimal("0.001"),
                    BigInt.Decimal("1000")
                )
            ).toBe(-1);
        });
    });

    describe("instance methods", () => {
        test("equals instance", () => {
            const a = BigInt.Decimal("42");
            const b = BigInt.Decimal("42");
            expect(a.equals(b)).toBe(true);
        });
        test("compare instance", () => {
            const a = BigInt.Decimal("1");
            const b = BigInt.Decimal("2");
            expect(a.compare(b)).toBe(-1);
        });
    });
});
