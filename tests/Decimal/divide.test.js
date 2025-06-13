import { Decimal } from "../../src/Decimal.mjs";

describe("division", () => {
    test("simple example", () => {
        expect(
            new Decimal("4.1").divide(new Decimal("1.25")).toString()
        ).toStrictEqual("3.28");
    });
    test("finite decimal representation", () => {
        expect(
            new Decimal("0.654").divide(new Decimal("0.12")).toString()
        ).toStrictEqual("5.45");
    });
    test("infinite decimal representation", () => {
        expect(
            new Decimal("0.11")
                .divide(new Decimal("0.3"))
                .toFixed({ digits: Infinity })
        ).toStrictEqual("0.3666666666666666666666666666666667");
    });
    test("many digits, few significant", () => {
        expect(
            new Decimal("0.00000000000000000000000000000000000001")
                .divide(new Decimal("2"))
                .toString()
        ).toStrictEqual("5e-39");
    });
    test("one third", () => {
        expect(
            new Decimal("1")
                .divide(new Decimal("3"))
                .toFixed({ digits: Infinity })
        ).toStrictEqual("0.3333333333333333333333333333333333");
    });
    test("one tenth", () => {
        expect(
            new Decimal("1").divide(new Decimal("10")).toString()
        ).toStrictEqual("0.1");
    });
    test("zero divided by zero", () => {
        expect(
            new Decimal("0").divide(new Decimal("0")).toString()
        ).toStrictEqual("NaN");
    });
    describe("NaN", () => {
        test("NaN divided by NaN is NaN", () => {
            expect(
                new Decimal("NaN").divide(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN divided by number is NaN", () => {
            expect(
                new Decimal("NaN").divide(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number divided by NaN is NaN", () => {
            expect(
                new Decimal("1").divide(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("divide by zero is NaN", () => {
            expect(
                new Decimal("42").divide(new Decimal("0")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("infinity divided by infinity is NaN", () => {
            expect(posInf.divide(posInf).toString()).toStrictEqual("NaN");
        });
        test("infinity divided by negative infinity is NaN", () => {
            expect(posInf.divide(negInf).toString()).toStrictEqual("NaN");
        });
        test("negative infinity divided by infinity is NaN", () => {
            expect(negInf.divide(posInf).toString()).toStrictEqual("NaN");
        });
        test("negative infinity divided by positive infinity is NaN", () => {
            expect(negInf.divide(posInf).toString()).toStrictEqual("NaN");
        });
        test("positive infinity divided by positive number", () => {
            expect(
                posInf.divide(new Decimal("123.5")).toString()
            ).toStrictEqual("Infinity");
        });
        test("positive infinity divided by negative number", () => {
            expect(posInf.divide(new Decimal("-2")).toString()).toStrictEqual(
                "-Infinity"
            );
        });
        test("minus infinity divided by positive number", () => {
            expect(negInf.divide(new Decimal("17")).toString()).toStrictEqual(
                "-Infinity"
            );
        });
        test("minus infinity divided by negative number", () => {
            expect(
                negInf.divide(new Decimal("-99.3")).toString()
            ).toStrictEqual("Infinity");
        });
        test("positive number divided bv positive infinity", () => {
            expect(
                new Decimal("123.5").divide(posInf).toString()
            ).toStrictEqual("0");
        });
        test("positive number divided bv negative infinity", () => {
            expect(
                new Decimal("123.5").divide(negInf).toString()
            ).toStrictEqual("-0");
        });
        test("negative number divided by positive infinity", () => {
            expect(new Decimal("-2").divide(posInf).toString()).toStrictEqual(
                "-0"
            );
        });
        test("negative number divided by negative infinity", () => {
            expect(new Decimal("-2").divide(negInf).toString()).toStrictEqual(
                "0"
            );
        });
    });
    test("negative zero", () => {
        expect(
            new Decimal("-0").divide(new Decimal("1")).toString()
        ).toStrictEqual("-0");
    });
    test("negative argument", () => {
        expect(
            new Decimal("42.6").divide(new Decimal("-2.0")).toString()
        ).toStrictEqual("-21.3");
    });
    test("dividend and divisor are both negative", () => {
        expect(
            new Decimal("-42.6").divide(new Decimal("-2.0")).toString()
        ).toStrictEqual("21.3");
    });

    describe("examples from the General Decimal Arithmetic Specification", () => {
        // some examples have been tweaked because we are working with more precision in Decimal128
        test("example one", () => {
            expect(
                new Decimal("1")
                    .divide(new Decimal("3"))
                    .toFixed({ digits: Infinity })
            ).toStrictEqual("0.3333333333333333333333333333333333");
        });
        test("example two", () => {
            expect(
                new Decimal("2")
                    .divide(new Decimal("3"))
                    .toFixed({ digits: Infinity })
            ).toStrictEqual("0.6666666666666666666666666666666667");
        });
        test("example three", () => {
            expect(
                new Decimal("5").divide(new Decimal("2")).toString()
            ).toStrictEqual("2.5");
        });
        test("example four", () => {
            expect(
                new Decimal("1").divide(new Decimal("10")).toString()
            ).toStrictEqual("0.1");
        });
        test("example five", () => {
            expect(
                new Decimal("12").divide(new Decimal("12")).toString()
            ).toStrictEqual("1");
        });
        test("example six", () => {
            expect(
                new Decimal("8.00").divide(new Decimal("2")).toString()
            ).toStrictEqual("4");
        });
        test("example seven", () => {
            expect(
                new Decimal("2.400").divide(new Decimal("2.0")).toString()
            ).toStrictEqual("1.2"); // would be 1.20 in official IEEE 754
        });
        test("example eight", () => {
            expect(
                new Decimal("1000").divide(new Decimal("100")).toString()
            ).toStrictEqual("10");
        });
        test("example nine", () => {
            expect(
                new Decimal("1000").divide(new Decimal("1")).toString()
            ).toStrictEqual("1000");
        });
        test("example ten", () => {
            expect(
                new Decimal("2.40E+6").divide(new Decimal("2")).toExponential()
            ).toStrictEqual("1.2e+6");
        });
    });
    
    describe("edge cases for Decimal128 limits", () => {
        describe("division causing overflow", () => {
            test("divide large value by small value overflows", () => {
                const large = new Decimal("1E+6144");
                const small = new Decimal("1E-10");
                // 1E+6144 / 1E-10 = 1E+6154, which overflows
                expect(large.divide(small).toString()).toStrictEqual("Infinity");
            });
            
            test("divide maximum by tiny value", () => {
                const max = new Decimal("9.999999999999999999999999999999999E+6144");
                const tiny = new Decimal("1E-100");
                // Would produce approximately 1E+6244
                expect(max.divide(tiny).toString()).toStrictEqual("Infinity");
            });
            
            test("divide near overflow boundary", () => {
                const dividend = new Decimal("1E+6140");
                const divisor = new Decimal("1E-5");
                // 1E+6140 / 1E-5 = 1E+6145, which overflows
                expect(dividend.divide(divisor).toString()).toStrictEqual("Infinity");
            });
            
            test("negative overflow in division", () => {
                const large = new Decimal("-5E+6144");
                const small = new Decimal("1E-10");
                expect(large.divide(small).toString()).toStrictEqual("-Infinity");
            });
        });
        
        describe("division causing underflow", () => {
            test("divide small by large underflows to zero", () => {
                const small = new Decimal("1E-6100");
                const large = new Decimal("1E+100");
                // 1E-6100 / 1E+100 = 1E-6200, which underflows
                expect(small.divide(large).toString()).toStrictEqual("0");
            });
            
            test("divide at underflow boundary", () => {
                const small = new Decimal("1E-6143");
                const large = new Decimal("1E+34");
                // 1E-6143 / 1E+34 = 1E-6177, which underflows
                expect(small.divide(large).toString()).toStrictEqual("0");
            });
            
            test("divide subnormal by normal", () => {
                const subnormal = new Decimal("1E-6150");
                const normal = new Decimal("10");
                // Result normalizes to E-6143
                expect(subnormal.divide(normal).toString()).toStrictEqual("1e-6143");
            });
            
            test("negative underflow to negative zero", () => {
                const small = new Decimal("-1E-6100");
                const large = new Decimal("1E+100");
                expect(small.divide(large).toString()).toStrictEqual("-0");
            });
        });
        
        describe("extreme quotients", () => {
            test("maximum divided by minimum", () => {
                const max = new Decimal("9.999999999999999999999999999999999E+6144");
                const min = new Decimal("1E-6176");
                // Would produce approximately 1E+6321, massive overflow
                expect(max.divide(min).toString()).toStrictEqual("Infinity");
            });
            
            test("minimum divided by maximum", () => {
                const min = new Decimal("1E-6176");
                const max = new Decimal("9.999999999999999999999999999999999E+6144");
                // Would produce approximately 1E-6321, massive underflow
                expect(min.divide(max).toString()).toStrictEqual("0");
            });
            
            test("divide values with extreme exponent difference", () => {
                const val1 = new Decimal("1E+3000");
                const val2 = new Decimal("1E-3000");
                // 1E+3000 / 1E-3000 = 1E+6000, still within range
                expect(val1.divide(val2).toString()).toStrictEqual("1e+6000");
            });
        });
        
        describe("precision at extremes", () => {
            test("divide with full precision near max", () => {
                const dividend = new Decimal("9.999999999999999999999999999999999E+6144");
                const divisor = new Decimal("3.333333333333333333333333333333333");
                // Should maintain precision
                expect(dividend.divide(divisor).toString()).toStrictEqual("3e+6144");
            });
            
            test("divide maintaining 34 significant digits", () => {
                const val1 = new Decimal("1.234567890123456789012345678901234E+6000");
                const val2 = new Decimal("1.111111111111111111111111111111111E+100");
                // Should preserve significant digits
                expect(val1.divide(val2).toString()).toStrictEqual("1.111111101111111110111111111011111e+5900");
            });
            
            test("division creating repeating decimal at extreme", () => {
                const val1 = new Decimal("1E+6144");
                const val2 = new Decimal("3");
                // 1E+6144 / 3 = 3.333...E+6143
                expect(val1.divide(val2).toString()).toStrictEqual("3.333333333333333333333333333333333e+6143");
            });
        });
        
        describe("special division patterns", () => {
            test("divide by values very close to 1", () => {
                const max = new Decimal("9.999999999999999999999999999999999E+6144");
                const nearOne = new Decimal("1.000000000000000000000000000000001");
                // Should be very close to max
                expect(max.divide(nearOne).toString()).toStrictEqual("9.999999999999999999999999999999989e+6144");
            });
            
            test("reciprocal of maximum value", () => {
                const max = new Decimal("9.999999999999999999999999999999999E+6144");
                const one = new Decimal("1");
                // 1 / max normalizes to 1E-6143
                expect(one.divide(max).toString()).toStrictEqual("1e-6143");
            });
            
            test("reciprocal of minimum normal", () => {
                const minNormal = new Decimal("1E-6143");
                const one = new Decimal("1");
                // 1 / 1E-6143 = 1E+6143
                expect(one.divide(minNormal).toString()).toStrictEqual("1e+6143");
            });
            
            test("self-division at extremes", () => {
                const extreme = new Decimal("9.999999999999999999999999999999999E+6144");
                expect(extreme.divide(extreme).toString()).toStrictEqual("1");
            });
        });
        
        describe("rounding modes at extremes", () => {
            test("division with truncate rounding", () => {
                const val1 = new Decimal("9.999999999999999999999999999999999E+6144");
                const val2 = new Decimal("3");
                expect(val1.divide(val2, { roundingMode: "trunc" }).toString())
                    .toStrictEqual("3.333333333333333333333333333333333e+6144");
            });
            
            test("division with ceiling rounding near overflow", () => {
                const val1 = new Decimal("3E+6144");
                const val2 = new Decimal("0.3");
                // 3E+6144 / 0.3 = 1E+6145, which overflows
                expect(val1.divide(val2, { roundingMode: "ceil" }).toString())
                    .toStrictEqual("Infinity");
            });
            
            test("division with floor rounding", () => {
                const val1 = new Decimal("1E+6144");
                const val2 = new Decimal("3");
                expect(val1.divide(val2, { roundingMode: "floor" }).toString())
                    .toStrictEqual("3.333333333333333333333333333333333e+6143");
            });
        });
    });
});
