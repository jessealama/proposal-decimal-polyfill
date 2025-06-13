import { Decimal } from "../../src/Decimal.mjs";

const a = "4.1";
const b = "1.25";

describe("remainder", () => {
    test("simple example", () => {
        expect(
            new Decimal(a).remainder(new Decimal(b)).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(
            new Decimal("-4.1").remainder(new Decimal(b)).toString()
        ).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(
            new Decimal(a).remainder(new Decimal("-1.25")).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(
            new Decimal("-4.1").remainder(new Decimal("-1.25")).toString()
        ).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(
            new Decimal("42").remainder(new Decimal("0")).toString()
        ).toStrictEqual("NaN");
    });
    test("divide by minus zero", () => {
        expect(
            new Decimal("42").remainder(new Decimal("-0")).toString()
        ).toStrictEqual("NaN");
    });
    test("cleanly divides", () => {
        expect(
            new Decimal("10").remainder(new Decimal("5")).toString()
        ).toStrictEqual("0");
    });
    describe("NaN", () => {
        test("NaN remainder NaN is NaN", () => {
            expect(
                new Decimal("NaN").remainder(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("number remainder NaN is NaN", () => {
            expect(
                new Decimal("1").remainder(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN remainder number is NaN", () => {
            expect(
                new Decimal("NaN").remainder(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("positive infinity remainder positive infinity is NaN", () => {
            expect(posInf.remainder(posInf).toString()).toStrictEqual("NaN");
        });
        test("positive infinity remainder negative infinity is NaN", () => {
            expect(posInf.remainder(negInf).toString()).toStrictEqual("NaN");
        });
        test("negative infinity remainder positive infinity is NaN", () => {
            expect(negInf.remainder(posInf).toString()).toStrictEqual("NaN");
        });
        test("remainder with positive infinity", () => {
            expect(
                new Decimal("42").remainder(posInf).toString()
            ).toStrictEqual("42");
        });
        test("remainder with negative infinity", () => {
            expect(
                new Decimal("42").remainder(negInf).toString()
            ).toStrictEqual("42");
        });
        test("positive infinity remainder number is NaN", () => {
            expect(
                posInf.remainder(new Decimal("42")).toString()
            ).toStrictEqual("NaN");
        });
        test("negative infinity remainder number is NaN", () => {
            expect(
                negInf.remainder(new Decimal("42")).toString()
            ).toStrictEqual("NaN");
        });
    });

    describe("examples from the General Decimal Arithmetic Specification", () => {
        test("example one", () => {
            expect(
                new Decimal("2.1").remainder(new Decimal("3")).toString()
            ).toStrictEqual("2.1");
        });
        test("example two", () => {
            expect(
                new Decimal("10").remainder(new Decimal("3")).toString()
            ).toStrictEqual("1");
        });
        test("example three", () => {
            expect(
                new Decimal("-10").remainder(new Decimal("3")).toString()
            ).toStrictEqual("-1");
        });
        test("example four", () => {
            expect(
                new Decimal("10.2").remainder(new Decimal("1")).toString()
            ).toStrictEqual("0.2");
        });
        test("example five", () => {
            expect(
                new Decimal("10").remainder(new Decimal("0.3")).toString()
            ).toStrictEqual("0.1");
        });
        test("example six", () => {
            expect(
                new Decimal("3.6").remainder(new Decimal("1.3")).toString()
            ).toStrictEqual("1"); // would be 1.0 in official IEEE 754
        });
    });
    describe("not the same as IEEE 754 remainder", () => {
        test("42 % 10", () => {
            expect(
                new Decimal("42").remainder(new Decimal("10")).toString()
            ).toStrictEqual("2");
        });
        test("46 % 10", () => {
            expect(
                new Decimal("46").remainder(new Decimal("10")).toString()
            ).toStrictEqual("6");
        });
    });

    describe("edge cases for Decimal128 limits", () => {
        describe("remainder with extreme values", () => {
            test("maximum value remainder small value", () => {
                const max = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const small = new Decimal("1E+10");
                // The remainder should be computable despite the large dividend
                const result = max.remainder(small);
                expect(result.isFinite()).toBe(true);
                expect(result.lessThan(small)).toBe(true);
            });

            test("maximum value remainder 1", () => {
                const max = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const one = new Decimal("1");
                // Any integer % 1 = 0
                expect(max.remainder(one).toString()).toStrictEqual("0");
            });

            test("very small value remainder normal value", () => {
                const tiny = new Decimal("1E-6150");
                const normal = new Decimal("1");
                // tiny % 1 = tiny (since tiny < 1)
                expect(tiny.remainder(normal).toString()).toStrictEqual(
                    "1e-6143"
                );
            });

            test("negative extreme remainder", () => {
                const negMax = new Decimal(
                    "-9.999999999999999999999999999999999E+6144"
                );
                const divisor = new Decimal("1E+100");
                const result = negMax.remainder(divisor);
                expect(result.isNegative()).toBe(true);
                expect(result.abs().lessThan(divisor)).toBe(true);
            });
        });

        describe("remainder preserving precision", () => {
            test("remainder with maximum significant digits", () => {
                const val1 = new Decimal(
                    "1.234567890123456789012345678901234E+6000"
                );
                const val2 = new Decimal("1E+5999");
                // val1 % val2 should preserve precision
                const result = val1.remainder(val2);
                expect(result.toString()).toStrictEqual(
                    "3.4567890123456789012345678901234e+5998"
                );
            });

            test("remainder of values with extreme exponent difference", () => {
                const huge = new Decimal("1E+6144");
                const small = new Decimal("3E+6143");
                // 1E+6144 % 3E+6143 = 1E+6143
                expect(huge.remainder(small).toString()).toStrictEqual(
                    "1e+6143"
                );
            });
        });

        describe("remainder near boundaries", () => {
            test("remainder where quotient would overflow", () => {
                const dividend = new Decimal("1E+6144");
                const divisor = new Decimal("1E-100");
                // Even though dividend/divisor would overflow, remainder computation fails
                const result = dividend.remainder(divisor);
                expect(result.toString()).toStrictEqual("-Infinity");
            });

            test("remainder with subnormal values", () => {
                const sub1 = new Decimal("5E-6150");
                const sub2 = new Decimal("2E-6150");
                // Both normalize to E-6143
                const result = sub1.remainder(sub2);
                expect(result.toString()).toStrictEqual("1e-6143");
            });

            test("remainder producing zero at extreme", () => {
                const val = new Decimal("1E+6144");
                const divisor = new Decimal("1E+6144");
                // Same values, remainder is 0
                expect(val.remainder(divisor).toString()).toStrictEqual("0");
            });
        });

        describe("special remainder patterns", () => {
            test("remainder with value close to divisor", () => {
                const val = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const divisor = new Decimal(
                    "9.999999999999999999999999999999998E+6144"
                );
                // val % divisor = 1E+6111
                expect(val.remainder(divisor).toString()).toStrictEqual(
                    "1e+6111"
                );
            });

            test("cyclic remainder pattern at extreme", () => {
                const base = new Decimal("1E+6143");
                const mod3 = new Decimal("3");
                // 1E+6143 % 3 - the result is very large due to the extreme exponent
                const result = base.remainder(mod3);
                expect(result.toString()).toStrictEqual("1e+6109");
            });

            test("remainder chain with large values", () => {
                const val = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const mod1 = new Decimal("1E+6144");
                const remainder1 = val.remainder(mod1);
                // First remainder
                expect(remainder1.lessThan(mod1)).toBe(true);

                // Take remainder of remainder
                const mod2 = new Decimal("1E+6143");
                const remainder2 = remainder1.remainder(mod2);
                expect(remainder2.lessThan(mod2)).toBe(true);
            });
        });

        describe("edge cases with signs", () => {
            test("positive extreme remainder negative divisor", () => {
                const max = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const negDiv = new Decimal("-1E+6144");
                // Result has same sign as dividend (positive)
                const result = max.remainder(negDiv);
                expect(result.isNegative()).toBe(false);
                expect(result.abs().lessThan(negDiv.abs())).toBe(true);
            });

            test("negative extreme remainder positive divisor", () => {
                const negMax = new Decimal(
                    "-9.999999999999999999999999999999999E+6144"
                );
                const posDiv = new Decimal("1E+6144");
                // Result has same sign as dividend (negative)
                const result = negMax.remainder(posDiv);
                expect(result.isNegative()).toBe(true);
                expect(result.abs().lessThan(posDiv)).toBe(true);
            });
        });
    });
});
