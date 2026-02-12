import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal formatting", () => {
    describe("toString", () => {
        test("integer", () => {
            expect(BigInt.Decimal("42").toString()).toBe("42");
        });
        test("decimal", () => {
            expect(BigInt.Decimal("1.23").toString()).toBe("1.23");
        });
        test("small decimal", () => {
            expect(BigInt.Decimal("0.005").toString()).toBe("0.005");
        });
        test("large integer", () => {
            expect(BigInt.Decimal("1000000").toString()).toBe("1000000");
        });
        test("negative", () => {
            expect(BigInt.Decimal("-1.23").toString()).toBe("-1.23");
        });
    });

    describe("toFixed", () => {
        test("toFixed(0)", () => {
            expect(BigInt.Decimal("1.5").toFixed(0)).toBe("2");
        });
        test("toFixed(2) on integer", () => {
            expect(BigInt.Decimal("42").toFixed(2)).toBe("42.00");
        });
        test("toFixed(2) on decimal", () => {
            expect(BigInt.Decimal("1.5").toFixed(2)).toBe("1.50");
        });
        test("toFixed(1) rounds", () => {
            expect(BigInt.Decimal("1.25").toFixed(1)).toBe("1.2");
        });
        test("toFixed(0) negative", () => {
            expect(BigInt.Decimal("-1.5").toFixed(0)).toBe("-2");
        });
        test("toFixed with more digits than needed", () => {
            expect(BigInt.Decimal("1.2").toFixed(5)).toBe("1.20000");
        });
        test("toFixed(0) on zero", () => {
            expect(BigInt.Decimal("0").toFixed(0)).toBe("0");
        });
        test("toFixed negative digits throws", () => {
            expect(() => BigInt.Decimal("1").toFixed(-1)).toThrow(RangeError);
        });
    });

    describe("toPrecision", () => {
        test("toPrecision(1)", () => {
            expect(BigInt.Decimal("1.5").toPrecision(1)).toBe("2");
        });
        test("toPrecision(3) on integer", () => {
            expect(BigInt.Decimal("42").toPrecision(3)).toBe("42.0");
        });
        test("toPrecision(5) on decimal", () => {
            expect(BigInt.Decimal("1.23").toPrecision(5)).toBe("1.2300");
        });
        test("zero with precision", () => {
            expect(BigInt.Decimal("0").toPrecision(3)).toBe("0.00");
        });
        test("toPrecision(0) throws", () => {
            expect(() => BigInt.Decimal("1").toPrecision(0)).toThrow(
                RangeError
            );
        });
        test("small number with precision", () => {
            expect(BigInt.Decimal("0.001234").toPrecision(3)).toBe("0.00123");
        });
    });

    describe("toExponential", () => {
        test("toExponential(0)", () => {
            expect(BigInt.Decimal("123").toExponential(0)).toBe("1e+2");
        });
        test("toExponential(2)", () => {
            expect(BigInt.Decimal("123").toExponential(2)).toBe("1.23e+2");
        });
        test("toExponential(4) pads zeros", () => {
            expect(BigInt.Decimal("123").toExponential(4)).toBe("1.2300e+2");
        });
        test("zero", () => {
            expect(BigInt.Decimal("0").toExponential(2)).toBe("0.00e+0");
        });
        test("small number", () => {
            expect(BigInt.Decimal("0.005").toExponential(2)).toBe("5.00e-3");
        });
        test("negative", () => {
            expect(BigInt.Decimal("-42").toExponential(1)).toBe("-4.2e+1");
        });
        test("negative fractionDigits throws", () => {
            expect(() => BigInt.Decimal("1").toExponential(-1)).toThrow(
                RangeError
            );
        });
    });
});
