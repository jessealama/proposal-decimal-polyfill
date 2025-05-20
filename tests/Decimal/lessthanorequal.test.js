import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal("NaN");
const zero = new Decimal("0");
const negZero = new Decimal("-0");
const one = new Decimal("1");

describe("lessThanOrEqual", () => {
    let d1 = new Decimal("987.123");
    let d2 = new Decimal("123.456789");
    test("simple example", () => {
        expect(d1.lessThanOrEqual(d1)).toStrictEqual(true);
    });
    test("non-example", () => {
        expect(d1.lessThanOrEqual(d2)).toStrictEqual(false);
    });
    test("negative numbers", () => {
        let a = new Decimal("-123.456");
        expect(a.lessThanOrEqual(a)).toStrictEqual(true);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal("42.678");
        let b = new Decimal("42.6789");
        expect(a.lessThanOrEqual(b)).toStrictEqual(true);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal("-123.456").lessThanOrEqual(new Decimal("123.456"))
        ).toStrictEqual(true);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal("0.4166666666666666666666666666666667").lessThanOrEqual(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(true);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal(
                "0.41666666666666666666666666666666667"
            ).lessThanOrEqual(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(true);
    });
    test("non-example", () => {
        expect(
            new Decimal("0.037").lessThanOrEqual(new Decimal("0.037037037037"))
        ).toStrictEqual(true);
    });
});

describe("many digits", () => {
    test("non-integers get rounded", () => {
        expect(
            new Decimal(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)
            ).lessThanOrEqual(
                new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(true);
    });
    test("non-equality within limits", () => {
        expect(
            new Decimal(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS - 1)
            ).lessThanOrEqual(
                new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(true);
    });
    describe("NaN", () => {
        test("NaN lessThan NaN is false", () => {
            expect(nan.lessThanOrEqual(nan)).toStrictEqual(false);
        });
        test("number equals NaN is false", () => {
            expect(one.lessThanOrEqual(nan)).toStrictEqual(false);
        });
        test("NaN equals number is false", () => {
            expect(nan.lessThanOrEqual(one)).toStrictEqual(false);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.lessThanOrEqual(zero)).toStrictEqual(true);
        });
        test("right hand", () => {
            expect(zero.lessThanOrEqual(negZero)).toStrictEqual(true);
        });
        test("both arguments", () => {
            expect(negZero.lessThanOrEqual(negZero)).toStrictEqual(true);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.lessThanOrEqual(one)).toStrictEqual(false);
        });
        test("negative infinity vs number", () => {
            expect(negInf.lessThanOrEqual(one)).toStrictEqual(true);
        });
        test("negative infintity vs positive infinity", () => {
            expect(negInf.lessThanOrEqual(posInf)).toStrictEqual(true);
        });
        test("positive infinity vs negative infinity", () => {
            expect(posInf.lessThanOrEqual(negInf)).toStrictEqual(false);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.lessThanOrEqual(posInf)).toStrictEqual(true);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.lessThanOrEqual(negInf)).toStrictEqual(true);
        });
        test("compare number to positive infinity", () => {
            expect(one.lessThanOrEqual(posInf)).toStrictEqual(true);
        });
        test("compare number to negative infinity", () => {
            expect(one.lessThanOrEqual(negInf)).toStrictEqual(false);
        });
    });
});
