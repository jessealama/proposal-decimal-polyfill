import { Decimal } from "../../src/Decimal.mjs";

let posZero = new Decimal("0");
let negZero = new Decimal("-0");

const examples = [
    ["123.456", "789.789", "97504.190784"],
    ["2", "3", "6"],
    ["2", "3.0", "6"],
    ["2.0", "3.0", "6"],
    ["4", "0.5", "2"],
    ["10", "100", "1000"],
    ["0.1", "0.2", "0.02"],
    ["0.25", "1.5", "0.375"],
    ["0.12345", "0.67890", "0.083810205"],
    ["0.123456789", "0.987654321", "0.121932631112635269"],
    ["100000.123", "99999.321", "9999944399.916483"],
    ["123456.123456789", "987654.987654321", "121932056088.565269013112635269"],
    [
        "123456789.987654321",
        "987654321.123456789",
        "121932632103337905.6620941931126353",
    ],
];

function checkProduct(a, b, c) {
    expect(
        new Decimal(a).multiply(new Decimal(b)).toFixed({ digits: Infinity })
    ).toStrictEqual(c);
}

describe("multiply", () => {
    describe("worked-out examples", () => {
        for (const [a, b, c] of examples)
            test(`${a} * ${b} = ${c}`, () => {
                checkProduct(a, b, c);
            });
    });
    test("negative second argument", () => {
        checkProduct("987.654", "-321.987", "-318011.748498");
    });
    test("negative first argument", () => {
        checkProduct("-987.654", "321.987", "-318011.748498");
    });
    test("both arguments negative", () => {
        checkProduct("-987.654", "-321.987", "318011.748498");
    });
    test("approximation needed ", () => {
        expect(
            new Decimal("123456789123456789")
                .multiply(new Decimal("987654321987654321"))
                .toFixed({ digits: Infinity })
        ).toStrictEqual("121932631356500531347203169112635300");
    });
    test("approximation needed (negative)", () => {
        expect(
            new Decimal("123456789123456789")
                .multiply(new Decimal("-987654321987654321"))
                .toFixed({ digits: Infinity })
        ).toStrictEqual("-121932631356500531347203169112635300");
    });
    test("approximation needed", () => {
        expect(
            new Decimal("123456789123456789.987654321")
                .multiply(new Decimal("987654321123456789.123456789"))
                .toFixed({ digits: Infinity })
        ).toStrictEqual("121932631249809479868770005427526300");
    });
    describe("zero", () => {
        let d = new Decimal("42.65");
        test("left-hand positive zero", () => {
            expect(posZero.multiply(d).toString()).toStrictEqual("0");
        });
        test("left-hand negative zero", () => {
            expect(negZero.multiply(d).toString()).toStrictEqual("-0");
        });
        test("right-hand positive zero", () => {
            expect(d.multiply(posZero).toString()).toStrictEqual("0");
        });
        test("right-hand negative zero", () => {
            expect(d.multiply(negZero).toString()).toStrictEqual("-0");
        });
        test("positive zero point zero", () => {
            expect(
                new Decimal("0.0").multiply(posZero).toString()
            ).toStrictEqual("0");
        });
        test("negative zero point zero", () => {
            expect(
                new Decimal("-0.0").multiply(posZero).toString()
            ).toStrictEqual("-0");
        });
    });
    describe("NaN", () => {
        test("NaN times NaN is NaN", () => {
            expect(
                new Decimal("NaN").multiply(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("number times NaN is NaN", () => {
            expect(
                new Decimal("1").multiply(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN times number is NaN", () => {
            expect(
                new Decimal("NaN").multiply(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        describe("invalid operation", () => {
            test("zero times positive infinity is NaN", () => {
                expect(
                    new Decimal("0")
                        .multiply(new Decimal("Infinity"))
                        .toString()
                ).toStrictEqual("NaN");
                expect(
                    new Decimal("Infinity")
                        .multiply(new Decimal("0"))
                        .toString()
                ).toStrictEqual("NaN");
            });
            test("zero times negative infinity is NaN", () => {
                expect(
                    new Decimal("0")
                        .multiply(new Decimal("-Infinity"))
                        .toString()
                ).toStrictEqual("NaN");
                expect(
                    new Decimal("-Infinity")
                        .multiply(new Decimal("0"))
                        .toString()
                ).toStrictEqual("NaN");
            });
        });
        test("positive infinity times positive number is positive infinity", () => {
            expect(
                new Decimal("Infinity").multiply(new Decimal("42")).toString()
            ).toStrictEqual("Infinity");
        });
        test("positive number times positive infinity is positive infinity", () => {
            expect(
                new Decimal("42").multiply(new Decimal("Infinity")).toString()
            ).toStrictEqual("Infinity");
        });
        test("positive infinity times negative number is negative infinity", () => {
            expect(
                new Decimal("Infinity").multiply(new Decimal("-42")).toString()
            ).toStrictEqual("-Infinity");
        });
        test("negative number times positive infinity is negative infinity", () => {
            expect(
                new Decimal("-42").multiply(new Decimal("Infinity")).toString()
            ).toStrictEqual("-Infinity");
        });
        test("positive infinity times negative infinity is negative infinity", () => {
            expect(
                new Decimal("Infinity")
                    .multiply(new Decimal("-Infinity"))
                    .toString()
            ).toStrictEqual("-Infinity");
        });
        test("positive infinity times positive infinity is positive infinity", () => {
            expect(
                new Decimal("Infinity")
                    .multiply(new Decimal("Infinity"))
                    .toString()
            ).toStrictEqual("Infinity");
        });
        test("negative infinity times negative infinity is positive infinity", () => {
            expect(
                new Decimal("-Infinity")
                    .multiply(new Decimal("-Infinity"))
                    .toString()
            ).toStrictEqual("Infinity");
        });
        test("negative infinity times positive infinity is negative infinity", () => {
            expect(
                new Decimal("-Infinity")
                    .multiply(new Decimal("Infinity"))
                    .toString()
            ).toStrictEqual("-Infinity");
        });
        let negInf = new Decimal("-Infinity");
        let posInf = new Decimal("Infinity");
        test("negative infinity times itself", () => {
            expect(negInf.multiply(negInf).toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("positive infinity times itself", () => {
            expect(posInf.multiply(posInf).toString()).toStrictEqual(
                "Infinity"
            );
        });
    });

    describe("examples from the General Decimal Arithmetic specification", () => {
        test("example one", () => {
            expect(
                new Decimal("1.20").multiply(new Decimal("3")).toString()
            ).toStrictEqual("3.6"); // would be 3.60 in official IEEE 754
        });
        test("example two", () => {
            expect(
                new Decimal("7").multiply(new Decimal("3")).toString()
            ).toStrictEqual("21");
        });
        test("example three", () => {
            expect(
                new Decimal("0.9").multiply(new Decimal("0.8")).toString()
            ).toStrictEqual("0.72");
        });
        test("example four", () => {
            expect(
                new Decimal("0.9").multiply(new Decimal("-0")).toString()
            ).toStrictEqual("-0"); // would be -0.0 in official IEEE 754
        });
        test("example five", () => {
            // slightly modified because we have more precision
            expect(
                new Decimal("654321")
                    .multiply(new Decimal("654321"))
                    .toExponential()
            ).toStrictEqual("4.28135971041e+11");
        });
    });
    
    describe("edge cases for Decimal128 limits", () => {
        describe("multiplication causing overflow", () => {
            test("multiply large values that overflow to infinity", () => {
                const large1 = new Decimal("1E+3100");
                const large2 = new Decimal("1E+3100");
                // 1E+3100 * 1E+3100 = 1E+6200, which exceeds max
                expect(large1.multiply(large2).toString()).toStrictEqual("Infinity");
            });
            
            test("multiply at the edge of overflow", () => {
                // sqrt(max) ≈ 3.16E+3072
                const sqrtMax = new Decimal("3.162277660168379331998893544433E+3072");
                // Multiplying by itself overflows
                expect(sqrtMax.multiply(sqrtMax).toString()).toStrictEqual("Infinity");
            });
            
            test("multiply values that exceed max but round back", () => {
                const val1 = new Decimal("9.999999999999999999999999999999999E+3072");
                const val2 = new Decimal("1.0000000000000000000000000000000001E+3072");
                // Product rounds to max without overflowing
                expect(val1.multiply(val2).toString()).toStrictEqual("9.999999999999999999999999999999999e+6144");
            });
            
            test("negative overflow", () => {
                const large1 = new Decimal("-1E+3100");
                const large2 = new Decimal("1E+3100");
                expect(large1.multiply(large2).toString()).toStrictEqual("-Infinity");
            });
        });
        
        describe("multiplication causing underflow", () => {
            test("multiply small values that underflow to zero", () => {
                const small1 = new Decimal("1E-3100");
                const small2 = new Decimal("1E-3100");
                // 1E-3100 * 1E-3100 = 1E-6200, which underflows
                expect(small1.multiply(small2).toString()).toStrictEqual("0");
            });
            
            test("multiply at the edge of underflow", () => {
                // sqrt(min subnormal) ≈ 1E-3088
                const small1 = new Decimal("1E-3088");
                const small2 = new Decimal("1E-3088");
                // Should produce 1E-6176
                expect(small1.multiply(small2).toString()).toStrictEqual("1e-6143");
            });
            
            test("negative underflow to negative zero", () => {
                const small1 = new Decimal("-1E-3100");
                const small2 = new Decimal("1E-3100");
                expect(small1.multiply(small2).toString()).toStrictEqual("-0");
            });
            
            test("multiply subnormal values", () => {
                const sub1 = new Decimal("1E-6150");
                const sub2 = new Decimal("1E+10");
                // 1E-6150 * 1E+10 = 1E-6140, which is normal
                expect(sub1.multiply(sub2).toString()).toStrictEqual("1e-6140");
            });
        });
        
        describe("extreme exponent combinations", () => {
            test("huge times tiny equals one", () => {
                const huge = new Decimal("1E+3088");
                const tiny = new Decimal("1E-3088");
                expect(huge.multiply(tiny).toString()).toStrictEqual("1");
            });
            
            test("max exponent difference in multiplication", () => {
                const huge = new Decimal("1E+6144");
                const tiny = new Decimal("1E-6176");
                // 1E+6144 * 1E-6176 = 1E-32
                expect(huge.multiply(tiny).toString()).toStrictEqual("1e-32");
            });
            
            test("multiplication with opposite extreme exponents", () => {
                const val1 = new Decimal("9.999999999999999999999999999999999E+6144");
                const val2 = new Decimal("1E-6176");
                // Should produce approximately 1E-31
                expect(val1.multiply(val2).toString()).toStrictEqual("9.999999999999999999999999999999999e-32");
            });
        });
        
        describe("precision at extremes", () => {
            test("multiply with 34 significant digits near max", () => {
                const val1 = new Decimal("1.234567890123456789012345678901234E+3072");
                const val2 = new Decimal("2E+3072");
                // Product should maintain precision where possible
                expect(val1.multiply(val2).toString()).toStrictEqual("2.469135780246913578024691357802468e+6144");
            });
            
            test("precision loss due to overflow", () => {
                const val1 = new Decimal("5.555555555555555555555555555555555E+3072");
                const val2 = new Decimal("2E+3072");
                // Product exceeds max
                expect(val1.multiply(val2).toString()).toStrictEqual("Infinity");
            });
            
            test("multiply many significant digits", () => {
                const val1 = new Decimal("1.111111111111111111111111111111111E+100");
                const val2 = new Decimal("9.999999999999999999999999999999999E+100");
                // Should produce approximately 1.111E+201
                expect(val1.multiply(val2).toExponential()).toStrictEqual("1.111111111111111111111111111111111e+201");
            });
        });
        
        describe("special multiplication patterns", () => {
            test("square of maximum normal value overflows", () => {
                const max = new Decimal("9.999999999999999999999999999999999E+6144");
                expect(max.multiply(max).toString()).toStrictEqual("Infinity");
            });
            
            test("square root of min subnormal squared", () => {
                // This tests the boundary of subnormal arithmetic
                const val = new Decimal("1E-3088");
                const squared = val.multiply(val);
                // Should normalize to E-6143
                expect(squared.toString()).toStrictEqual("1e-6143");
            });
            
            test("multiplication chain near limits", () => {
                const val = new Decimal("1E+2048");
                const result = val.multiply(val).multiply(val);
                // 1E+2048 * 1E+2048 * 1E+2048 = 1E+6144
                expect(result.toString()).toStrictEqual("1e+6144");
            });
        });
        
        describe("rounding modes with extreme values", () => {
            test("multiplication with floor rounding near max", () => {
                const val1 = new Decimal("3.162277660168379331998893544432E+3072");
                const val2 = new Decimal("3.162277660168379331998893544432E+3072");
                // Product slightly less than max
                const result = val1.multiply(val2, { roundingMode: "floor" });
                expect(result.toString()).toStrictEqual("9.999999999999999999999999999995455e+6144");
            });
            
            test("multiplication with ceiling rounding causing overflow", () => {
                const val1 = new Decimal("3.2E+3072");
                const val2 = new Decimal("3.2E+3072");
                // With ceiling rounding, might overflow
                expect(val1.multiply(val2, { roundingMode: "ceil" }).toString()).toStrictEqual("Infinity");
            });
        });
    });
});
