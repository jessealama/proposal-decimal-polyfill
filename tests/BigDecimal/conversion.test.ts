import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal conversions", () => {
    describe("toBigInt", () => {
        test("integer value", () => {
            expect(BigInt.Decimal("42").toBigInt()).toBe(42n);
        });
        test("negative integer", () => {
            expect(BigInt.Decimal("-100").toBigInt()).toBe(-100n);
        });
        test("zero", () => {
            expect(BigInt.Decimal("0").toBigInt()).toBe(0n);
        });
        test("non-integer throws", () => {
            expect(() => BigInt.Decimal("1.5").toBigInt()).toThrow(RangeError);
        });
        test("integer with .0 works", () => {
            expect(BigInt.Decimal("42.0").toBigInt()).toBe(42n);
        });
    });

    describe("toNumber", () => {
        test("integer", () => {
            expect(BigInt.Decimal("42").toNumber()).toBe(42);
        });
        test("decimal", () => {
            expect(BigInt.Decimal("1.5").toNumber()).toBe(1.5);
        });
        test("negative", () => {
            expect(BigInt.Decimal("-3.14").toNumber()).toBeCloseTo(-3.14);
        });
        test("zero", () => {
            expect(BigInt.Decimal("0").toNumber()).toBe(0);
        });
    });

    describe("valueOf", () => {
        test("throws TypeError", () => {
            expect(() => BigInt.Decimal("42").valueOf()).toThrow(TypeError);
        });
    });
});
