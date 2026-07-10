import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";
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
            expect(
                new Decimal("42.345").round({ digits: 2 }).toString()
            ).toStrictEqual("42.34");
        });
        test("more digits than are available", () => {
            expect(
                new Decimal("1.5").round({ digits: 1 }).toString()
            ).toStrictEqual("1.5");
        });
        test("negative odd", () => {
            expect(
                new Decimal("-1.5").round({ digits: 1 }).toString()
            ).toStrictEqual("-1.5");
        });
        test("round down (positive)", () => {
            expect(
                new Decimal("1.1").round({ digits: 6 }).toString()
            ).toStrictEqual("1.1");
        });
    });
    test("integer", () => {
        expect(new Decimal("42").round().toString()).toStrictEqual("42");
    });
    test("negative integer", () => {
        expect(new Decimal("-42").round().toString()).toStrictEqual("-42");
    });
    test("negative number of digits requested throws", () => {
        expect(() => new Decimal("1.5").round({ digits: -42 })).toThrow(
            RangeError
        );
        expect(() => new Decimal("1.5").round({ digits: -42 })).toThrow(
            "digits must be non-negative"
        );
    });
    test("too many digits requested", () => {
        expect(() => new Decimal("1.5").round({ digits: 2 ** 53 })).toThrow(
            RangeError
        );
        expect(() => new Decimal("1.5").round({ digits: 2 ** 53 })).toThrow(
            "Too many digits requested"
        );
    });
    test("round to zero", () => {
        expect(
            new Decimal("0.5")
                .round({ digits: 0, roundingMode: "trunc" })
                .toString()
        ).toStrictEqual("0");
    });
    test("round to minus zero", () => {
        expect(
            new Decimal("-0.5")
                .round({ digits: 0, roundingMode: "trunc" })
                .toString()
        ).toStrictEqual("-0");
    });

    describe("unsupported rounding mode", () => {
        test("throws", () => {
            expect(() =>
                new Decimal("1.5").round({ digits: 0, roundingMode: "foobar" })
            ).toThrow(RangeError);
            expect(() =>
                new Decimal("1.5").round({ digits: 0, roundingMode: "foobar" })
            ).toThrow('Invalid rounding mode "foobar"');
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
                    minusOnePointFive
                        .round({ digits: 0, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("-1");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour
                        .round({ digits: 0, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("1");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive
                        .round({ digits: 0, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("1");
            });
            test("0.6", () => {
                expect(
                    zeroPointSix
                        .round({ digits: 0, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("1");
            });
            test("1.5", () => {
                expect(
                    onePointFive
                        .round({ digits: 0, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("2");
            });
        });
        describe("floor", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive
                        .round({ digits: 0, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("-2");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour
                        .round({ digits: 0, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive
                        .round({ digits: 0, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("0.6", () => {
                expect(
                    zeroPointSix
                        .round({ digits: 0, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("1.5", () => {
                expect(
                    onePointFive
                        .round({ digits: 0, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("1");
            });
        });
        describe("trunc", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive
                        .round({ digits: 0, roundingMode: "trunc" })
                        .toString()
                ).toStrictEqual("-1");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour
                        .round({ digits: 0, roundingMode: "trunc" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive
                        .round({ digits: 0, roundingMode: "trunc" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("0.6", () => {
                expect(
                    zeroPointSix
                        .round({ digits: 0, roundingMode: "trunc" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("1.5", () => {
                expect(
                    onePointFive
                        .round({ digits: 0, roundingMode: "trunc" })
                        .toString()
                ).toStrictEqual("1");
            });
        });
        describe("halfExpand", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive
                        .round({ digits: 0, roundingMode: "halfExpand" })
                        .toString()
                ).toStrictEqual("-2");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour
                        .round({ digits: 0, roundingMode: "halfExpand" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive
                        .round({ digits: 0, roundingMode: "halfExpand" })
                        .toString()
                ).toStrictEqual("1");
            });
            test("0.6", () => {
                expect(
                    zeroPointSix
                        .round({ digits: 0, roundingMode: "halfExpand" })
                        .toString()
                ).toStrictEqual("1");
            });
            test("1.5", () => {
                expect(
                    onePointFive
                        .round({ digits: 0, roundingMode: "halfExpand" })
                        .toString()
                ).toStrictEqual("2");
            });
        });
        describe("halfEven", () => {
            test("-1.5", () => {
                expect(
                    minusOnePointFive
                        .round({ digits: 0, roundingMode: "halfEven" })
                        .toString()
                ).toStrictEqual("-2");
            });
            test("0.4", () => {
                expect(
                    zeroPointFour
                        .round({ digits: 0, roundingMode: "halfEven" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("0.5", () => {
                expect(
                    zeroPointFive
                        .round({ digits: 0, roundingMode: "halfEven" })
                        .toString()
                ).toStrictEqual("0");
            });
            test("0.6", () => {
                expect(
                    zeroPointSix
                        .round({ digits: 0, roundingMode: "halfEven" })
                        .toString()
                ).toStrictEqual("1");
            });
            test("1.5", () => {
                expect(
                    onePointFive
                        .round({ digits: 0, roundingMode: "halfEven" })
                        .toString()
                ).toStrictEqual("2");
            });
        });
        test("NaN", () => {
            expect(NAN.round().toString()).toStrictEqual("NaN");
        });
        describe("infinity", () => {
            let posInf = POSITIVE_INFINITY;
            let negInf = NEGATIVE_INFINITY;
            test(`positive infinity (no argument)`, () => {
                expect(posInf.round().toString()).toStrictEqual("Infinity");
            });
            for (let roundingMode of ROUNDING_MODES) {
                test(`positive infinity (${roundingMode})`, () => {
                    expect(
                        posInf
                            .round({ digits: 0, roundingMode: roundingMode })
                            .toString()
                    ).toStrictEqual("Infinity");
                });
            }
            test(`negative infinity (no argument)`, () => {
                expect(negInf.round().toString()).toStrictEqual("-Infinity");
            });
            for (let roundingMode of ROUNDING_MODES) {
                test(`negative infinity (${roundingMode})`, () => {
                    expect(
                        negInf
                            .round({ digits: 0, roundingMode: roundingMode })
                            .toString()
                    ).toStrictEqual("-Infinity");
                });
            }
            test("rounding positive a certain number of digits makes no difference", () => {
                expect(posInf.round({ digits: 2 }).toString()).toStrictEqual(
                    "Infinity"
                );
            });
            test("rounding negative infinity a certain number of digits makes no difference", () => {
                expect(negInf.round({ digits: 2 }).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
        });
    });

    describe("ceiling", function () {
        test("ceiling works (positive)", () => {
            expect(
                new Decimal("123.456")
                    .round({ digits: 0, roundingMode: "ceil" })
                    .toString()
            ).toStrictEqual("124");
        });
        test("ceiling works (negative)", () => {
            expect(
                new Decimal("-123.456")
                    .round({ digits: 0, roundingMode: "ceil" })
                    .toString()
            ).toStrictEqual("-123");
        });
        test("ceiling of an integer is unchanged", () => {
            expect(
                new Decimal("123")
                    .round({ digits: 0, roundingMode: "ceil" })
                    .toString()
            ).toStrictEqual("123");
        });
        test("NaN", () => {
            expect(
                NAN.round({ digits: 0, roundingMode: "ceil" }).toString()
            ).toStrictEqual("NaN");
        });
        test("positive infinity", () => {
            expect(
                POSITIVE_INFINITY.round({
                    digits: 0,
                    roundingMode: "ceil",
                }).toString()
            ).toStrictEqual("Infinity");
        });
        test("minus infinity", () => {
            expect(
                NEGATIVE_INFINITY.round({
                    digits: 0,
                    roundingMode: "ceil",
                }).toString()
            ).toStrictEqual("-Infinity");
        });
    });

    describe("truncate", () => {
        describe("truncate", () => {
            test("123.45678", () => {
                expectDecimal128(
                    new Decimal("123.45678").round({
                        digits: 0,
                        roundingMode: "trunc",
                    }),
                    "123"
                );
            });
            test("-42.99", () => {
                expectDecimal128(
                    new Decimal("-42.99").round({
                        digits: 0,
                        roundingMode: "trunc",
                    }),
                    "-42"
                );
            });
            test("0.00765", () => {
                expectDecimal128(
                    new Decimal("0.00765").round({
                        digits: 0,
                        roundingMode: "trunc",
                    }),
                    "0"
                );
            });
            test("NaN", () => {
                expect(
                    NAN.round({ digits: 0, roundingMode: "trunc" }).toString()
                ).toStrictEqual("NaN");
            });
        });

        describe("infinity", () => {
            test("positive infinity", () => {
                expect(
                    POSITIVE_INFINITY.round({
                        digits: 0,
                        roundingMode: "trunc",
                    }).toString()
                ).toStrictEqual("Infinity");
            });
            test("negative infinity", () => {
                expect(
                    NEGATIVE_INFINITY.round({
                        digits: 0,
                        roundingMode: "trunc",
                    }).toString()
                ).toStrictEqual("-Infinity");
            });
        });
    });

    describe("floor", function () {
        test("floor works (positive)", () => {
            expect(
                new Decimal("123.456")
                    .round({ digits: 0, roundingMode: "floor" })
                    .toString()
            ).toStrictEqual("123");
        });
        test("floor works (negative)", () => {
            expect(
                new Decimal("-123.456")
                    .round({ digits: 0, roundingMode: "floor" })
                    .toString()
            ).toStrictEqual("-124");
        });
        test("floor of integer is unchanged", () => {
            expect(
                new Decimal("123")
                    .round({ digits: 0, roundingMode: "floor" })
                    .toString()
            ).toStrictEqual("123");
        });
        test("floor of zero is unchanged", () => {
            expect(
                POSITIVE_ZERO.round({
                    digits: 0,
                    roundingMode: "floor",
                }).toString()
            ).toStrictEqual("0");
        });
        test("NaN", () => {
            expect(
                NAN.round({ digits: 0, roundingMode: "floor" }).toString()
            ).toStrictEqual("NaN");
        });
        test("positive infinity", () => {
            expect(
                POSITIVE_INFINITY.round({
                    digits: 0,
                    roundingMode: "floor",
                }).toString()
            ).toStrictEqual("Infinity");
        });
        test("minus infinity", () => {
            expect(
                NEGATIVE_INFINITY.round({
                    digits: 0,
                    roundingMode: "floor",
                }).toString()
            ).toStrictEqual("-Infinity");
        });
    });

    describe("examples for TC39 plenary slides", () => {
        let a = new Decimal("1.456");
        test("round to 2 decimal places, rounding mode is ceiling", () => {
            expect(
                a.round({ digits: 2, roundingMode: "ceil" }).toString()
            ).toStrictEqual("1.46");
        });
        test("round to 1 decimal place, rounding mode unspecified", () => {
            expect(a.round({ digits: 1 }).toString()).toStrictEqual("1.5");
            expect(
                a.round({ digits: 1, roundingMode: "halfEven" }).toString()
            ).toStrictEqual("1.5");
        });
        test("round to 0 decimal places, rounding mode is floor", () => {
            expect(
                a.round({ digits: 0, roundingMode: "floor" }).toString()
            ).toStrictEqual("1");
        });
    });

    describe("halfEven ties whose even neighbor ends in a trailing zero", () => {
        test("10.5 rounds down to 10", () => {
            expect(
                new Decimal("10.5")
                    .round({ digits: 0, roundingMode: "halfEven" })
                    .toString()
            ).toStrictEqual("10");
        });
        test("-10.5 rounds up to -10", () => {
            expect(
                new Decimal("-10.5")
                    .round({ digits: 0, roundingMode: "halfEven" })
                    .toString()
            ).toStrictEqual("-10");
        });
        test("1.05 rounds down to 1.0 at one decimal place", () => {
            expect(
                new Decimal("1.05")
                    .round({ digits: 1, roundingMode: "halfEven" })
                    .toString()
            ).toStrictEqual("1");
        });
        test("10.5 rounds down to 10 under the default mode", () => {
            expect(
                new Decimal("10.5").round({ digits: 0 }).toString()
            ).toStrictEqual("10");
        });
        test("30.5 rounds down to 30", () => {
            expect(
                new Decimal("30.5")
                    .round({ digits: 0, roundingMode: "halfEven" })
                    .toString()
            ).toStrictEqual("30");
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
                expect(
                    nearMax
                        .round({ digits: 30, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("9.999999999999999999999999999999999e+6144");
            });

            test("round minimum normal value", () => {
                const minNormal = new Decimal("1E-6143");
                // Rounding to 0 decimals truncates to 0
                expect(minNormal.round({ digits: 0 }).toString()).toStrictEqual(
                    "0"
                );
                // But with many decimals preserves the value
                expect(
                    minNormal.round({ digits: 6143 }).toString()
                ).toStrictEqual("1e-6143");
            });

            test("round subnormal values", () => {
                const subnormal = new Decimal("1E-6150");
                // Currently normalizes to E-6143 but rounding to 6143 decimals gives 0
                expect(
                    subnormal.round({ digits: 6143 }).toString()
                ).toStrictEqual("0");
            });
        });

        describe("precision preservation at extremes", () => {
            test("round with 34 significant digits near max", () => {
                const val = new Decimal(
                    "1.234567890123456789012345678901234E+6144"
                );
                // Rounding to 30 decimal places (which don't exist at this magnitude)
                expect(val.round({ digits: 30 }).toString()).toStrictEqual(
                    "1.234567890123456789012345678901234e+6144"
                );
            });

            test("round very small value with many decimal places", () => {
                const tiny = new Decimal(
                    "1.234567890123456789012345678901234E-6143"
                );
                // Round to 6140 decimal places - underflows to 0
                expect(tiny.round({ digits: 6140 }).toString()).toStrictEqual(
                    "0"
                );
            });
        });

        describe("rounding modes at boundaries", () => {
            test("floor rounding near zero boundary", () => {
                const tiny = new Decimal("9E-6144");
                expect(
                    tiny
                        .round({ digits: 6143, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("0");
            });

            test("ceiling rounding near zero boundary", () => {
                const tiny = new Decimal("1E-6144");
                expect(
                    tiny
                        .round({ digits: 6143, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("1e-6143");
            });

            test("halfEven rounding at extreme", () => {
                const val = new Decimal("5.5E+6143");
                // Large values don't have fractional parts at this magnitude
                expect(
                    val
                        .round({ digits: 0, roundingMode: "halfEven" })
                        .toString()
                ).toStrictEqual("5.5e+6143");

                const val2 = new Decimal("4.5E+6143");
                expect(
                    val2
                        .round({ digits: 0, roundingMode: "halfEven" })
                        .toString()
                ).toStrictEqual("4.5e+6143");
            });

            test("truncate at maximum", () => {
                const max = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                expect(
                    max.round({ digits: 0, roundingMode: "trunc" }).toString()
                ).toStrictEqual("9.999999999999999999999999999999999e+6144");
            });
        });

        describe("rounding with extreme decimal places", () => {
            test("round to very large number of decimal places", () => {
                const val = new Decimal("1.23456789");
                expect(val.round({ digits: 9999 }).toString()).toStrictEqual(
                    "1.23456789"
                );
            });

            test("round extreme value to many decimal places", () => {
                const extreme = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                // Cannot have decimal places at this magnitude
                expect(extreme.round({ digits: 100 }).toString()).toStrictEqual(
                    "9.999999999999999999999999999999999e+6144"
                );
            });

            test("round with maximum allowed decimal places", () => {
                const val = new Decimal("1.5");
                expect(val.round({ digits: 10000 }).toString()).toStrictEqual(
                    "1.5"
                );
            });
        });

        describe("special rounding cases", () => {
            test("round negative zero", () => {
                const negZero = NEGATIVE_ZERO;
                expect(negZero.round().toString()).toStrictEqual("-0");
                expect(negZero.round({ digits: 5 }).toString()).toStrictEqual(
                    "-0"
                );
            });

            test("round value that becomes zero", () => {
                const tiny = new Decimal("0.00001");
                expect(tiny.round({ digits: 4 }).toString()).toStrictEqual("0");

                const negTiny = new Decimal("-0.00001");
                expect(negTiny.round({ digits: 4 }).toString()).toStrictEqual(
                    "-0"
                );
            });

            test("round at the edge of representable precision", () => {
                // Value with 34 significant digits
                const precise = new Decimal(
                    "1.234567890123456789012345678901234"
                );
                // Round to 33 decimal places
                expect(precise.round({ digits: 33 }).toString()).toStrictEqual(
                    "1.234567890123456789012345678901234"
                );
                // Round to 32 decimal places - loses last digit
                expect(precise.round({ digits: 32 }).toString()).toStrictEqual(
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
                expect(
                    nearMax
                        .round({ digits: 0, roundingMode: "ceil" })
                        .toString()
                ).toStrictEqual("9.999999999999999999999999999999999e+6144");
            });

            test("round can cause underflow to zero", () => {
                const verySmall = new Decimal("4.99999E-6144");
                // Floor rounding to integer underflows to 0
                expect(
                    verySmall
                        .round({ digits: 0, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("0");
            });

            test("round preserves sign when underflowing", () => {
                const negSmall = new Decimal("-4.99999E-6144");
                // Floor rounding to integer gives -1
                expect(
                    negSmall
                        .round({ digits: 0, roundingMode: "floor" })
                        .toString()
                ).toStrictEqual("-1");
            });
        });
    });
});

describe("options bag validation", () => {
    let d = new Decimal("1.25");
    test("positional number argument throws TypeError", () => {
        expect(() => d.round(2)).toThrow(TypeError);
    });
    test("positional digits-and-mode arguments throw TypeError", () => {
        expect(() => d.round(2, "ceil")).toThrow(TypeError);
    });
    test("null options throws TypeError", () => {
        expect(() => d.round(null)).toThrow(TypeError);
    });
    test("string options throws TypeError", () => {
        expect(() => d.round("ceil")).toThrow(TypeError);
    });
    test("non-number digits throws TypeError", () => {
        expect(() => d.round({ digits: "2" })).toThrow(TypeError);
    });
    test("NaN digits throws RangeError", () => {
        expect(() => d.round({ digits: NaN })).toThrow(RangeError);
    });
    test("infinite digits throws RangeError", () => {
        expect(() => d.round({ digits: Infinity })).toThrow(RangeError);
    });
    test("non-integer digits throws RangeError", () => {
        expect(() => d.round({ digits: 1.5 })).toThrow(RangeError);
    });
    test("negative digits throws RangeError", () => {
        expect(() => d.round({ digits: -1 })).toThrow(RangeError);
    });
    test("too many digits throws RangeError", () => {
        expect(() => d.round({ digits: 10001 })).toThrow(RangeError);
    });
    test("non-string roundingMode throws TypeError", () => {
        expect(() => d.round({ roundingMode: 42 })).toThrow(TypeError);
    });
    test("invalid roundingMode string throws RangeError", () => {
        expect(() => d.round({ roundingMode: "bogus" })).toThrow(RangeError);
    });
    test("unknown keys are ignored", () => {
        expect(d.round({ digitz: 0 }).toString()).toStrictEqual("1");
    });
    test("bag with only roundingMode rounds to zero fractional digits", () => {
        expect(d.round({ roundingMode: "ceil" }).toString()).toStrictEqual("2");
    });
});
