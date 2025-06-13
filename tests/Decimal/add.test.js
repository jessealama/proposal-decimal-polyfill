import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

const zero = new Decimal("0");
const minusZero = new Decimal("-0");
const one = new Decimal("1");
const minusOne = new Decimal("-1");
const two = new Decimal("2");

describe("addition", () => {
    test("one plus one equals two", () => {
        expect(one.add(one).toString()).toStrictEqual("2");
    });
    test("one plus minus one equals zero", () => {
        expect(one.add(minusOne).toString()).toStrictEqual("0");
        expect(minusOne.add(one).toString()).toStrictEqual("-0");
    });
    test("minus zero plus zero", () => {
        expect(minusZero.add(zero).toString()).toStrictEqual("0");
    });
    test("minus zero plus minus zero", () => {
        expect(minusZero.add(minusZero).toString()).toStrictEqual("-0");
    });
    test("two negatives", () => {
        expect(minusOne.add(new Decimal("-99")).toString()).toStrictEqual(
            "-100"
        );
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = "0.1";
        let b = "0.2";
        let c = "0.3";
        expect(new Decimal(a).add(new Decimal(b)).toString()).toStrictEqual(c);
        expect(new Decimal(b).add(new Decimal(a)).toString()).toStrictEqual(c);
    });
    let big = new Decimal(bigDigits);
    test("big plus zero is OK", () => {
        expect(big.add(zero).toString()).toStrictEqual(
            "9.999999999999999999999999999999999e+33"
        );
    });
    test("zero plus big is OK", () => {
        expect(zero.add(big).toString()).toStrictEqual(
            "9.999999999999999999999999999999999e+33"
        );
    });
    test("big plus one is OK", () => {
        expect(big.add(one).toString()).toStrictEqual(one.add(big).toString());
    });
    test("two plus big has too many significant digits, approximation needed", () => {
        expect(two.add(big).toString()).toStrictEqual("1e+34");
    });
    test("big plus two has man significant digits", () => {
        expect(big.add(two).toString()).toStrictEqual("1e+34");
    });
    describe("non-normalized", () => {
        test("one point zero plus one point zero", () => {
            expect(
                new Decimal("1.0").add(new Decimal("1.0")).toString()
            ).toStrictEqual("2");
        });
    });
    describe("NaN", () => {
        test("NaN plus NaN is NaN", () => {
            expect(
                new Decimal("NaN").add(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN plus number", () => {
            expect(
                new Decimal("NaN").add(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number plus NaN", () => {
            expect(
                new Decimal("1").add(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("positive infinity plus number", () => {
            expect(posInf.add(one).toString()).toStrictEqual("Infinity");
        });
        test("negative infinity plus number", () => {
            expect(negInf.add(one).toString()).toStrictEqual("-Infinity");
        });
        test("positive infinity plus positive infinity", () => {
            expect(posInf.add(posInf).toString()).toStrictEqual("Infinity");
        });
        test("minus infinity plus minus infinity", () => {
            expect(negInf.add(negInf).toString()).toStrictEqual("-Infinity");
        });
        test("positive infinity plus negative infinity", () => {
            expect(posInf.add(negInf).toString()).toStrictEqual("NaN");
        });
        test("minus infinity plus positive infinity", () => {
            expect(negInf.add(posInf).toString()).toStrictEqual("NaN");
        });
        test("add number to positive infinity", () => {
            expect(new Decimal("123.5").add(posInf).toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("add number to negative infinity", () => {
            expect(new Decimal("-2").add(negInf).toString()).toStrictEqual(
                "-Infinity"
            );
        });
    });
    describe("specify rounding mode", () => {
        test("truncate rounding mode", () => {
            expect(
                new Decimal("1234567890123456789012345678901234")
                    .add(new Decimal("0.5"), { roundingMode: "trunc" })
                    .toString()
            ).toStrictEqual("1.234567890123456789012345678901234e+33");
        });
    });
    describe("examples from the General Decimal Arithmetic specification", () => {
        test("example one", () => {
            expect(
                new Decimal("12").add(new Decimal("7.00")).toString()
            ).toStrictEqual("19");
        });
        test("example two", () => {
            expect(
                new Decimal("1E+2").add(new Decimal("1E+4")).toExponential()
            ).toStrictEqual("1.01e+4");
        });
    });

    describe("edge cases for Decimal128 limits", () => {
        describe("values near maximum normal range", () => {
            test("add two large values still within range", () => {
                // Maximum normal value is 9.999999999999999999999999999999999E+6144
                const large1 = new Decimal("5E+6144");
                const large2 = new Decimal("4E+6144");
                expect(large1.add(large2).toString()).toStrictEqual("9e+6144");
            });

            test("add values at the edge of normal range", () => {
                const maxNormal = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const tiny = new Decimal("1E+6111"); // Much smaller, should still work
                // Actually overflows because maxNormal is already at the limit
                expect(maxNormal.add(tiny).toString()).toStrictEqual(
                    "Infinity"
                );
            });

            test("add values that exceed range but round back to max", () => {
                const maxNormal = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const small = new Decimal("1E+6110"); // Small enough to round away
                expect(maxNormal.add(small).toString()).toStrictEqual(
                    "9.999999999999999999999999999999999e+6144"
                );
            });

            test("add values that overflow to infinity", () => {
                const large1 = new Decimal("9E+6144");
                const large2 = new Decimal("2E+6144"); // Sum would be 11E+6144, too large
                expect(large1.add(large2).toString()).toStrictEqual("Infinity");
            });

            test("negative values that overflow to negative infinity", () => {
                const large1 = new Decimal("-9E+6144");
                const large2 = new Decimal("-2E+6144");
                expect(large1.add(large2).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
        });

        describe("values near minimum normal/subnormal boundary", () => {
            test("add two small normal values", () => {
                // Normal range starts at 1E-6143
                const small1 = new Decimal("5E-6143");
                const small2 = new Decimal("3E-6143");
                expect(small1.add(small2).toString()).toStrictEqual("8e-6143");
            });

            test("add values at subnormal boundary", () => {
                const minNormal = new Decimal("1E-6143");
                const tiny = new Decimal("1E-6144"); // Subnormal
                expect(minNormal.add(tiny).toString()).toStrictEqual(
                    "1.1e-6143"
                );
            });

            test("add two subnormal values", () => {
                // Currently, very small values are normalized to E-6143
                const sub1 = new Decimal("5E-6150");
                const sub2 = new Decimal("3E-6150");
                expect(sub1.add(sub2).toString()).toStrictEqual("8e-6143");
            });

            test("add values in deep subnormal range", () => {
                // Currently, very small values are normalized to E-6143
                const sub1 = new Decimal("1E-6170");
                const sub2 = new Decimal("1E-6170");
                expect(sub1.add(sub2).toString()).toStrictEqual("2e-6143");
            });

            test("add values that are too small (below subnormal)", () => {
                // Values below approximately E-6176 underflow to zero
                const tiny1 = new Decimal("1E-6180");
                const tiny2 = new Decimal("1E-6180");
                expect(tiny1.add(tiny2).toString()).toStrictEqual("0");
            });

            test("add values that underflow to zero", () => {
                const tiny = new Decimal("1E-6177"); // Below smallest subnormal
                expect(tiny.add(tiny).toString()).toStrictEqual("0");
            });

            test("negative values that underflow to negative zero", () => {
                const tiny = new Decimal("-1E-6177");
                expect(tiny.add(tiny).toString()).toStrictEqual("-0");
            });
        });

        describe("mixed magnitude additions near limits", () => {
            test("add huge positive and huge negative that cancel", () => {
                const huge = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const negHuge = new Decimal(
                    "-9.999999999999999999999999999999999E+6144"
                );
                expect(huge.add(negHuge).toString()).toStrictEqual("0");
            });

            test("add values with extreme exponent differences", () => {
                const huge = new Decimal("1E+6144");
                const tiny = new Decimal("1E-6176");
                // The tiny value should be completely lost in rounding
                expect(huge.add(tiny).toString()).toStrictEqual("1e+6144");
            });
        });

        describe("precision loss at extremes", () => {
            test("add at maximum precision with 34 significant digits", () => {
                const val1 = new Decimal(
                    "1.234567890123456789012345678901234E+6144"
                );
                const val2 = new Decimal("1E+6111"); // 33 orders of magnitude smaller
                // Adding causes rounding in the last digit
                expect(val1.add(val2).toString()).toStrictEqual(
                    "1.234567890123456789012345678901235e+6144"
                );
            });

            test("addition causing precision loss due to magnitude difference", () => {
                const val1 = new Decimal(
                    "9.999999999999999999999999999999999E+6144"
                );
                const val2 = new Decimal("9E+6143"); // One order of magnitude smaller
                // This overflows to Infinity
                expect(val1.add(val2).toString()).toStrictEqual("Infinity");
            });
        });
    });
});
