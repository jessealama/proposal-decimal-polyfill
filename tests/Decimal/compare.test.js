import { Decimal } from "../../src/Decimal128.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const nan = new Decimal("NaN");
const zero = new Decimal("0");
const negZero = new Decimal("-0");
const one = new Decimal("1");

describe("compare", () => {
    let d1 = new Decimal("987.123");
    let d2 = new Decimal("123.456789");
    test("simple example", () => {
        expect(d1.compare(d1)).toStrictEqual(0);
    });
    test("non-example", () => {
        expect(d1.compare(d2)).toStrictEqual(1);
    });
    test("negative numbers", () => {
        let a = new Decimal("-123.456");
        expect(a.compare(a)).toStrictEqual(0);
    });
    test("integer part is the same, decimal part is not", () => {
        let a = new Decimal("42.678");
        let b = new Decimal("42.6789");
        expect(a.compare(b)).toStrictEqual(-1);
    });
    test("negative and positive are different", () => {
        expect(
            new Decimal("-123.456").compare(new Decimal("123.456"))
        ).toStrictEqual(-1);
    });
    test("limit of significant digits", () => {
        expect(
            new Decimal("0.4166666666666666666666666666666667").compare(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(0);
    });
    test("beyond limit of significant digits", () => {
        expect(
            new Decimal("0.41666666666666666666666666666666667").compare(
                new Decimal("0.41666666666666666666666666666666666")
            )
        ).toStrictEqual(0);
    });
    test("non-example", () => {
        expect(
            new Decimal("0.037").compare(new Decimal("0.037037037037"))
        ).toStrictEqual(-1);
    });
    describe("examples from a presentation", () => {
        let a = new Decimal("1.00");
        let b = new Decimal("1.0000");
        let c = new Decimal("1.0001");
        let d = new Decimal("0.9999");
        test("use mathematical equality by default", () => {
            expect(a.compare(b)).toStrictEqual(0);
        });
        test("mathematically distinct", () => {
            expect(a.compare(c)).toStrictEqual(-1);
        });
        test("mathematically distinct, again", () => {
            expect(b.compare(d)).toStrictEqual(1);
        });
        test("mathematically distinct, once more", () => {
            expect(a.compare(d)).toStrictEqual(1);
        });
    });
});

describe("many digits", () => {
    test("non-integers get rounded", () => {
        expect(
            new Decimal(
                "0." + "4".repeat(MAX_SIGNIFICANT_DIGITS + 50)
            ).compare(new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS)))
        ).toStrictEqual(0);
    });
    test("non-equality within limits", () => {
        expect(
            new Decimal("0." + "4".repeat(33)).compare(
                new Decimal("0." + "4".repeat(MAX_SIGNIFICANT_DIGITS))
            )
        ).toStrictEqual(-1);
    });
    describe("NaN", () => {
        test("NaN equals NaN throws", () => {
            expect(nan.compare(nan)).toStrictEqual(NaN);
        });
        test("number equals NaN throws", () => {
            expect(one.compare(nan)).toStrictEqual(NaN);
        });
        test("NaN equals number throws", () => {
            expect(nan.compare(one)).toStrictEqual(NaN);
        });
    });
    describe("minus zero", () => {
        test("left hand", () => {
            expect(negZero.compare(zero)).toStrictEqual(0);
        });
        test("right hand", () => {
            expect(zero.compare(negZero)).toStrictEqual(0);
        });
        test("both arguments", () => {
            expect(negZero.compare(negZero)).toStrictEqual(0);
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("positive infinity vs number", () => {
            expect(posInf.compare(one)).toStrictEqual(1);
        });
        test("negative infinity vs number", () => {
            expect(negInf.compare(one)).toStrictEqual(-1);
        });
        test("negative infintity vs positive infinity", () => {
            expect(negInf.compare(posInf)).toStrictEqual(-1);
        });
        test("positive infinity vs negative infinity", () => {
            expect(posInf.compare(negInf)).toStrictEqual(1);
        });
        test("positive infinity both arguments", () => {
            expect(posInf.compare(posInf)).toStrictEqual(0);
        });
        test("negative infinity both arguments", () => {
            expect(negInf.compare(negInf)).toStrictEqual(0);
        });
        test("compare number to positive infinity", () => {
            expect(one.compare(posInf)).toStrictEqual(-1);
        });
        test("compare number to negative infinity", () => {
            expect(one.compare(negInf)).toStrictEqual(1);
        });
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(zero.compare(zero)).toStrictEqual(0);
    });
    test("negative zero", () => {
        expect(negZero.compare(negZero)).toStrictEqual(0);
    });
    test("negative zero vs zero", () => {
        expect(negZero.compare(zero)).toStrictEqual(0);
    });
    test("compare zero to positive", () => {
        expect(zero.compare(one)).toStrictEqual(-1);
    });
    test("compare zero to negative", () => {
        expect(zero.compare(one.negate())).toStrictEqual(1);
    });
    test("compare positive to zero", () => {
        expect(one.compare(zero)).toStrictEqual(1);
    });
    test("compare negative to zero", () => {
        expect(one.negate().compare(zero)).toStrictEqual(-1);
    });
    test("compare positive to negative zero", () => {
        expect(one.compare(zero)).toStrictEqual(1);
    });
    test("compare negative to negative zero", () => {
        expect(one.negate().compare(zero)).toStrictEqual(-1);
    });
});

describe("normalization", () => {
    let d1 = new Decimal("1.2");
    let d2 = new Decimal("1.20");
    let d3 = new Decimal("1.200");
    test("compare normalized to normalized", () => {
        expect(d1.compare(d2)).toStrictEqual(0);
    });
    test("compare normalized to normalized", () => {
        expect(d2.compare(d3)).toStrictEqual(0);
    });
    test("compare normalized to normalized", () => {
        expect(d1.compare(d3)).toStrictEqual(0);
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    describe("compare", () => {
        test("example one", () => {
            expect(
                new Decimal("2.1").compare(new Decimal("3"))
            ).toStrictEqual(-1);
        });
        test("example two", () => {
            expect(
                new Decimal("2.1").compare(new Decimal("2.1"))
            ).toStrictEqual(0);
        });
        test("example three", () => {
            expect(
                new Decimal("2.1").compare(new Decimal("2.10"))
            ).toStrictEqual(0);
        });
        test("example four", () => {
            expect(
                new Decimal("3").compare(new Decimal("2.1"))
            ).toStrictEqual(1);
        });
        test("example five", () => {
            expect(
                new Decimal("2.1").compare(new Decimal("-3"))
            ).toStrictEqual(1);
        });
        test("example six", () => {
            expect(
                new Decimal("-3").compare(new Decimal("2.1"))
            ).toStrictEqual(-1);
        });
    });
});
