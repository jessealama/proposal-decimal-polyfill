import { Decimal } from "../../src/Decimal.mjs";
import { expectDecimal128 } from "./util.js";

const MAX_SIGNIFICANT_DIGITS = 34;
let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("subtract", () => {
    test("subtract decimal part", () => {
        expectDecimal128(
            new Decimal("123.456").subtract(new Decimal("0.456")),
            "123"
        );
    });
    test("minus negative number", () => {
        expectDecimal128(
            new Decimal("0.1").subtract(new Decimal("-0.2")),
            "0.3"
        );
    });
    test("subtract two negatives", () => {
        expectDecimal128(
            new Decimal("-1.9").subtract(new Decimal("-2.7")),
            "0.8"
        );
    });
    const big = new Decimal(bigDigits);
    test("close to range limit", () => {
        expectDecimal128(
            big.subtract(new Decimal("9")),
            "9.99999999999999999999999999999999e+33"
        );
    });
    test("large subtraction does not overflow, but does get apporoximated", () => {
        let a = new Decimal("-" + bigDigits);
        let b = new Decimal("9");
        expect(a.subtract(b).toString()).toStrictEqual(
            "-1.000000000000000000000000000000001e+34"
        );
    });
    describe("NaN", () => {
        test("NaN minus NaN is NaN", () => {
            expect(
                new Decimal("NaN").subtract(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN minus number", () => {
            expect(
                new Decimal("NaN").subtract(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number minus NaN", () => {
            expect(
                new Decimal("1").subtract(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("zero", () => {
        let d = new Decimal("42.65");
        let zero = new Decimal("0");
        test("difference is zero", () => {
            expect(d.subtract(d).toString()).toStrictEqual("0");
        });
        test("subtracting zero", () => {
            expect(d.subtract(zero).toString()).toStrictEqual("42.65");
        });
        test("subtracting zero", () => {
            expect(zero.subtract(d).toString()).toStrictEqual("-42.65");
        });
    });
    describe("minus zero", () => {
        let x = new Decimal("42.54");
        let minusZero = new Decimal("-0");
        test("subtracting minus zero", () => {
            expect(x.subtract(minusZero).toString()).toStrictEqual("42.54");
        });
    });

    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        describe("first argument", () => {
            describe("positive infinity", () => {
                test("positive number", () => {
                    expect(
                        posInf.subtract(new Decimal("1")).toString()
                    ).toStrictEqual("Infinity");
                });
                test("negative number", () => {
                    expect(
                        posInf.subtract(new Decimal("-1")).toString()
                    ).toStrictEqual("Infinity");
                });
                test("positive infinity", () => {
                    expect(posInf.subtract(posInf).toString()).toStrictEqual(
                        "NaN"
                    );
                });
                test("negative infinity", () => {
                    expect(posInf.subtract(negInf).toString()).toStrictEqual(
                        "Infinity"
                    );
                });
            });
            describe("negative infinity", () => {
                test("positive number", () => {
                    expect(
                        negInf.subtract(new Decimal("1")).toString()
                    ).toStrictEqual("-Infinity");
                });
                test("negative number", () => {
                    expect(
                        negInf.subtract(new Decimal("-1")).toString()
                    ).toStrictEqual("-Infinity");
                });
                test("positive infinity", () => {
                    expect(negInf.subtract(posInf).toString()).toStrictEqual(
                        "-Infinity"
                    );
                });
                test("negative infinity", () => {
                    expect(negInf.subtract(negInf).toString()).toStrictEqual(
                        "NaN"
                    );
                });
            });
        });
        describe("second argument", () => {
            describe("positive infinity", () => {
                test("finite", () => {
                    expect(
                        new Decimal("42").subtract(posInf).toString()
                    ).toStrictEqual("-Infinity");
                });
                test("positive infinity", () => {
                    expect(posInf.subtract(posInf).toString()).toStrictEqual(
                        "NaN"
                    );
                });
                test("negative infinity", () => {
                    expect(posInf.subtract(negInf).toString()).toStrictEqual(
                        "Infinity"
                    );
                });
            });
            describe("negative infinity", () => {
                test("finite", () => {
                    expect(
                        new Decimal("42").subtract(negInf).toString()
                    ).toStrictEqual("Infinity");
                });
                test("positive infinity", () => {
                    expect(negInf.subtract(posInf).toString()).toStrictEqual(
                        "-Infinity"
                    );
                });
                test("negative infinity", () => {
                    expect(negInf.subtract(negInf).toString()).toStrictEqual(
                        "NaN"
                    );
                });
            });
        });
    });

    describe("examples from the General Decimal Arithmetic specification", () => {
        test("example one", () => {
            expect(
                new Decimal("1.3").subtract(new Decimal("1.07")).toString()
            ).toStrictEqual("0.23");
        });
        test("example two", () => {
            expect(
                new Decimal("1.3").subtract(new Decimal("1.30")).toString()
            ).toStrictEqual("0"); // would be 0.00 in official IEEE 754
        });
        test("example three", () => {
            expect(
                new Decimal("1.3").subtract(new Decimal("2.07")).toString()
            ).toStrictEqual("-0.77");
        });
    });

    describe("edge cases for Decimal128 limits", () => {
        describe("values near maximum normal range", () => {
            test("subtract large values that stay within range", () => {
                const large1 = new Decimal("9E+6144");
                const large2 = new Decimal("3E+6144");
                expect(large1.subtract(large2).toString()).toStrictEqual(
                    "6e+6144"
                );
            });

            test("subtract from maximum value", () => {
                const maxNormal = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const small = new Decimal("1E+6111");
                // Subtraction causes rounding
                expect(maxNormal.subtract(small).toString()).toStrictEqual(
                    "9.999999999999999999999999999999998e+6144"
                );
            });

            test("subtract negative from positive near max causes overflow", () => {
                const largePos = new Decimal("8E+6144");
                const largeNeg = new Decimal("-5E+6144");
                // 8E+6144 - (-5E+6144) = 13E+6144, which overflows
                expect(largePos.subtract(largeNeg).toString()).toStrictEqual(
                    "Infinity"
                );
            });

            test("subtract positive from negative near min causes negative overflow", () => {
                const largeNeg = new Decimal("-8E+6144");
                const largePos = new Decimal("5E+6144");
                // -8E+6144 - 5E+6144 = -13E+6144, which overflows
                expect(largeNeg.subtract(largePos).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
        });

        describe("values near minimum normal/subnormal boundary", () => {
            test("subtract small normal values", () => {
                const small1 = new Decimal("8E-6143");
                const small2 = new Decimal("3E-6143");
                expect(small1.subtract(small2).toString()).toStrictEqual(
                    "5e-6143"
                );
            });

            test("subtract causing cancellation near subnormal boundary", () => {
                const val1 = new Decimal(
                    "1.000000000000000000000000000000001E-6143"
                );
                const val2 = new Decimal("1E-6143");
                // Result is 1E-6176, which normalizes to E-6143
                expect(val1.subtract(val2).toString()).toStrictEqual("1e-6143");
            });

            test("subtract subnormal values", () => {
                const sub1 = new Decimal("8E-6150");
                const sub2 = new Decimal("3E-6150");
                // Currently normalized to E-6143
                expect(sub1.subtract(sub2).toString()).toStrictEqual("5e-6143");
            });

            test("subtraction resulting in underflow", () => {
                const tiny = new Decimal("1E-6180");
                // Both underflow to zero, result is -0 because second operand determines sign
                expect(tiny.subtract(tiny).toString()).toStrictEqual("-0");

                // Different tiny values - both underflow to 0, so 0 - 0 = -0
                const tiny1 = new Decimal("2E-6180");
                const tiny2 = new Decimal("1E-6180");
                expect(tiny1.subtract(tiny2).toString()).toStrictEqual("-0");
            });
        });

        describe("cancellation and precision loss", () => {
            test("near-complete cancellation of large values", () => {
                const val1 = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const val2 = new Decimal(
                    "9.999999999999999999999999999999998E+6144"
                );
                expect(val1.subtract(val2).toString()).toStrictEqual("1e+6111");
            });

            test("exact cancellation at maximum magnitude", () => {
                const max = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                expect(max.subtract(max).toString()).toStrictEqual("0");
            });

            test("cancellation with different signs", () => {
                const largePos = new Decimal("5E+6144");
                const largeNeg = new Decimal("-5E+6144");
                // 5E+6144 - (-5E+6144) = 10E+6144, which overflows to Infinity
                expect(largePos.subtract(largeNeg).toString()).toStrictEqual(
                    "Infinity"
                );
            });
        });

        describe("extreme exponent differences", () => {
            test("subtract tiny from huge", () => {
                const huge = new Decimal("1E+6144");
                const tiny = new Decimal("1E-6176");
                // Tiny value lost in rounding
                expect(huge.subtract(tiny).toString()).toStrictEqual("1e+6144");
            });

            test("subtract huge from tiny", () => {
                const tiny = new Decimal("1E-6176");
                const huge = new Decimal("1E+6144");
                // Result dominated by -huge
                expect(tiny.subtract(huge).toString()).toStrictEqual(
                    "-1e+6144"
                );
            });
        });

        describe("rounding modes at extremes", () => {
            test("subtraction with truncate rounding", () => {
                const val1 = new Decimal(
                    "1.234567890123456789012345678901234E+6144"
                );
                const val2 = new Decimal("1E+6110");
                expect(
                    val1.subtract(val2, { roundingMode: "trunc" }).toString()
                ).toStrictEqual("1.234567890123456789012345678901233e+6144");
            });

            test("subtraction with ceiling rounding near overflow", () => {
                const val1 = new Decimal(
                    "9.999999999999999999999999999999998E+6144"
                );
                const val2 = new Decimal("-1E+6111");
                // With ceiling rounding, might round up to max or overflow
                expect(
                    val1.subtract(val2, { roundingMode: "ceil" }).toString()
                ).toStrictEqual("9.999999999999999999999999999999999e+6144");
            });
        });
    });
});
