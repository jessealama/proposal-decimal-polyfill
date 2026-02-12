import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal arithmetic", () => {
    describe("add", () => {
        test("0.1 + 0.2 = 0.3", () => {
            const a = BigInt.Decimal("0.1");
            const b = BigInt.Decimal("0.2");
            const c = BigInt.Decimal("0.3");
            expect(BigInt.Decimal.add(a, b).toString()).toBe("0.3");
            expect(BigInt.Decimal.equals(BigInt.Decimal.add(a, b), c)).toBe(
                true
            );
        });
        test("1 + 1 = 2", () => {
            expect(
                BigInt.Decimal.add(
                    BigInt.Decimal("1"),
                    BigInt.Decimal("1")
                ).toString()
            ).toBe("2");
        });
        test("negative + positive", () => {
            expect(
                BigInt.Decimal.add(
                    BigInt.Decimal("-3"),
                    BigInt.Decimal("5")
                ).toString()
            ).toBe("2");
        });
        test("negative + negative", () => {
            expect(
                BigInt.Decimal.add(
                    BigInt.Decimal("-1"),
                    BigInt.Decimal("-99")
                ).toString()
            ).toBe("-100");
        });
        test("zero + value", () => {
            expect(
                BigInt.Decimal.add(
                    BigInt.Decimal("0"),
                    BigInt.Decimal("42")
                ).toString()
            ).toBe("42");
        });
        test("different scales", () => {
            expect(
                BigInt.Decimal.add(
                    BigInt.Decimal("1.5"),
                    BigInt.Decimal("2.25")
                ).toString()
            ).toBe("3.75");
        });
        test("type check enforced", () => {
            expect(() =>
                BigInt.Decimal.add(42 as any, BigInt.Decimal("1"))
            ).toThrow(TypeError);
        });
    });

    describe("subtract", () => {
        test("5 - 3 = 2", () => {
            expect(
                BigInt.Decimal.subtract(
                    BigInt.Decimal("5"),
                    BigInt.Decimal("3")
                ).toString()
            ).toBe("2");
        });
        test("3 - 5 = -2", () => {
            expect(
                BigInt.Decimal.subtract(
                    BigInt.Decimal("3"),
                    BigInt.Decimal("5")
                ).toString()
            ).toBe("-2");
        });
        test("1.0 - 0.7 = 0.3", () => {
            expect(
                BigInt.Decimal.subtract(
                    BigInt.Decimal("1.0"),
                    BigInt.Decimal("0.7")
                ).toString()
            ).toBe("0.3");
        });
    });

    describe("multiply", () => {
        test("2 * 3 = 6", () => {
            expect(
                BigInt.Decimal.multiply(
                    BigInt.Decimal("2"),
                    BigInt.Decimal("3")
                ).toString()
            ).toBe("6");
        });
        test("0.1 * 0.2 = 0.02", () => {
            expect(
                BigInt.Decimal.multiply(
                    BigInt.Decimal("0.1"),
                    BigInt.Decimal("0.2")
                ).toString()
            ).toBe("0.02");
        });
        test("negative * positive", () => {
            expect(
                BigInt.Decimal.multiply(
                    BigInt.Decimal("-3"),
                    BigInt.Decimal("4")
                ).toString()
            ).toBe("-12");
        });
        test("negative * negative", () => {
            expect(
                BigInt.Decimal.multiply(
                    BigInt.Decimal("-3"),
                    BigInt.Decimal("-4")
                ).toString()
            ).toBe("12");
        });
        test("multiply by zero", () => {
            expect(
                BigInt.Decimal.multiply(
                    BigInt.Decimal("42"),
                    BigInt.Decimal("0")
                ).toString()
            ).toBe("0");
        });
    });

    describe("divide", () => {
        test("6 / 2 = 3", () => {
            expect(
                BigInt.Decimal.divide(
                    BigInt.Decimal("6"),
                    BigInt.Decimal("2")
                ).toString()
            ).toBe("3");
        });
        test("1 / 3 has 100 fraction digits by default", () => {
            const result = BigInt.Decimal.divide(
                BigInt.Decimal("1"),
                BigInt.Decimal("3")
            );
            const str = result.toString();
            const parts = str.split(".");
            expect(parts[1].length).toBe(100);
        });
        test("1 / 3 with maximumFractionDigits = 5", () => {
            const result = BigInt.Decimal.divide(
                BigInt.Decimal("1"),
                BigInt.Decimal("3"),
                { maximumFractionDigits: 5 }
            );
            expect(result.toString()).toBe("0.33333");
        });
        test("division by zero throws RangeError", () => {
            expect(() =>
                BigInt.Decimal.divide(BigInt.Decimal("1"), BigInt.Decimal("0"))
            ).toThrow(RangeError);
        });
        test("negative / positive", () => {
            expect(
                BigInt.Decimal.divide(
                    BigInt.Decimal("-6"),
                    BigInt.Decimal("2")
                ).toString()
            ).toBe("-3");
        });
        test("exact division", () => {
            expect(
                BigInt.Decimal.divide(
                    BigInt.Decimal("1"),
                    BigInt.Decimal("4")
                ).toString()
            ).toBe("0.25");
        });
        test("invalid maximumFractionDigits throws", () => {
            expect(() =>
                BigInt.Decimal.divide(
                    BigInt.Decimal("1"),
                    BigInt.Decimal("2"),
                    { maximumFractionDigits: 101 }
                )
            ).toThrow(RangeError);
        });
    });

    describe("remainder", () => {
        test("7 % 3 = 1", () => {
            expect(
                BigInt.Decimal.remainder(
                    BigInt.Decimal("7"),
                    BigInt.Decimal("3")
                ).toString()
            ).toBe("1");
        });
        test("10 % 3 = 1", () => {
            expect(
                BigInt.Decimal.remainder(
                    BigInt.Decimal("10"),
                    BigInt.Decimal("3")
                ).toString()
            ).toBe("1");
        });
        test("-7 % 3 = -1", () => {
            expect(
                BigInt.Decimal.remainder(
                    BigInt.Decimal("-7"),
                    BigInt.Decimal("3")
                ).toString()
            ).toBe("-1");
        });
        test("7.5 % 2 = 1.5", () => {
            expect(
                BigInt.Decimal.remainder(
                    BigInt.Decimal("7.5"),
                    BigInt.Decimal("2")
                ).toString()
            ).toBe("1.5");
        });
        test("remainder by zero throws", () => {
            expect(() =>
                BigInt.Decimal.remainder(
                    BigInt.Decimal("7"),
                    BigInt.Decimal("0")
                )
            ).toThrow(RangeError);
        });
    });
});
