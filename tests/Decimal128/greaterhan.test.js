import { Decimal128 } from "../../src/Decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal128("NaN");
const zero = new Decimal128("0");
const negZero = new Decimal128("-0");
const one = new Decimal128("1");

describe("greaterThan", () => {
    let d1 = new Decimal128("987.123");
    let d2 = new Decimal128("123.456789");
    test("simple example", () => {
        expect(d1.greaterThan(d1)).toStrictEqual(false);
    });
    test("non-example", () => {
        expect(d1.greaterThan(d2)).toStrictEqual(true);
    });
    test("negative numbers", () => {
        let a = new Decimal128("-123.456");
        expect(a.greaterThan(a)).toStrictEqual(false);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal128("42.678");
        let b = new Decimal128("42.6789");
        expect(a.greaterThan(b)).toStrictEqual(false);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal128("-123.456").greaterThan(new Decimal128("123.456"))
        ).toStrictEqual(false);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").greaterThan(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").greaterThan(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
});

describe("many digits", () => {
    test("non-integers get rounded", () => {
        expect(
            new Decimal128(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)
            ).greaterThan(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(false);
    });
    test("non-equality within limits", () => {
        expect(
            new Decimal128(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS - 1)
            ).greaterThan(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(false);
    });
    describe("NaN", () => {
        test("NaN.greaterThan NaN is false", () => {
            expect(nan.greaterThan(nan)).toStrictEqual(false);
        });
        test("number equals NaN is false", () => {
            expect(one.greaterThan(nan)).toStrictEqual(false);
        });
        test("NaN equals number is false", () => {
            expect(nan.greaterThan(one)).toStrictEqual(false);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.greaterThan(zero)).toStrictEqual(false);
        });
        test("right hand", () => {
            expect(zero.greaterThan(negZero)).toStrictEqual(false);
        });
        test("both arguments", () => {
            expect(negZero.greaterThan(negZero)).toStrictEqual(false);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.greaterThan(one)).toStrictEqual(true);
        });
        test("negative infinity vs number", () => {
            expect(negInf.greaterThan(one)).toStrictEqual(false);
        });
        test("negative infintity vs positive infinity", () => {
            expect(negInf.greaterThan(posInf)).toStrictEqual(false);
        });
        test("positive infinity vs negative infinity", () => {
            expect(posInf.greaterThan(negInf)).toStrictEqual(true);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.greaterThan(posInf)).toStrictEqual(false);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.greaterThan(negInf)).toStrictEqual(false);
        });
        test("compare number to positive infinity", () => {
            expect(one.greaterThan(posInf)).toStrictEqual(false);
        });
        test("compare number to negative infinity", () => {
            expect(one.greaterThan(negInf)).toStrictEqual(true);
        });
    });
});
