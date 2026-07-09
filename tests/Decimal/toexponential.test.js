import { Decimal } from "../../src/Decimal.mjs";
import { expectDecimal128 } from "./util.js";

describe("toExponential", () => {
    describe("NaN", () => {
        test("works", () => {
            expect(new Decimal("NaN").toExponential()).toStrictEqual("NaN");
        });
    });
    describe("zero", () => {
        test("positive zero", () => {
            expect(new Decimal("0").toExponential()).toStrictEqual("0e+0");
        });
        test("negative zero", () => {
            expect(new Decimal("-0").toExponential()).toStrictEqual("-0e+0");
        });
    });
    describe("infinity", () => {
        test("positive infinity", () => {
            expect(new Decimal("Infinity").toExponential()).toStrictEqual(
                "Infinity"
            );
        });
        test("negative infinity", () => {
            expect(new Decimal("-Infinity").toExponential()).toStrictEqual(
                "-Infinity"
            );
        });
    });
    const d = "123.456";
    const decimalD = new Decimal(d);
    test("no argument", () => {
        expect(decimalD.toExponential()).toStrictEqual("1.23456e+2");
    });
    test("wrong argument type", () => {
        expect(() => decimalD.toExponential("foo")).toThrow(TypeError);
        expect(() => decimalD.toExponential("foo")).toThrow(
            "Argument must be an object"
        );
    });
    test("empty options", () => {
        expect(decimalD.toExponential({})).toStrictEqual("1.23456e+2");
    });
    test("expected property missing", () => {
        expect(decimalD.toExponential({ foo: "bar" })).toStrictEqual(
            "1.23456e+2"
        );
    });
    test("more digits requested than integer digits available", () => {
        expectDecimal128(decimalD.toExponential({ digits: 7 }), "1.2345600e+2");
    });
    test("exact number of digits requested as digits available", () => {
        expectDecimal128(decimalD.toExponential({ digits: 6 }), "1.234560e+2");
    });
    test("possibly round non-integer part (1)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 5 }), "1.23456e+2");
    });
    test("possibly round non-integer part (2)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 4 }), "1.2346e+2");
    });
    test("fewer digits requested than available rounds (1)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 3 }), "1.235e+2");
    });
    test("fewer digits requested than available rounds (2)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 2 }), "1.23e+2");
    });
    test("fewer digits requested than available rounds (3)", () => {
        expectDecimal128(decimalD.toExponential({ digits: 1 }), "1.2e+2");
    });
    test("zero decimal places throws", () => {
        expect(() => decimalD.toExponential({ digits: 0 })).toThrow(RangeError);
        expect(() => decimalD.toExponential({ digits: 0 })).toThrow(
            "Argument must be positive"
        );
    });
    test("negative number of decimal places", () => {
        expect(() => decimalD.toExponential({ digits: -1 })).toThrow(
            RangeError
        );
    });
    test("non-integer number throws", () => {
        expect(() => decimalD.toExponential({ digits: 1.5 })).toThrow(
            RangeError
        );
        expect(() => decimalD.toExponential({ digits: 1.5 })).toThrow(
            "Argument must be an integer"
        );
    });
    describe("negative", () => {
        let negD = decimalD.negate();
        test("integer part", () => {
            expect(negD.toExponential({ digits: 3 }).toString()).toStrictEqual(
                "-1.235e+2"
            );
        });
    });

    // Excess mantissa digits are rounded (half-even, like toFixed and
    // toPrecision), not truncated.
    describe("rounding, not truncation", () => {
        test("rounds up when the first dropped digit is large", () => {
            expect(
                new Decimal("1.789").toExponential({ digits: 1 })
            ).toStrictEqual("1.8e+0");
        });
        test("tie rounds to even (down)", () => {
            expect(
                new Decimal("1.25").toExponential({ digits: 1 })
            ).toStrictEqual("1.2e+0");
        });
        test("tie rounds to even (up)", () => {
            expect(
                new Decimal("1.35").toExponential({ digits: 1 })
            ).toStrictEqual("1.4e+0");
        });
        test("tie at a later digit rounds to even", () => {
            expect(
                new Decimal("1.005").toExponential({ digits: 2 })
            ).toStrictEqual("1.00e+0");
        });
        test("carry renormalizes the mantissa", () => {
            expect(
                new Decimal("9.99").toExponential({ digits: 1 })
            ).toStrictEqual("1.0e+1");
        });
        test("negative carry renormalizes the mantissa", () => {
            expect(
                new Decimal("-9.99").toExponential({ digits: 1 })
            ).toStrictEqual("-1.0e+1");
        });
        test("negative exponent", () => {
            expect(
                new Decimal("0.0001999").toExponential({ digits: 2 })
            ).toStrictEqual("2.00e-4");
        });
    });
    test("one", () => {
        expect(new Decimal("1").toExponential()).toStrictEqual("1e+0");
    });
    test("zero", () => {
        expect(new Decimal("0").toExponential()).toStrictEqual("0e+0");
    });
    test("minus zero", () => {
        expect(new Decimal("-0").toExponential()).toStrictEqual("-0e+0");
    });
    test("integer", () => {
        expect(new Decimal("42").toExponential()).toStrictEqual("4.2e+1");
    });

    test("round trip", () => {
        expect(new Decimal("4.2E+0").toExponential()).toStrictEqual("4.2e+0");
    });

    test("significant has one digit", () => {
        expect(new Decimal("1").toExponential()).toStrictEqual("1e+0");
    });
    test("negative exponent", () => {
        expect(new Decimal("0.1").toExponential()).toStrictEqual("1e-1");
    });
    test("negative exponent, multiple digits", () => {
        expect(new Decimal("0.01042").toExponential()).toStrictEqual(
            "1.042e-2"
        );
    });
    describe("scientific string syntax", () => {
        test("1.23E+3", () => {
            expect(new Decimal("1.23E+3").toString()).toStrictEqual("1230");
        });
        test("1.23E+5", () => {
            expect(new Decimal("1.23E+5").toString()).toStrictEqual("123000");
        });
        test("1.23E-8", () => {
            expect(new Decimal("1.23E-8").toString()).toStrictEqual("1.23e-8");
        });
        test("-1.23E-10", () => {
            expect(new Decimal("-1.23E-10").toString()).toStrictEqual(
                "-1.23e-10"
            );
        });
        test("0E+2", () => {
            expect(new Decimal("0E+2").toExponential()).toStrictEqual("0e+0");
        });
    });

    // A single-digit mantissa renders without a fraction part ("7e+0"),
    // which the digits code path must handle (issue #99).
    describe("single-digit mantissa with digits requested", () => {
        test("single digit", () => {
            expect(new Decimal("7").toExponential({ digits: 2 })).toStrictEqual(
                "7.00e+0"
            );
        });
        test("zero", () => {
            expect(new Decimal("0").toExponential({ digits: 3 })).toStrictEqual(
                "0.000e+0"
            );
        });
        test("negative zero", () => {
            expect(
                new Decimal("-0").toExponential({ digits: 3 })
            ).toStrictEqual("-0.000e+0");
        });
        test("negative single digit", () => {
            expect(
                new Decimal("-7").toExponential({ digits: 2 })
            ).toStrictEqual("-7.00e+0");
        });
        test("power of ten", () => {
            expect(
                new Decimal("100").toExponential({ digits: 2 })
            ).toStrictEqual("1.00e+2");
        });
        test("negative power of ten exponent", () => {
            expect(
                new Decimal("0.001").toExponential({ digits: 2 })
            ).toStrictEqual("1.00e-3");
        });
    });

    // Subnormal values must expose their true exponent down to Etiny
    // (-6176) rather than being clamped to Emin (-6143).
    describe("subnormal range", () => {
        test("just below the normal boundary", () => {
            expect(new Decimal("1E-6144").toExponential()).toStrictEqual(
                "1e-6144"
            );
        });
        test("smallest subnormal (Etiny)", () => {
            expect(new Decimal("1E-6176").toExponential()).toStrictEqual(
                "1e-6176"
            );
        });
        test("negative subnormal keeps its sign and exponent", () => {
            expect(new Decimal("-1.5E-6160").toExponential()).toStrictEqual(
                "-1.5e-6160"
            );
        });
    });
});
