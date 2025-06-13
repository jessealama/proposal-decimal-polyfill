import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;

describe("constructor", () => {
    describe("digit string syntax", () => {
        test("normalization by default", () => {
            expect(new Decimal("1.20").toString()).toStrictEqual("1.2");
        });
        test("string with underscores (comprehensive)", () => {
            // Test various underscore patterns in one test
            expect(
                new Decimal("123_456.789").toFixed({ digits: Infinity })
            ).toStrictEqual("123456.789");
            expect(
                new Decimal("123_456_789.123").toFixed({ digits: Infinity })
            ).toStrictEqual("123456789.123");
            expect(
                new Decimal("123.456_789").toFixed({ digits: Infinity })
            ).toStrictEqual("123.456789");
            expect(
                new Decimal("123_456.789_123").toFixed({ digits: Infinity })
            ).toStrictEqual("123456.789123");
        });
        test("more significant digits than we can store", () => {
            expect(
                new Decimal("123456789123456789123456789123456789").toFixed({
                    digits: Infinity,
                })
            ).toStrictEqual("123456789123456789123456789123456800");
        });
        test("five as last digit past limit: tie to even unchanged", () => {
            expect(
                new Decimal("1234567890123456789012345678901234.5").toFixed({
                    digits: Infinity,
                })
            ).toStrictEqual("1234567890123456789012345678901234");
        });
        test("round up decimal digit is not nine", () => {
            expect(
                new Decimal("1234567890123456789012345678901239.8").toFixed({
                    digits: Infinity,
                })
            ).toStrictEqual("1234567890123456789012345678901240");
        });
        test("empty string not OK", () => {
            expect(() => new Decimal("")).toThrow(SyntaxError);
        });
        test("whitespace plus number not OK", () => {
            expect(() => new Decimal(" 42")).toThrow(SyntaxError);
        });
        test("large power of ten", () => {
            let s = "10000000000000000000000000000000000000000000";
            expect(new Decimal(s).toFixed({ digits: Infinity })).toStrictEqual(
                s
            );
        });
        test("rounding at the limit of significant digits", () => {
            expect(
                new Decimal(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9"
                ).toFixed({ digits: Infinity })
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
        test("rounding occurs beyond the limit of significant digits", () => {
            expect(
                new Decimal(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS + 100) + "9"
                ).toFixed({ digits: Infinity })
            ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS));
        });
        test("minus zero", () => {
            let minusZero = new Decimal("-0");
            expect(minusZero.toString()).toStrictEqual("-0");
            expect(minusZero.isNegative()).toStrictEqual(true);
        });
        describe("zero normalization", () => {
            test("positive zeros are normalized", () => {
                expect(new Decimal("00").toString()).toStrictEqual("0");
                expect(new Decimal("0.0").toString()).toStrictEqual("0");
                expect(new Decimal("0.000").toString()).toStrictEqual("0");
            });
            test("negative zeros are normalized", () => {
                expect(new Decimal("-00").toString()).toStrictEqual("-0");
                expect(new Decimal("-0.0").toString()).toStrictEqual("-0");
                expect(new Decimal("-0.000").toString()).toStrictEqual("-0");
            });
        });
    });

    describe("exponential string syntax", () => {
        test("nonsense string input", () => {
            expect(() => new Decimal("howdy")).toThrow(SyntaxError);
        });
        test("too many significant digits get rounded", () => {
            expect(
                new Decimal("-10000000000000000000000000000000008E5").toFixed({
                    digits: Infinity,
                })
            ).toStrictEqual("-1000000000000000000000000000000001000000");
        });
        test("exponent too big", () => {
            expect(new Decimal("123E100000").toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("exponent too small", () => {
            expect(new Decimal("123E-100000").toString()).toStrictEqual("0");
        });
        test("max exponent", () => {
            expect(new Decimal("123E+6112").toString()).toStrictEqual(
                "1.23e+6114"
            );
        });
        test("min exponent", () => {
            expect(new Decimal("123E-6177").toString()).toStrictEqual(
                "1.23e-6143"
            );
        });
        test("integer too big", () => {
            expect(
                new Decimal(
                    "1234567890123456789012345678901234567890E10"
                ).toString()
            ).toStrictEqual("1.234567890123456789012345678901235e+49");
        });
    });

    describe("NaN", () => {
        test("invalid NaN variations throw", () => {
            expect(() => new Decimal("-NaN")).toThrow(SyntaxError);
            expect(() => new Decimal("nan")).toThrow(SyntaxError);
            expect(() => new Decimal("-nAN")).toThrow(SyntaxError);
        });
    });

    describe("infinity", () => {
        test("valid infinity forms", () => {
            expect(new Decimal("Infinity").toString()).toStrictEqual(
                "Infinity"
            );
            expect(new Decimal("-Infinity").toString()).toStrictEqual(
                "-Infinity"
            );
        });
        test("invalid infinity case variations throw", () => {
            // Test various case variations that should all throw
            const invalidForms = [
                "inf",
                "-inf",
                "Inf",
                "-Inf",
                "INF",
                "-INF",
                "infinity",
                "-infinity",
                "INFINITY",
                "-INFINITY",
            ];
            for (const form of invalidForms) {
                expect(() => new Decimal(form)).toThrow(SyntaxError);
            }
        });
    });

    describe("General Decimal Arithmetic specification", () => {
        describe("decimal syntax", () => {
            test("0", () => {
                expect(new Decimal("0").toString()).toStrictEqual("0");
            });
            test("12.70", () => {
                expect(new Decimal("12.70").toString()).toStrictEqual("12.7");
            });
            test("4E+9", () => {
                expect(new Decimal("4E+9").toString()).toStrictEqual(
                    "4000000000"
                );
            });
            test("NaN", () => {
                expect(new Decimal("NaN").toString()).toStrictEqual("NaN");
            });
            test("NaN8275 (diagnostic information discarded)", () => {
                expect(() => new Decimal("NaN8275")).toThrow(SyntaxError);
            });
            test("period", () => {
                expect(() => new Decimal(".")).toThrow(SyntaxError);
            });
            test("plus period", () => {
                expect(() => new Decimal("+.")).toThrow(SyntaxError);
            });
            test("minus period", () => {
                expect(() => new Decimal("-.")).toThrow(SyntaxError);
            });
            test("plus", () => {
                expect(() => new Decimal("+")).toThrow(SyntaxError);
            });
            test("minus", () => {
                expect(() => new Decimal("-")).toThrow(SyntaxError);
            });
        });
    });

    describe("number arguments", () => {
        test("integer", () => {
            expect(new Decimal(42).toString()).toStrictEqual("42");
        });
        test("non-integer number", () => {
            expect(new Decimal(42.5).toString()).toStrictEqual("42.5");
        });
        test("NaN", () => {
            expect(new Decimal(NaN).toString()).toStrictEqual("NaN");
        });
        test("minus zero", () => {
            expect(new Decimal(-0).toString()).toStrictEqual("-0");
        });
        test("very large value gets approximated", () => {
            expect(
                new Decimal(123456789012345678901234567890123456789).toString()
            ).toStrictEqual("1.2345678901234568e+38");
        });
    });

    describe("bigint", () => {
        test("simple", () => {
            expect(new Decimal(42n).toString()).toStrictEqual("42");
        });
        test("too big, gets rounded", () => {
            expect(
                new Decimal(123456789012345678901234567890123456789n).toString()
            ).toStrictEqual("1.234567890123456789012345678901235e+38");
        });
    });

    describe("rounding", () => {
        test("ceil", () => {
            let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "3";
            expect(
                new Decimal(s, { roundingMode: "ceil" }).toFixed({
                    digits: Infinity,
                })
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
        test("floor", () => {
            let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9";
            expect(
                new Decimal(s, { roundingMode: "floor" }).toFixed({
                    digits: Infinity,
                })
            ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS));
        });
        test("trunc", () => {
            let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9";
            expect(
                new Decimal(s, {
                    roundingMode: "trunc",
                }).toFixed({
                    digits: Infinity,
                })
            ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS));
        });
        describe("halfEven", () => {
            test("is the default rounding mode", () => {
                let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "5";
                let d1 = new Decimal(s);
                let d2 = new Decimal(s, {
                    roundingMode: "halfEven",
                });
                expect(d1.toFixed({ digits: Infinity })).toStrictEqual(
                    d2.toFixed({ digits: Infinity })
                );
            });
        });
        test("halfExpand", () => {
            let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "5";
            expect(
                new Decimal(s, {
                    roundingMode: "halfExpand",
                }).toFixed({ digits: Infinity })
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
    });
});
