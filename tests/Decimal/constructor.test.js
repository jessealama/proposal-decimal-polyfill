import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;

describe("constructor", () => {
    describe("digit string syntax", () => {
        test("normalization by default", () => {
            expect(new Decimal("1.20").toString()).toStrictEqual("1.2");
        });
        test("string with underscores (comprehensive)", () => {
            // Test various underscore patterns in one test
            expect(new Decimal("123_456.789").toString()).toStrictEqual(
                "123456.789"
            );
            expect(new Decimal("123_456_789.123").toString()).toStrictEqual(
                "123456789.123"
            );
            expect(new Decimal("123.456_789").toString()).toStrictEqual(
                "123.456789"
            );
            expect(new Decimal("123_456.789_123").toString()).toStrictEqual(
                "123456.789123"
            );
        });
        test("more significant digits than we can store", () => {
            expect(
                new Decimal("123456789123456789123456789123456789").toFixed({
                    digits: 0,
                })
            ).toStrictEqual("123456789123456789123456789123456800");
        });
        test("five as last digit past limit: tie to even unchanged", () => {
            expect(
                new Decimal("1234567890123456789012345678901234.5").toFixed({
                    digits: 0,
                })
            ).toStrictEqual("1234567890123456789012345678901234");
        });
        test("round up decimal digit is not nine", () => {
            expect(
                new Decimal("1234567890123456789012345678901239.8").toFixed({
                    digits: 0,
                })
            ).toStrictEqual("1234567890123456789012345678901240");
        });
        test("empty string not OK", () => {
            expect(() => new Decimal("")).toThrow(SyntaxError);
            expect(() => new Decimal("")).toThrow("Empty string not permitted");
        });
        test("whitespace plus number not OK", () => {
            expect(() => new Decimal(" 42")).toThrow(SyntaxError);
        });
        test("large power of ten", () => {
            let s = "10000000000000000000000000000000000000000000";
            expect(new Decimal(s).toFixed({ digits: 0 })).toStrictEqual(s);
        });
        test("rounding at the limit of significant digits", () => {
            expect(
                new Decimal(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9"
                ).toString()
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
        test("rounding occurs beyond the limit of significant digits", () => {
            expect(
                new Decimal(
                    "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS + 100) + "9"
                ).toString()
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
            expect(() => new Decimal("howdy")).toThrow(
                "Invalid decimal string"
            );
        });
        test("too many significant digits get rounded", () => {
            expect(
                new Decimal("-10000000000000000000000000000000008E5").toFixed({
                    digits: 0,
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
            // 123E-6177 = 1.23E-6175, a subnormal whose trailing digit sits
            // below the Etiny quantum (10^-6176) and so gets rounded away;
            // the adjusted exponent (-6175) is reported truthfully rather
            // than clamped to Emin.
            expect(new Decimal("123E-6177").toString()).toStrictEqual(
                "1.2e-6175"
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

    describe("Decimal128 domain boundaries", () => {
        // The largest finite value has adjusted exponent 6144; one step past
        // it overflows to Infinity.
        describe("overflow at adjusted exponent 6144", () => {
            test("adjusted exponent 6144 is finite", () => {
                expect(new Decimal("1E+6144").toString()).toStrictEqual(
                    "1e+6144"
                );
            });
            test("adjusted exponent 6145 overflows to Infinity", () => {
                expect(new Decimal("1E+6145").toString()).toStrictEqual(
                    "Infinity"
                );
            });
        });

        // Rounding to 34 significant digits can carry, pushing the adjusted
        // exponent from 6144 up to 6145 and overflowing.
        describe("overflow when rounding carries past 6144", () => {
            const thirtyFiveNines = "9".repeat(35);
            test("carry that stays at 6144 is finite", () => {
                // 35 nines at adjusted exponent 6143 round up to 1e+6144.
                expect(
                    new Decimal(thirtyFiveNines + "E6109").toString()
                ).toStrictEqual("1e+6144");
            });
            test("carry from 6144 to 6145 overflows to Infinity", () => {
                // 35 nines at adjusted exponent 6144 round up to 1e+6145.
                expect(
                    new Decimal(thirtyFiveNines + "E6110").toString()
                ).toStrictEqual("Infinity");
            });
        });

        // Every finite Decimal128 value is an integer multiple of 10^-6176
        // (Etiny). A value with digits below that quantum is rounded at
        // Etiny, keeping fewer significant digits (gradual underflow).
        describe("rounding at the Etiny quantum", () => {
            test("digits below Etiny are rounded away", () => {
                expect(new Decimal("1.23E-6176").toString()).toStrictEqual(
                    "1e-6176"
                );
            });
            test("rounding at Etiny respects the rounding mode", () => {
                expect(
                    new Decimal("1.23E-6176", {
                        roundingMode: "ceil",
                    }).toString()
                ).toStrictEqual("2e-6176");
            });
            test("ties at Etiny round to even", () => {
                expect(new Decimal("1.5E-6176").toString()).toStrictEqual(
                    "2e-6176"
                );
                expect(new Decimal("2.5E-6176").toString()).toStrictEqual(
                    "2e-6176"
                );
            });
            test("rounding at Etiny can carry into a higher quantum", () => {
                expect(new Decimal("9.9E-6176").toString()).toStrictEqual(
                    "1e-6175"
                );
            });
            test("subnormal precision shrinks below 34 digits", () => {
                // At adjusted exponent -6144, one below Emin, only 33
                // significant digits fit above Etiny.
                expect(
                    new Decimal(
                        "1.1111111111111111111111111111152444E-6144"
                    ).toString()
                ).toStrictEqual("1.11111111111111111111111111111524e-6144");
            });
            test("no double rounding through 34 significant digits", () => {
                // The value is just over half of the smallest subnormal, so
                // rounding at Etiny gives 1e-6176. Rounding to 34 significant
                // digits first would give exactly half, which ties to zero.
                expect(
                    new Decimal(
                        "5.00000000000000000000000000000000001E-6177"
                    ).toString()
                ).toStrictEqual("1e-6176");
            });
        });

        // Values smaller than the smallest subnormal (1E-6176) also round at
        // Etiny: to zero or to 1E-6176, per the rounding mode.
        describe("underflow below the smallest subnormal", () => {
            test("adjusted exponent -6176 is finite", () => {
                expect(new Decimal("1E-6176").toString()).toStrictEqual(
                    "1e-6176"
                );
            });
            test("a tenth of the smallest subnormal underflows to zero", () => {
                expect(new Decimal("1E-6177").toString()).toStrictEqual("0");
            });
            test("more than half of the smallest subnormal rounds up to it", () => {
                expect(new Decimal("6E-6177").toString()).toStrictEqual(
                    "1e-6176"
                );
            });
            test("just under half of the smallest subnormal rounds to zero", () => {
                expect(new Decimal("4.9E-6177").toString()).toStrictEqual("0");
            });
            test("exactly half of the smallest subnormal ties to zero", () => {
                expect(new Decimal("5E-6177").toString()).toStrictEqual("0");
            });
            test("exactly half of the smallest subnormal rounds up under halfExpand", () => {
                expect(
                    new Decimal("5E-6177", {
                        roundingMode: "halfExpand",
                    }).toString()
                ).toStrictEqual("1e-6176");
            });
            test("ceil rounds any tiny positive value up to the smallest subnormal", () => {
                expect(
                    new Decimal("1E-7000", {
                        roundingMode: "ceil",
                    }).toString()
                ).toStrictEqual("1e-6176");
            });
            test("floor rounds any tiny negative value to minus the smallest subnormal", () => {
                expect(
                    new Decimal("-1E-7000", {
                        roundingMode: "floor",
                    }).toString()
                ).toStrictEqual("-1e-6176");
            });
            test("negative underflow gives negative zero", () => {
                expect(new Decimal("-1E-7000").toString()).toStrictEqual("-0");
            });
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
                expect(() => new Decimal(".")).toThrow(
                    "Lone decimal point not permitted"
                );
            });
            test("plus period", () => {
                expect(() => new Decimal("+.")).toThrow(SyntaxError);
            });
            test("minus period", () => {
                expect(() => new Decimal("-.")).toThrow(SyntaxError);
                expect(() => new Decimal("-.")).toThrow(
                    "Lone minus sign and period not permitted"
                );
            });
            test("fractional with no integer part", () => {
                expect(new Decimal(".5").toString()).toStrictEqual("0.5");
                expect(new Decimal("-.5").toString()).toStrictEqual("-0.5");
                expect(new Decimal(".25e2").toString()).toStrictEqual("25");
            });
            test("leading plus sign accepted", () => {
                expect(new Decimal("+5").toString()).toStrictEqual("5");
                expect(new Decimal("+1.25").toString()).toStrictEqual("1.25");
            });
            test("plus", () => {
                expect(() => new Decimal("+")).toThrow(SyntaxError);
            });
            test("minus", () => {
                expect(() => new Decimal("-")).toThrow(SyntaxError);
                expect(() => new Decimal("-")).toThrow(
                    "Lone minus sign not permitted"
                );
            });
            test("trailing garbage after a valid prefix", () => {
                expect(() => new Decimal("5x")).toThrow(SyntaxError);
                expect(() => new Decimal("5x")).toThrow(
                    "Invalid decimal string"
                );
            });
            test("exponent with no mantissa", () => {
                expect(() => new Decimal("e5")).toThrow(SyntaxError);
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
                new Decimal(s, { roundingMode: "ceil" }).toString()
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
        test("floor", () => {
            let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9";
            expect(
                new Decimal(s, { roundingMode: "floor" }).toString()
            ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS));
        });
        test("trunc", () => {
            let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "9";
            expect(
                new Decimal(s, {
                    roundingMode: "trunc",
                }).toString()
            ).toStrictEqual("0." + "1".repeat(MAX_SIGNIFICANT_DIGITS));
        });
        describe("halfEven", () => {
            test("is the default rounding mode", () => {
                let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "5";
                let d1 = new Decimal(s);
                let d2 = new Decimal(s, {
                    roundingMode: "halfEven",
                });
                expect(d1.toString()).toStrictEqual(d2.toString());
            });
        });
        test("halfExpand", () => {
            let s = "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS) + "5";
            expect(
                new Decimal(s, {
                    roundingMode: "halfExpand",
                }).toString()
            ).toStrictEqual(
                "0." + "1".repeat(MAX_SIGNIFICANT_DIGITS - 1) + "2"
            );
        });
    });
});
