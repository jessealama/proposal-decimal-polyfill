import { Decimal } from "../../src/Decimal.mjs";
import { expectDecimal128 } from "./util.js";

const MAX_SIGNIFICANT_DIGITS = 34;
let bigDigits = "9".repeat(MAX_SIGNIFICANT_DIGITS);

describe("subtraction", () => {
    test("subtract decimal part", () => {
        expectDecimal128(
            new Decimal("123.456").subtract(new Decimal("0.456")),
            "123"
        );
    });
    test("minus negative number", () => {
        expectDecimal128(
            new Decimal("0.1").subtract(new Decimal("-0.2")),
            "0.3"
        );
    });
    test("subtract two negatives", () => {
        expectDecimal128(
            new Decimal("-1.9").subtract(new Decimal("-2.7")),
            "0.8"
        );
    });
    const big = new Decimal(bigDigits);
    test("close to range limit", () => {
        expectDecimal128(
            big.subtract(new Decimal("9")),
            "9.99999999999999999999999999999999e+33"
        );
    });
    test("large subtraction does not overflow, but does get apporoximated", () => {
        let a = new Decimal("-" + bigDigits);
        let b = new Decimal("9");
        expect(a.subtract(b).toString()).toStrictEqual(
            "-1.000000000000000000000000000000001e+34"
        );
    });
    describe("NaN", () => {
        test("NaN minus NaN is NaN", () => {
            expect(
                new Decimal("NaN").subtract(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN minus number", () => {
            expect(
                new Decimal("NaN").subtract(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
        test("number minus NaN", () => {
            expect(
                new Decimal("1").subtract(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("zero", () => {
        let d = new Decimal("42.65");
        let zero = new Decimal("0");
        test("difference is zero", () => {
            expect(d.subtract(d).toString()).toStrictEqual("0");
        });
        test("subtracting zero", () => {
            expect(d.subtract(zero).toString()).toStrictEqual("42.65");
        });
        test("subtracting zero", () => {
            expect(zero.subtract(d).toString()).toStrictEqual("-42.65");
        });
    });
    describe("minus zero", () => {
        let x = new Decimal("42.54");
        let minusZero = new Decimal("-0");
        test("subtracting minus zero", () => {
            expect(x.subtract(minusZero).toString()).toStrictEqual("42.54");
        });
    });
});

describe("infinity", () => {
    let posInf = new Decimal("Infinity");
    let negInf = new Decimal("-Infinity");
    describe("first argument", () => {
        describe("positive infinity", () => {
            test("positive number", () => {
                expect(
                    posInf.subtract(new Decimal("1")).toString()
                ).toStrictEqual("Infinity");
            });
            test("negative number", () => {
                expect(
                    posInf.subtract(new Decimal("-1")).toString()
                ).toStrictEqual("Infinity");
            });
            test("positive infinity", () => {
                expect(posInf.subtract(posInf).toString()).toStrictEqual("NaN");
            });
            test("negative infinity", () => {
                expect(posInf.subtract(negInf).toString()).toStrictEqual(
                    "Infinity"
                );
            });
        });
        describe("negative infinity", () => {
            test("positive number", () => {
                expect(
                    negInf.subtract(new Decimal("1")).toString()
                ).toStrictEqual("-Infinity");
            });
            test("negative number", () => {
                expect(
                    negInf.subtract(new Decimal("-1")).toString()
                ).toStrictEqual("-Infinity");
            });
            test("positive infinity", () => {
                expect(negInf.subtract(posInf).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
            test("negative infinity", () => {
                expect(negInf.subtract(negInf).toString()).toStrictEqual("NaN");
            });
        });
    });
    describe("second argument", () => {
        describe("positive infinity", () => {
            test("finite", () => {
                expect(
                    new Decimal("42").subtract(posInf).toString()
                ).toStrictEqual("-Infinity");
            });
            test("positive infinity", () => {
                expect(posInf.subtract(posInf).toString()).toStrictEqual("NaN");
            });
            test("negative infinity", () => {
                expect(posInf.subtract(negInf).toString()).toStrictEqual(
                    "Infinity"
                );
            });
        });
        describe("negative infinity", () => {
            test("finite", () => {
                expect(
                    new Decimal("42").subtract(negInf).toString()
                ).toStrictEqual("Infinity");
            });
            test("positive infinity", () => {
                expect(negInf.subtract(posInf).toString()).toStrictEqual(
                    "-Infinity"
                );
            });
            test("negative infinity", () => {
                expect(negInf.subtract(negInf).toString()).toStrictEqual("NaN");
            });
        });
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    test("example one", () => {
        expect(
            new Decimal("1.3").subtract(new Decimal("1.07")).toString()
        ).toStrictEqual("0.23");
    });
    test("example two", () => {
        expect(
            new Decimal("1.3").subtract(new Decimal("1.30")).toString()
        ).toStrictEqual("0"); // would be 0.00 in official IEEE 754
    });
    test("example three", () => {
        expect(
            new Decimal("1.3").subtract(new Decimal("2.07")).toString()
        ).toStrictEqual("-0.77");
    });
});
