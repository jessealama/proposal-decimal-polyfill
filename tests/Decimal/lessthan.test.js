import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal("NaN");
const zero = new Decimal("0");
const negZero = new Decimal("-0");
const one = new Decimal("1");

describe("lessThan", () => {
    let d1 = new Decimal("987.123");
    let d2 = new Decimal("123.456789");
    test("simple example", () => {
        expect(d1.lessThan(d1)).toStrictEqual(false);
    });
    test("non-example", () => {
        expect(d1.lessThan(d2)).toStrictEqual(false);
    });
    test("negative numbers", () => {
        let a = new Decimal("-123.456");
        expect(a.lessThan(a)).toStrictEqual(false);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal("42.678");
        let b = new Decimal("42.6789");
        expect(a.lessThan(b)).toStrictEqual(true);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal("-123.456").lessThan(new Decimal("123.456"))
        ).toStrictEqual(true);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal("0.4166666666666666666666666666666667").lessThan(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal("0.41666666666666666666666666666666667").lessThan(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(false);
    });
    test("non-example", () => {
        expect(
            new Decimal("0.037").lessThan(new Decimal("0.037037037037"))
        ).toStrictEqual(true);
    });
});

describe("many digits", () => {
    test("non-integers get rounded", () => {
        expect(
            new Decimal(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)
            ).lessThan(new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS)))
        ).toStrictEqual(false);
    });
    test("non-equality within limits", () => {
        expect(
            new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS - 1)).lessThan(
                new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(true);
    });
    describe("NaN", () => {
        test("NaN lessThan NaN is false", () => {
            expect(nan.lessThan(nan)).toStrictEqual(false);
        });
        test("number equals NaN is false", () => {
            expect(one.lessThan(nan)).toStrictEqual(false);
        });
        test("NaN equals number is false", () => {
            expect(nan.lessThan(one)).toStrictEqual(false);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.lessThan(zero)).toStrictEqual(false);
        });
        test("right hand", () => {
            expect(zero.lessThan(negZero)).toStrictEqual(false);
        });
        test("both arguments", () => {
            expect(negZero.lessThan(negZero)).toStrictEqual(false);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.lessThan(one)).toStrictEqual(false);
        });
        test("negative infinity vs number", () => {
            expect(negInf.lessThan(one)).toStrictEqual(true);
        });
        test("negative infintity vs positive infinity", () => {
            expect(negInf.lessThan(posInf)).toStrictEqual(true);
        });
        test("positive infinity vs negative infinity", () => {
            expect(posInf.lessThan(negInf)).toStrictEqual(false);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.lessThan(posInf)).toStrictEqual(false);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.lessThan(negInf)).toStrictEqual(false);
        });
        test("compare number to positive infinity", () => {
            expect(one.lessThan(posInf)).toStrictEqual(true);
        });
        test("compare number to negative infinity", () => {
            expect(one.lessThan(negInf)).toStrictEqual(false);
        });
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(zero.lessThan(zero)).toStrictEqual(false);
    });
    test("negative zero", () => {
        expect(negZero.lessThan(negZero)).toStrictEqual(false);
    });
    test("negative zero vs zero", () => {
        expect(negZero.lessThan(zero)).toStrictEqual(false);
    });
    test("compare zero to positive", () => {
        expect(zero.lessThan(one)).toStrictEqual(true);
    });
    test("compare zero to negative", () => {
        expect(zero.lessThan(one.negate())).toStrictEqual(false);
    });
    test("compare positive to zero", () => {
        expect(one.lessThan(zero)).toStrictEqual(false);
    });
    test("compare negative to zero", () => {
        expect(one.negate().lessThan(zero)).toStrictEqual(true);
    });
    test("compare positive to negative zero", () => {
        expect(one.lessThan(zero)).toStrictEqual(false);
    });
});
