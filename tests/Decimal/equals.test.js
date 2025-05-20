import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal("NaN");
const zero = new Decimal("0");
const negZero = new Decimal("-0");
const one = new Decimal("1");

describe("equals", () => {
    let d1 = new Decimal("987.123");
    let d2 = new Decimal("123.456789");
    test("simple example", () => {
        expect(
            new Decimal("123.456789").equals(new Decimal("123.456789"))
        ).toStrictEqual(true);
    });
    test("non-example", () => {
        expect(
            new Decimal("987.123").equals(new Decimal("123.456789"))
        ).toStrictEqual(false);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal("0.4166666666666666666666666666666667").equals(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(true);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal("0.41666666666666666666666666666666667").equals(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(true);
    });

    describe("many digits", () => {
        test("non-integers get rounded", () => {
            expect(
                new Decimal(
                    "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)
                ).equals(new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS)))
            ).toStrictEqual(true);
        });
        test("non-equality within limits", () => {
            expect(
                new Decimal(
                    "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS - 1)
                ).equals(new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS)))
            ).toStrictEqual(false);
        });
        describe("NaN", () => {
            test("NaN.equals NaN is false", () => {
                expect(nan.equals(nan)).toStrictEqual(false);
            });
            test("number equals NaN is false", () => {
                expect(one.equals(nan)).toStrictEqual(false);
            });
            test("NaN equals number is false", () => {
                expect(nan.equals(one)).toStrictEqual(false);
            });
        });
        describe("minus zero", () => {
            test("left hand", () => {
                expect(negZero.equals(zero)).toStrictEqual(true);
            });
            test("right hand", () => {
                expect(zero.equals(negZero)).toStrictEqual(true);
            });
            test("both arguments", () => {
                expect(negZero.equals(negZero)).toStrictEqual(true);
            });
        });
        describe("infinity", () => {
            let posInf = new Decimal("Infinity");
            let negInf = new Decimal("-Infinity");
            test("positive infinity vs number", () => {
                expect(posInf.equals(one)).toStrictEqual(false);
            });
            test("negative infinity vs positive infinity", () => {
                expect(negInf.equals(posInf)).toStrictEqual(false);
            });
            test("positive infinity both arguments", () => {
                expect(posInf.equals(posInf)).toStrictEqual(true);
            });
            test("negative infinity both arguments", () => {
                expect(negInf.equals(negInf)).toStrictEqual(true);
            });
        });
    });

    describe("zero", () => {
        test("positive zero", () => {
            expect(zero.equals(zero)).toStrictEqual(true);
        });
        test("negative zero", () => {
            expect(negZero.equals(negZero)).toStrictEqual(true);
        });
        test("negative zero vs zero", () => {
            expect(negZero.equals(zero)).toStrictEqual(true);
        });
        test("compare zero to positive", () => {
            expect(zero.equals(one)).toStrictEqual(false);
        });
        test("compare zero to negative", () => {
            expect(zero.equals(one.negate())).toStrictEqual(false);
        });
        test("compare positive to zero", () => {
            expect(one.equals(zero)).toStrictEqual(false);
        });
    });
});
