import { Decimal } from "../../src/Decimal.mjs";
import { expectDecimal128 } from "./util.js";

describe("toFixed", () => {
    describe("NaN", () => {
        test("works", () => {
            expect(new Decimal("NaN").toFixed()).toStrictEqual("NaN");
        });
        test("works, digits reqwusted", () => {
            expect(new Decimal("NaN").toFixed({ digits: 77 })).toStrictEqual(
                "NaN"
            );
        });
    });
    describe("zero", () => {
        test("positive zero", () => {
            expect(new Decimal("0").toFixed()).toStrictEqual("0");
        });
        test("negative zero", () => {
            expect(new Decimal("-0").toFixed()).toStrictEqual("-0");
        });
    });
    describe("infinity", () => {
        test("positive infinity", () => {
            expect(new Decimal("Infinity").toFixed()).toStrictEqual("Infinity");
        });
        test("positive infinity, digits requested", () => {
            expect(
                new Decimal("Infinity").toFixed({ digits: 42 })
            ).toStrictEqual("Infinity");
        });
        test("negative infinity", () => {
            expect(new Decimal("-Infinity").toFixed()).toStrictEqual(
                "-Infinity"
            );
        });
        test("negative infinity, digits requested", () => {
            expect(
                new Decimal("-Infinity").toFixed({ digits: 55 })
            ).toStrictEqual("-Infinity");
        });
    });
    describe("to decimal places", function () {
        const d = "123.456";
        const decimalD = new Decimal(d);
        test("more digits than available means digits get added", () => {
            expectDecimal128(decimalD.toFixed({ digits: 4 }), "123.4560");
        });
        test("same number of digits as available means no change", () => {
            expectDecimal128(decimalD.toFixed({ digits: 3 }), "123.456");
        });
        test("cutoff with rounding if number has more digits than requested (1)", () => {
            expectDecimal128(decimalD.toFixed({ digits: 2 }), "123.46");
        });
        test("cutoff if number has more digits than requested (with rounding)", () => {
            expectDecimal128(decimalD.toFixed({ digits: 1 }), "123.5");
        });
        test("zero decimal places", () => {
            expectDecimal128(decimalD.toFixed({ digits: 0 }), "123");
        });
        test("zero decimal places for integer", () => {
            expectDecimal128(new Decimal("42").toFixed({ digits: 0 }), "42");
        });
        test("impute precision to an integer", () => {
            expectDecimal128(new Decimal("42").toFixed({ digits: 1 }), "42.0");
        });
        test("halfEven tie whose even neighbor ends in a trailing zero", () => {
            expectDecimal128(new Decimal("10.5").toFixed({ digits: 0 }), "10");
        });
        test("negative number of decimal places throws", () => {
            expect(() => decimalD.toFixed({ digits: -1 })).toThrow(RangeError);
            expect(() => decimalD.toFixed({ digits: -1 })).toThrow(
                "digits must be non-negative"
            );
        });
        test("non-integer does not take floor", () => {
            expect(() => decimalD.toFixed({ digits: 1.5 })).toThrow(RangeError);
            expect(() => decimalD.toFixed({ digits: 1.5 })).toThrow(
                "digits must be an integer"
            );
        });
        test("infinite digits throws RangeError", () => {
            expect(() => decimalD.toFixed({ digits: Infinity })).toThrow(
                RangeError
            );
        });
        test("non-object argument", () => {
            expect(() => decimalD.toFixed("flab")).toThrow(TypeError);
            expect(() => decimalD.toFixed("flab")).toThrow(
                "Argument must be an object"
            );
        });
        test("zeroes get added", () => {
            expect(new Decimal("42").toFixed({ digits: 10 })).toStrictEqual(
                "42.0000000000"
            );
        });
        test("maximum number of digits works", () => {
            expect(new Decimal("1").toFixed({ digits: 10000 })).toStrictEqual(
                "1." + "0".repeat(10000)
            );
        });
        test("too many digits requested throws", () => {
            expect(() => decimalD.toFixed({ digits: 10001 })).toThrow(
                RangeError
            );
            expect(() => decimalD.toFixed({ digits: 10001 })).toThrow(
                "Too many digits requested"
            );
        });
    });
    describe("bare call follows Number precedent", () => {
        test("digits defaults to 0", () => {
            expect(new Decimal("1.25").toFixed()).toStrictEqual("1");
        });
        test("empty bag also defaults to 0", () => {
            expect(new Decimal("1.75").toFixed({})).toStrictEqual("2");
        });
        test("digits option is present but value is undefined", () => {
            expectDecimal128(
                new Decimal("123.456").toFixed({ digits: undefined }),
                "123"
            );
        });
        test("large values stay in plain notation", () => {
            expect(new Decimal("1e21").toFixed()).toStrictEqual(
                "1000000000000000000000"
            );
        });
    });
    describe("roundingMode", () => {
        test("default is halfEven", () => {
            expect(new Decimal("1.25").toFixed({ digits: 1 })).toStrictEqual(
                "1.2"
            );
        });
        test("halfExpand", () => {
            expect(
                new Decimal("1.25").toFixed({
                    digits: 1,
                    roundingMode: "halfExpand",
                })
            ).toStrictEqual("1.3");
        });
        test("ceil on a positive value rounds away from zero", () => {
            expect(
                new Decimal("1.21").toFixed({ digits: 1, roundingMode: "ceil" })
            ).toStrictEqual("1.3");
        });
        test("ceil on a negative value rounds toward zero", () => {
            expect(
                new Decimal("-1.29").toFixed({
                    digits: 1,
                    roundingMode: "ceil",
                })
            ).toStrictEqual("-1.2");
        });
        test("floor on a negative value rounds away from zero", () => {
            expect(
                new Decimal("-1.21").toFixed({
                    digits: 1,
                    roundingMode: "floor",
                })
            ).toStrictEqual("-1.3");
        });
        test("trunc drops excess digits", () => {
            expect(
                new Decimal("1.29").toFixed({
                    digits: 1,
                    roundingMode: "trunc",
                })
            ).toStrictEqual("1.2");
        });
        test("invalid roundingMode throws RangeError", () => {
            expect(() =>
                new Decimal("1.25").toFixed({ roundingMode: "bogus" })
            ).toThrow(RangeError);
        });
        test("options are validated even for NaN receivers", () => {
            expect(() => new Decimal("NaN").toFixed("junk")).toThrow(TypeError);
        });
    });
});
