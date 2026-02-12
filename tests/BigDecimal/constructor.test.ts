import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal constructor", () => {
    describe("string parsing", () => {
        test("simple integer", () => {
            expect(BigInt.Decimal("42").toString()).toBe("42");
        });
        test("simple decimal", () => {
            expect(BigInt.Decimal("1.5").toString()).toBe("1.5");
        });
        test("leading zeros", () => {
            expect(BigInt.Decimal("007").toString()).toBe("7");
        });
        test("trailing fractional zeros stripped", () => {
            expect(BigInt.Decimal("1.20").toString()).toBe("1.2");
        });
        test("1.20 equals 1.2", () => {
            expect(
                BigInt.Decimal.equals(
                    BigInt.Decimal("1.20"),
                    BigInt.Decimal("1.2")
                )
            ).toBe(true);
        });
        test("negative number", () => {
            expect(BigInt.Decimal("-42.5").toString()).toBe("-42.5");
        });
        test("zero", () => {
            expect(BigInt.Decimal("0").toString()).toBe("0");
        });
        test("negative zero becomes zero", () => {
            expect(BigInt.Decimal("-0").toString()).toBe("0");
        });
        test("0.0 normalizes to 0", () => {
            expect(BigInt.Decimal("0.0").toString()).toBe("0");
        });
        test("leading decimal point", () => {
            expect(BigInt.Decimal(".5").toString()).toBe("0.5");
        });
        test("trailing decimal point", () => {
            expect(BigInt.Decimal("5.").toString()).toBe("5");
        });
        test("positive sign", () => {
            expect(BigInt.Decimal("+42").toString()).toBe("42");
        });
        test("underscores in digits", () => {
            expect(BigInt.Decimal("123_456.789").toString()).toBe("123456.789");
        });
        test("exponential notation positive", () => {
            expect(BigInt.Decimal("1.5e2").toString()).toBe("150");
        });
        test("exponential notation negative", () => {
            expect(BigInt.Decimal("150e-2").toString()).toBe("1.5");
        });
        test("exponential notation uppercase E", () => {
            expect(BigInt.Decimal("1E3").toString()).toBe("1000");
        });
    });

    describe("number arguments", () => {
        test("integer", () => {
            expect(BigInt.Decimal(42).toString()).toBe("42");
        });
        test("float", () => {
            expect(BigInt.Decimal(1.5).toString()).toBe("1.5");
        });
        test("-0 becomes 0", () => {
            expect(BigInt.Decimal(-0).toString()).toBe("0");
        });
        test("NaN throws", () => {
            expect(() => BigInt.Decimal(NaN)).toThrow(RangeError);
        });
        test("Infinity throws", () => {
            expect(() => BigInt.Decimal(Infinity)).toThrow(RangeError);
        });
        test("-Infinity throws", () => {
            expect(() => BigInt.Decimal(-Infinity)).toThrow(RangeError);
        });
    });

    describe("bigint arguments", () => {
        test("simple bigint", () => {
            expect(BigInt.Decimal(42n).toString()).toBe("42");
        });
        test("negative bigint", () => {
            expect(BigInt.Decimal(-100n).toString()).toBe("-100");
        });
        test("zero bigint", () => {
            expect(BigInt.Decimal(0n).toString()).toBe("0");
        });
    });

    describe("invalid inputs", () => {
        test("empty string", () => {
            expect(() => BigInt.Decimal("")).toThrow(SyntaxError);
        });
        test("lone dot", () => {
            expect(() => BigInt.Decimal(".")).toThrow(SyntaxError);
        });
        test("nonsense string", () => {
            expect(() => BigInt.Decimal("abc")).toThrow(SyntaxError);
        });
        test("lone minus", () => {
            expect(() => BigInt.Decimal("-")).toThrow(SyntaxError);
        });
        test("NaN string throws", () => {
            expect(() => BigInt.Decimal("NaN")).toThrow(SyntaxError);
        });
        test("Infinity string throws", () => {
            expect(() => BigInt.Decimal("Infinity")).toThrow(SyntaxError);
        });
    });

    describe("scale limit", () => {
        test("100 fraction digits is OK", () => {
            const s = "0." + "1".repeat(100);
            expect(() => BigInt.Decimal(s)).not.toThrow();
        });
        test("more than 100 fraction digits gets rounded", () => {
            const s = "0." + "1".repeat(101);
            const d = BigInt.Decimal(s);
            // Should be rounded to 100 fraction digits
            const parts = d.toString().split(".");
            expect(parts[1].length).toBeLessThanOrEqual(100);
        });
    });
});
