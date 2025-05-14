import { Decimal } from "../../src/Decimal.mjs";

const MAX_SIGNIFICANT_DIGITS = 34;
const bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

const zero = new Decimal("0");
const minusZero = new Decimal("-0");
const one = new Decimal("1");
const minusOne = new Decimal("-1");
const two = new Decimal("2");

describe("addition", () => {
    test("one plus one equals two", () => {
        expect(one.add(one).toString()).toStrictEqual("2");
    });
    test("one plus minus one equals zero", () => {
        expect(one.add(minusOne).toString()).toStrictEqual("0");
        expect(minusOne.add(one).toString()).toStrictEqual("-0");
    });
    test("minus zero plus zero", () => {
        expect(minusZero.add(zero).toString()).toStrictEqual("0");
    });
    test("minus zero plus minus zero", () => {
        expect(minusZero.add(minusZero).toString()).toStrictEqual("-0");
    });
    test("two negatives", () => {
        expect(minusOne.add(new Decimal("-99")).toString()).toStrictEqual(
            "-100"
        );
    });
    test("0.1 + 0.2 = 0.3", () => {
        let a = "0.1";
        let b = "0.2";
        let c = "0.3";
        expect(new Decimal(a).add(new Decimal(b)).toString()).toStrictEqual(c);
        expect(new Decimal(b).add(new Decimal(a)).toString()).toStrictEqual(c);
    });
    let big = new Decimal(bigDigits);
    test("big plus zero is OK", () => {
        expect(big.add(zero).toString()).toStrictEqual(
            "9.999999999999999999999999999999999e+33"
        );
    });
    test("zero plus big is OK", () => {
        expect(zero.add(big).toString()).toStrictEqual(
            "9.999999999999999999999999999999999e+33"
        );
    });
    test("big plus one is OK", () => {
        expect(big.add(one).toString()).toStrictEqual(one.add(big).toString());
    });
    test("two plus big has too many significant digits, approximation needed", () => {
        expect(two.add(big).toString()).toStrictEqual("1e+34");
    });
    test("big plus two has man significant digits", () => {
        expect(big.add(two).toString()).toStrictEqual("1e+34");
    });
    describe("non-normalized", () => {
        test("one point zero plus one point zero", () => {
            expect(
                new Decimal("1.0").add(new Decimal("1.0")).toString()
            ).toStrictEqual("2");
        });
    });
    describe("NaN", () => {
        test("NaN plus NaN is NaN", () => {
            expect(
                new Decimal("NaN").add(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN plus number", () => {
            expect(
                new Decimal("NaN").add(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number plus NaN", () => {
            expect(
                new Decimal("1").add(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("positive infinity plus number", () => {
            expect(posInf.add(one).toString()).toStrictEqual("Infinity");
        });
        test("negative infinity plus number", () => {
            expect(negInf.add(one).toString()).toStrictEqual("-Infinity");
        });
        test("positive infinity plus positive infinity", () => {
            expect(posInf.add(posInf).toString()).toStrictEqual("Infinity");
        });
        test("minus infinity plus minus infinity", () => {
            expect(negInf.add(negInf).toString()).toStrictEqual("-Infinity");
        });
        test("positive infinity plus negative infinity", () => {
            expect(posInf.add(negInf).toString()).toStrictEqual("NaN");
        });
        test("minus infinity plus positive infinity", () => {
            expect(negInf.add(posInf).toString()).toStrictEqual("NaN");
        });
        test("add number to positive infinity", () => {
            expect(new Decimal("123.5").add(posInf).toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("add number to negative infinity", () => {
            expect(new Decimal("-2").add(negInf).toString()).toStrictEqual(
                "-Infinity"
            );
        });
    });
});

describe("specify rounding mode", () => {
    test("truncate rounding mode", () => {
        expect(
            new Decimal("1234567890123456789012345678901234")
                .add(new Decimal("0.5"), { roundingMode: "trunc" })
                .toString()
        ).toStrictEqual("1.234567890123456789012345678901234e+33");
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    test("example one", () => {
        expect(
            new Decimal("12").add(new Decimal("7.00")).toString()
        ).toStrictEqual("19");
    });
    test("example two", () => {
        expect(
            new Decimal("1E+2").add(new Decimal("1E+4")).toExponential()
        ).toStrictEqual("1.01e+4");
    });
});
