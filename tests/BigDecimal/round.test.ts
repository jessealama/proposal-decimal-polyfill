import "../../src/BigDecimal.mjs";

describe("BigInt.Decimal.round", () => {
    test("round to 0 fraction digits (default)", () => {
        expect(BigInt.Decimal.round(BigInt.Decimal("1.5")).toString()).toBe(
            "2"
        );
    });
    test("round to 2 fraction digits", () => {
        expect(
            BigInt.Decimal.round(BigInt.Decimal("1.255"), 2).toString()
        ).toBe("1.26");
    });
    test("already at target precision", () => {
        expect(BigInt.Decimal.round(BigInt.Decimal("1.25"), 2).toString()).toBe(
            "1.25"
        );
    });
    test("round negative", () => {
        expect(BigInt.Decimal.round(BigInt.Decimal("-1.5")).toString()).toBe(
            "-2"
        );
    });
    test("round zero", () => {
        expect(BigInt.Decimal.round(BigInt.Decimal("0")).toString()).toBe("0");
    });

    describe("rounding modes", () => {
        test("ceil rounds up positive", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("1.1"),
                    0,
                    "ceil"
                ).toString()
            ).toBe("2");
        });
        test("ceil rounds toward zero for negative", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("-1.1"),
                    0,
                    "ceil"
                ).toString()
            ).toBe("-1");
        });
        test("floor rounds down positive", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("1.9"),
                    0,
                    "floor"
                ).toString()
            ).toBe("1");
        });
        test("floor rounds away from zero for negative", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("-1.1"),
                    0,
                    "floor"
                ).toString()
            ).toBe("-2");
        });
        test("trunc rounds toward zero", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("1.9"),
                    0,
                    "trunc"
                ).toString()
            ).toBe("1");
        });
        test("trunc rounds toward zero for negative", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("-1.9"),
                    0,
                    "trunc"
                ).toString()
            ).toBe("-1");
        });
        test("halfEven rounds to even on tie", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("2.5"),
                    0,
                    "halfEven"
                ).toString()
            ).toBe("2");
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("3.5"),
                    0,
                    "halfEven"
                ).toString()
            ).toBe("4");
        });
        test("halfExpand always rounds away from zero on tie", () => {
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("2.5"),
                    0,
                    "halfExpand"
                ).toString()
            ).toBe("3");
            expect(
                BigInt.Decimal.round(
                    BigInt.Decimal("3.5"),
                    0,
                    "halfExpand"
                ).toString()
            ).toBe("4");
        });
    });

    describe("invalid arguments", () => {
        test("negative fractionDigits throws", () => {
            expect(() => BigInt.Decimal.round(BigInt.Decimal("1"), -1)).toThrow(
                RangeError
            );
        });
        test("invalid rounding mode throws", () => {
            expect(() =>
                BigInt.Decimal.round(BigInt.Decimal("1"), 0, "bad" as any)
            ).toThrow(RangeError);
        });
    });
});
