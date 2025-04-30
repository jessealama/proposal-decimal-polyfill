import { Decimal128 } from "../../src/Decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal128("NaN");
const zero = new Decimal128("0");
const negZero = new Decimal128("-0");
const one = new Decimal128("1");

describe("notEquals", () => {
    let d1 = new Decimal128("987.123");
    let d2 = new Decimal128("123.456789");
    test("simple example", () => {
        expect(
            new Decimal128("123.456789").notEquals(new Decimal128("123.456789"))
        ).toStrictEqual(false);
    });
    test("non-example", () => {
        expect(
            new Decimal128("987.123").notEquals(new Decimal128("123.456789"))
        ).toStrictEqual(true);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal128("0.4166666666666666666666666666666667").notEquals(
                new Decimal128("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal128("0.41666666666666666666666666666666667").notEquals(
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
            ).notEquals(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(false);
    });
    test("non-equality within limits", () => {
        expect(
            new Decimal128(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS - 1)
            ).notEquals(
                new Decimal128("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(true);
    });
    describe("NaN", () => {
        test("NaN.notEquals NaN is false", () => {
            expect(nan.notEquals(nan)).toStrictEqual(false);
        });
        test("number equals NaN is false", () => {
            expect(one.notEquals(nan)).toStrictEqual(false);
        });
        test("NaN equals number is false", () => {
            expect(nan.notEquals(one)).toStrictEqual(false);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.notEquals(zero)).toStrictEqual(false);
        });
        test("right hand", () => {
            expect(zero.notEquals(negZero)).toStrictEqual(false);
        });
        test("both arguments", () => {
            expect(negZero.notEquals(negZero)).toStrictEqual(false);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal128("Infinity");
        let negInf = new Decimal128("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.notEquals(one)).toStrictEqual(true);
        });
        test("negative infinity vs positive infinity", () => {
            expect(negInf.notEquals(posInf)).toStrictEqual(true);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.notEquals(posInf)).toStrictEqual(false);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.notEquals(negInf)).toStrictEqual(false);
        });
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(zero.notEquals(zero)).toStrictEqual(false);
    });
    test("negative zero", () => {
        expect(negZero.notEquals(negZero)).toStrictEqual(false);
    });
    test("negative zero vs zero", () => {
        expect(negZero.notEquals(zero)).toStrictEqual(false);
    });
    test("compare zero to positive", () => {
        expect(zero.notEquals(one)).toStrictEqual(true);
    });
    test("compare zero to negative", () => {
        expect(zero.notEquals(one.negate())).toStrictEqual(true);
    });
    test("compare positive to zero", () => {
        expect(one.notEquals(zero)).toStrictEqual(true);
    });
});
