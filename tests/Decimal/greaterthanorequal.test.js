import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal("NaN");
const zero = new Decimal("0");
const negZero = new Decimal("-0");
const one = new Decimal("1");

describe("greaterThanOrEqual", () => {
    let d1 = new Decimal("987.123");
    let d2 = new Decimal("123.456789");
    test("simple example", () => {
        expect(d1.greaterThanOrEqual(d1)).toStrictEqual(true);
    });
    test("non-example", () => {
        expect(d1.greaterThanOrEqual(d2)).toStrictEqual(true);
    });
    test("negative numbers", () => {
        let a = new Decimal("-123.456");
        expect(a.greaterThanOrEqual(a)).toStrictEqual(true);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal("42.678");
        let b = new Decimal("42.6789");
        expect(a.greaterThanOrEqual(b)).toStrictEqual(false);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal("-123.456").greaterThanOrEqual(new Decimal("123.456"))
        ).toStrictEqual(false);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal(
                "0.4166666666666666666666666666666667"
            ).greaterThanOrEqual(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(true);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal(
                "0.41666666666666666666666666666666667"
            ).greaterThanOrEqual(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(true);
    });

    describe("many digits", () => {
        test("non-integers get rounded", () => {
            expect(
                new Decimal(
                    "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)
                ).greaterThanOrEqual(
                    new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
                )
            ).toStrictEqual(true);
        });
        test("non-equality within limits", () => {
            expect(
                new Decimal(
                    "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS - 1)
                ).greaterThanOrEqual(
                    new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
                )
            ).toStrictEqual(false);
        });
        describe("NaN", () => {
            test("NaN lessThan NaN is false", () => {
                expect(nan.greaterThanOrEqual(nan)).toStrictEqual(false);
            });
            test("number equals NaN is false", () => {
                expect(one.greaterThanOrEqual(nan)).toStrictEqual(false);
            });
            test("NaN equals number is false", () => {
                expect(nan.greaterThanOrEqual(one)).toStrictEqual(false);
            });
        });
        describe("minus zero", () => {
            test("left hand", () => {
                expect(negZero.greaterThanOrEqual(zero)).toStrictEqual(true);
            });
            test("right hand", () => {
                expect(zero.greaterThanOrEqual(negZero)).toStrictEqual(true);
            });
            test("both arguments", () => {
                expect(negZero.greaterThanOrEqual(negZero)).toStrictEqual(true);
            });
        });
        describe("infinity", () => {
            let posInf = new Decimal("Infinity");
            let negInf = new Decimal("-Infinity");
            test("positive infinity vs number", () => {
                expect(posInf.greaterThanOrEqual(one)).toStrictEqual(true);
            });
            test("negative infinity vs number", () => {
                expect(negInf.greaterThanOrEqual(one)).toStrictEqual(false);
            });
            test("negative infinity vs positive infinity", () => {
                expect(negInf.greaterThanOrEqual(posInf)).toStrictEqual(false);
            });
            test("positive infinity vs negative infinity", () => {
                expect(posInf.greaterThanOrEqual(negInf)).toStrictEqual(true);
            });
            test("positive infinity both arguments", () => {
                expect(posInf.greaterThanOrEqual(posInf)).toStrictEqual(true);
            });
            test("negative infinity both arguments", () => {
                expect(negInf.greaterThanOrEqual(negInf)).toStrictEqual(true);
            });
            test("compare number to positive infinity", () => {
                expect(one.greaterThanOrEqual(posInf)).toStrictEqual(false);
            });
            test("compare number to negative infinity", () => {
                expect(one.greaterThanOrEqual(negInf)).toStrictEqual(true);
            });
        });
    });
});
