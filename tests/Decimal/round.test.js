import { Decimal } from "../../src/Decimal.mjs";
import { expectDecimal128 } from "./util.js";

const ROUNDING_MODE_CEILING = "ceil";
const ROUNDING_MODE_FLOOR = "floor";
const ROUNDING_MODE_TRUNCATE = "trunc";
const ROUNDING_MODE_HALF_EVEN = "halfEven";
const ROUNDING_MODE_HALF_EXPAND = "halfExpand";

const ROUNDING_MODES = [
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
    ROUNDING_MODE_TRUNCATE,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODE_HALF_EXPAND,
];

describe("round", () => {
    describe("no arguments (round to integer)", () => {
        test("positive odd", () => {
            expect(new Decimal("1.5").round().toString()).toStrictEqual("2");
        });
        test("positive even", () => {
            expect(new Decimal("2.5").round().toString()).toStrictEqual("2");
        });
        test("round up (positive)", () => {
            expect(new Decimal("2.6").round().toString()).toStrictEqual("3");
        });
        test("round up (negative)", () => {
            expect(new Decimal("-2.6").round().toString()).toStrictEqual("-3");
        });
        test("negative odd", () => {
            expect(new Decimal("-1.5").round().toString()).toStrictEqual("-2");
        });
        test("negative even", () => {
            expect(new Decimal("-2.5").round().toString()).toStrictEqual("-2");
        });
        test("round down (positive)", () => {
            expect(new Decimal("1.1").round().toString()).toStrictEqual("1");
        });
    });
    describe("round after a certain number of decimal digits", () => {
        test("multiple digits", () => {
            expect(new Decimal("42.345").round(2).toString()).toStrictEqual(
                "42.34"
            );
        });
        test("more digits than are available", () => {
            expect(new Decimal("1.5").round(1).toString()).toStrictEqual("1.5");
        });
        test("negative odd", () => {
            expect(new Decimal("-1.5").round(1).toString()).toStrictEqual(
                "-1.5"
            );
        });
        test("round down (positive)", () => {
            expect(new Decimal("1.1").round(6).toString()).toStrictEqual("1.1");
        });
    });
    test("integer", () => {
        expect(new Decimal("42").round().toString()).toStrictEqual("42");
    });
    test("negative integer", () => {
        expect(new Decimal("-42").round().toString()).toStrictEqual("-42");
    });
    test("negative number of digits requested is truncation", () => {
        expect(() => new Decimal("1.5").round(-42)).toThrow(RangeError);
    });
    test("too many digits requested", () => {
        expect(() => new Decimal("1.5").round(2 ** 53)).toThrow(RangeError);
    });
    test("round to zero", () => {
        expect(new Decimal("0.5").round(0, "trunc").toString()).toStrictEqual(
            "0"
        );
    });
    test("round to minus zero", () => {
        expect(new Decimal("-0.5").round(0, "trunc").toString()).toStrictEqual(
            "-0"
        );
    });

    describe("unsupported rounding mode", () => {
        test("throws", () => {
            expect(() => new Decimal("1.5").round(0, "foobar")).toThrow(
                RangeError
            );
        });
    });

    describe("Intl.NumberFormat examples", () => {
        let minusOnePointFive = new Decimal("-1.5");
        let zeroPointFour = new Decimal("0.4");
        let zeroPointFive = new Decimal("0.5");
        let zeroPointSix = new Decimal("0.6");
        let onePointFive = new Decimal("1.5");
        describe("ceil", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive.round(0, "ceil").toString()
                ).toStrictEqual("-1");
            });
            test("0.4", () => {
                expect(zeroPointFour.round(0, "ceil").toString()).toStrictEqual(
                    "1"
                );
            });
            test("0.5", () => {
                expect(zeroPointFive.round(0, "ceil").toString()).toStrictEqual(
                    "1"
                );
            });
            test("0.6", () => {
                expect(zeroPointSix.round(0, "ceil").toString()).toStrictEqual(
                    "1"
                );
            });
            test("1.5", () => {
                expect(onePointFive.round(0, "ceil").toString()).toStrictEqual(
                    "2"
                );
            });
        });
        describe("floor", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive.round(0, "floor").toString()
                ).toStrictEqual("-2");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour.round(0, "floor").toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive.round(0, "floor").toString()
                ).toStrictEqual("0");
            });
            test("0.6", () => {
                expect(zeroPointSix.round(0, "floor").toString()).toStrictEqual(
                    "0"
                );
            });
            test("1.5", () => {
                expect(onePointFive.round(0, "floor").toString()).toStrictEqual(
                    "1"
                );
            });
        });
        describe("trunc", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive.round(0, "trunc").toString()
                ).toStrictEqual("-1");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour.round(0, "trunc").toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive.round(0, "trunc").toString()
                ).toStrictEqual("0");
            });
            test("0.6", () => {
                expect(zeroPointSix.round(0, "trunc").toString()).toStrictEqual(
                    "0"
                );
            });
            test("1.5", () => {
                expect(onePointFive.round(0, "trunc").toString()).toStrictEqual(
                    "1"
                );
            });
        });
        describe("halfExpand", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive.round(0, "halfExpand").toString()
                ).toStrictEqual("-2");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour.round(0, "halfExpand").toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive.round(0, "halfExpand").toString()
                ).toStrictEqual("1");
            });
            test("0.6", () => {
                expect(
                    zeroPointSix.round(0, "halfExpand").toString()
                ).toStrictEqual("1");
            });
            test("1.5", () => {
                expect(
                    onePointFive.round(0, "halfExpand").toString()
                ).toStrictEqual("2");
            });
        });
        describe("halfEven", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive.round(0, "halfEven").toString()
                ).toStrictEqual("-2");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour.round(0, "halfEven").toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive.round(0, "halfEven").toString()
                ).toStrictEqual("0");
            });
            test("0.6", () => {
                expect(
                    zeroPointSix.round(0, "halfEven").toString()
                ).toStrictEqual("1");
            });
            test("1.5", () => {
                expect(
                    onePointFive.round(0, "halfEven").toString()
                ).toStrictEqual("2");
            });
        });
        test("NaN", () => {
            expect(new Decimal("NaN").round().toString()).toStrictEqual("NaN");
        });
        describe("infinity", () => {
            let posInf = new Decimal("Infinity");
            let negInf = new Decimal("-Infinity");
            test(`positive infinity (no argument)`, () => {
                expect(posInf.round().toString()).toStrictEqual("Infinity");
            });
            for (let roundingMode of ROUNDING_MODES) {
                test(`positive infinity (${roundingMode})`, () => {
                    expect(
                        posInf.round(0, roundingMode).toString()
                    ).toStrictEqual("Infinity");
                });
            }
            test(`negative infinity (no argument)`, () => {
                expect(negInf.round().toString()).toStrictEqual("-Infinity");
            });
            for (let roundingMode of ROUNDING_MODES) {
                test(`negative infinity (${roundingMode})`, () => {
                    expect(
                        negInf.round(0, roundingMode).toString()
                    ).toStrictEqual("-Infinity");
                });
            }
            test("rounding positive a certain number of digits makes no difference", () => {
                expect(posInf.round(2).toString()).toStrictEqual("Infinity");
            });
            test("rounding negative infinity a certain number of digits makes no difference", () => {
                expect(negInf.round(2).toString()).toStrictEqual("-Infinity");
            });
        });
    });

    describe("ceiling", function () {
        test("ceiling works (positive)", () => {
            expect(
                new Decimal("123.456").round(0, "ceil").toString()
            ).toStrictEqual("124");
        });
        test("ceiling works (negative)", () => {
            expect(
                new Decimal("-123.456").round(0, "ceil").toString()
            ).toStrictEqual("-123");
        });
        test("ceiling of an integer is unchanged", () => {
            expect(
                new Decimal("123").round(0, "ceil").toString()
            ).toStrictEqual("123");
        });
        test("NaN", () => {
            expect(
                new Decimal("NaN").round(0, "ceil").toString()
            ).toStrictEqual("NaN");
        });
        test("positive infinity", () => {
            expect(
                new Decimal("Infinity").round(0, "ceil").toString()
            ).toStrictEqual("Infinity");
        });
        test("minus infinity", () => {
            expect(
                new Decimal("-Infinity").round(0, "ceil").toString()
            ).toStrictEqual("-Infinity");
        });
    });

    describe("truncate", () => {
        describe("truncate", () => {
            test("123.45678", () => {
                expectDecimal128(
                    new Decimal("123.45678").round(0, "trunc"),
                    "123"
                );
            });
            test("-42.99", () => {
                expectDecimal128(
                    new Decimal("-42.99").round(0, "trunc"),
                    "-42"
                );
            });
            test("0.00765", () => {
                expectDecimal128(new Decimal("0.00765").round(0, "trunc"), "0");
            });
            test("NaN", () => {
                expect(
                    new Decimal("NaN").round(0, "trunc").toString()
                ).toStrictEqual("NaN");
            });
        });

        describe("infinity", () => {
            test("positive infinity", () => {
                expect(
                    new Decimal("Infinity").round(0, "trunc").toString()
                ).toStrictEqual("Infinity");
            });
            test("negative infinity", () => {
                expect(
                    new Decimal("-Infinity").round(0, "trunc").toString()
                ).toStrictEqual("-Infinity");
            });
        });
    });

    describe("floor", function () {
        test("floor works (positive)", () => {
            expect(
                new Decimal("123.456").round(0, "floor").toString()
            ).toStrictEqual("123");
        });
        test("floor works (negative)", () => {
            expect(
                new Decimal("-123.456").round(0, "floor").toString()
            ).toStrictEqual("-124");
        });
        test("floor of integer is unchanged", () => {
            expect(
                new Decimal("123").round(0, "floor").toString()
            ).toStrictEqual("123");
        });
        test("floor of zero is unchanged", () => {
            expect(new Decimal("0").round(0, "floor").toString()).toStrictEqual(
                "0"
            );
        });
        test("NaN", () => {
            expect(
                new Decimal("NaN").round(0, "floor").toString()
            ).toStrictEqual("NaN");
        });
        test("positive infinity", () => {
            expect(
                new Decimal("Infinity").round(0, "floor").toString()
            ).toStrictEqual("Infinity");
        });
        test("minus infinity", () => {
            expect(
                new Decimal("-Infinity").round(0, "floor").toString()
            ).toStrictEqual("-Infinity");
        });
    });

    describe("examples for TC39 plenary slides", () => {
        let a = new Decimal("1.456");
        test("round to 2 decimal places, rounding mode is ceiling", () => {
            expect(a.round(2, "ceil").toString()).toStrictEqual("1.46");
        });
        test("round to 1 decimal place, rounding mode unspecified", () => {
            expect(a.round(1).toString()).toStrictEqual("1.5");
            expect(a.round(1, "halfEven").toString()).toStrictEqual("1.5");
        });
        test("round to 0 decimal places, rounding mode is floor", () => {
            expect(a.round(0, "floor").toString()).toStrictEqual("1");
        });
    });

    describe("edge cases for Decimal128 limits", () => {
        describe("rounding at extreme values", () => {
            test("round maximum value", () => {
                const max = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                // Rounding to integer should maintain the value
                expect(max.round().toString()).toStrictEqual(
                    "9.999999999999999999999999999999999e+6144"
                );
            });

            test("round value that would overflow with ceiling", () => {
                const nearMax = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                // Rounding with ceiling when already at max
                expect(nearMax.round(30, "ceil").toString()).toStrictEqual(
                    "9.999999999999999999999999999999999e+6144"
                );
            });

            test("round minimum normal value", () => {
                const minNormal = new Decimal("1E-6143");
                // Rounding to 0 decimals truncates to 0
                expect(minNormal.round(0).toString()).toStrictEqual("0");
                // But with many decimals preserves the value
                expect(minNormal.round(6143).toString()).toStrictEqual(
                    "1e-6143"
                );
            });

            test("round subnormal values", () => {
                const subnormal = new Decimal("1E-6150");
                // Currently normalizes to E-6143 but rounding to 6143 decimals gives 0
                expect(subnormal.round(6143).toString()).toStrictEqual("0");
            });
        });

        describe("precision preservation at extremes", () => {
            test("round with 34 significant digits near max", () => {
                const val = new Decimal(
                    "1.234567890123456789012345678901234E+6144"
                );
                // Rounding to 30 decimal places (which don't exist at this magnitude)
                expect(val.round(30).toString()).toStrictEqual(
                    "1.234567890123456789012345678901234e+6144"
                );
            });

            test("round very small value with many decimal places", () => {
                const tiny = new Decimal(
                    "1.234567890123456789012345678901234E-6143"
                );
                // Round to 6140 decimal places - underflows to 0
                expect(tiny.round(6140).toString()).toStrictEqual("0");
            });
        });

        describe("rounding modes at boundaries", () => {
            test("floor rounding near zero boundary", () => {
                const tiny = new Decimal("9E-6144");
                expect(tiny.round(6143, "floor").toString()).toStrictEqual("0");
            });

            test("ceiling rounding near zero boundary", () => {
                const tiny = new Decimal("1E-6144");
                expect(tiny.round(6143, "ceil").toString()).toStrictEqual(
                    "1e-6143"
                );
            });

            test("halfEven rounding at extreme", () => {
                const val = new Decimal("5.5E+6143");
                // Large values don't have fractional parts at this magnitude
                expect(val.round(0, "halfEven").toString()).toStrictEqual(
                    "5.5e+6143"
                );

                const val2 = new Decimal("4.5E+6143");
                expect(val2.round(0, "halfEven").toString()).toStrictEqual(
                    "4.5e+6143"
                );
            });

            test("truncate at maximum", () => {
                const max = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                expect(max.round(0, "trunc").toString()).toStrictEqual(
                    "9.999999999999999999999999999999999e+6144"
                );
            });
        });

        describe("rounding with extreme decimal places", () => {
            test("round to very large number of decimal places", () => {
                const val = new Decimal("1.23456789");
                // Rounding to 1000000 decimal places
                expect(val.round(1000000).toString()).toStrictEqual(
                    "1.23456789"
                );
            });

            test("round extreme value to many decimal places", () => {
                const extreme = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                // Cannot have decimal places at this magnitude
                expect(extreme.round(100).toString()).toStrictEqual(
                    "9.999999999999999999999999999999999e+6144"
                );
            });

            test("round with maximum allowed decimal places", () => {
                const val = new Decimal("1.5");
                // Test with very large but valid number
                expect(val.round(1e9).toString()).toStrictEqual("1.5");
            });
        });

        describe("special rounding cases", () => {
            test("round negative zero", () => {
                const negZero = new Decimal("-0");
                expect(negZero.round().toString()).toStrictEqual("-0");
                expect(negZero.round(5).toString()).toStrictEqual("-0");
            });

            test("round value that becomes zero", () => {
                const tiny = new Decimal("0.00001");
                expect(tiny.round(4).toString()).toStrictEqual("0");

                const negTiny = new Decimal("-0.00001");
                expect(negTiny.round(4).toString()).toStrictEqual("-0");
            });

            test("round at the edge of representable precision", () => {
                // Value with 34 significant digits
                const precise = new Decimal(
                    "1.234567890123456789012345678901234"
                );
                // Round to 33 decimal places
                expect(precise.round(33).toString()).toStrictEqual(
                    "1.234567890123456789012345678901234"
                );
                // Round to 32 decimal places - loses last digit
                expect(precise.round(32).toString()).toStrictEqual(
                    "1.23456789012345678901234567890123"
                );
            });
        });

        describe("rounding near overflow/underflow", () => {
            test("round doesn't cause overflow", () => {
                const nearMax = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                // Even with ceiling, stays at max
                expect(nearMax.round(0, "ceil").toString()).toStrictEqual(
                    "9.999999999999999999999999999999999e+6144"
                );
            });

            test("round can cause underflow to zero", () => {
                const verySmall = new Decimal("4.99999E-6144");
                // Floor rounding to integer underflows to 0
                expect(verySmall.round(0, "floor").toString()).toStrictEqual(
                    "0"
                );
            });

            test("round preserves sign when underflowing", () => {
                const negSmall = new Decimal("-4.99999E-6144");
                // Floor rounding to integer gives -1
                expect(negSmall.round(0, "floor").toString()).toStrictEqual(
                    "-1"
                );
            });
        });
    });
});
