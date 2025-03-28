import { Decimal128 } from "../../src/Decimal128.mjs";

let posZero = new Decimal128("0");
let negZero = new Decimal128("-0");

const examples = [
    ["123.456", "789.789", "97504.190784"],
    ["2", "3", "6"],
    ["2", "3.0", "6"],
    ["2.0", "3.0", "6"],
    ["4", "0.5", "2"],
    ["10", "100", "1000"],
    ["0.1", "0.2", "0.02"],
    ["0.25", "1.5", "0.375"],
    ["0.12345", "0.67890", "0.083810205"],
    ["0.123456789", "0.987654321", "0.121932631112635269"],
    ["100000.123", "99999.321", "9999944399.916483"],
    ["123456.123456789", "987654.987654321", "121932056088.565269013112635269"],
    [
        "123456789.987654321",
        "987654321.123456789",
        "121932632103337905.6620941931126353",
    ],
];

function checkProduct(a, b, c) {
    expect(
        new Decimal128(a).multiply(new Decimal128(b)).toString()
    ).toStrictEqual(c);
}

describe("multiply", () => {
    describe("worked-out examples", () => {
        for (const [a, b, c] of examples)
            test(`${a} * ${b} = ${c}`, () => {
                checkProduct(a, b, c);
            });
    });
    test("negative second argument", () => {
        checkProduct("987.654", "-321.987", "-318011.748498");
    });
    test("negative first argument", () => {
        checkProduct("-987.654", "321.987", "-318011.748498");
    });
    test("both arguments negative", () => {
        checkProduct("-987.654", "-321.987", "318011.748498");
    });
    test("integer overflow", () => {
        expect(
            new Decimal128("123456789123456789")
                .multiply(new Decimal128("987654321987654321"))
                .toString()
        ).toStrictEqual("Infinity");
    });
    test("integer overflow (negative)", () => {
        expect(
            new Decimal128("123456789123456789")
                .multiply(new Decimal128("-987654321987654321"))
                .toString()
        ).toStrictEqual("-Infinity");
    });
    test("decimal overflow", () => {
        expect(
            new Decimal128("123456789123456789.987654321")
                .multiply(new Decimal128("987654321123456789.123456789"))
                .toString()
        ).toStrictEqual("Infinity");
    });
    describe("zero", () => {
        let d = new Decimal128("42.65");
        test("left-hand positive zero", () => {
            expect(posZero.multiply(d).toString()).toStrictEqual("0");
        });
        test("left-hand negative zero", () => {
            expect(negZero.multiply(d).toString()).toStrictEqual("-0");
        });
        test("right-hand positive zero", () => {
            expect(d.multiply(posZero).toString()).toStrictEqual("0");
        });
        test("right-hand negative zero", () => {
            expect(d.multiply(negZero).toString()).toStrictEqual("-0");
        });
        test("positive zero point zero", () => {
            expect(
                new Decimal128("0.0").multiply(posZero).toString()
            ).toStrictEqual("0");
        });
        test("negative zero point zero", () => {
            expect(
                new Decimal128("-0.0").multiply(posZero).toString()
            ).toStrictEqual("-0");
        });
    });
    describe("NaN", () => {
        test("NaN times NaN is NaN", () => {
            expect(
                new Decimal128("NaN").multiply(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("number times NaN is NaN", () => {
            expect(
                new Decimal128("1").multiply(new Decimal128("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN times number is NaN", () => {
            expect(
                new Decimal128("NaN").multiply(new Decimal128("1")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        describe("invalid operation", () => {
            test("zero times positive infinity is NaN", () => {
                expect(
                    new Decimal128("0")
                        .multiply(new Decimal128("Infinity"))
                        .toString()
                ).toStrictEqual("NaN");
                expect(
                    new Decimal128("Infinity")
                        .multiply(new Decimal128("0"))
                        .toString()
                ).toStrictEqual("NaN");
            });
            test("zero times negative infinity is NaN", () => {
                expect(
                    new Decimal128("0")
                        .multiply(new Decimal128("-Infinity"))
                        .toString()
                ).toStrictEqual("NaN");
                expect(
                    new Decimal128("-Infinity")
                        .multiply(new Decimal128("0"))
                        .toString()
                ).toStrictEqual("NaN");
            });
        });
        test("positive infinity times positive number is positive infinity", () => {
            expect(
                new Decimal128("Infinity")
                    .multiply(new Decimal128("42"))
                    .toString()
            ).toStrictEqual("Infinity");
        });
        test("positive number times positive infinity is positive infinity", () => {
            expect(
                new Decimal128("42")
                    .multiply(new Decimal128("Infinity"))
                    .toString()
            ).toStrictEqual("Infinity");
        });
        test("positive infinity times negative number is negative infinity", () => {
            expect(
                new Decimal128("Infinity")
                    .multiply(new Decimal128("-42"))
                    .toString()
            ).toStrictEqual("-Infinity");
        });
        test("negative number times positive infinity is negative infinity", () => {
            expect(
                new Decimal128("-42")
                    .multiply(new Decimal128("Infinity"))
                    .toString()
            ).toStrictEqual("-Infinity");
        });
        test("positive infinity times negative infinity is negative infinity", () => {
            expect(
                new Decimal128("Infinity")
                    .multiply(new Decimal128("-Infinity"))
                    .toString()
            ).toStrictEqual("-Infinity");
        });
        test("positive infinity times positive infinity is positive infinity", () => {
            expect(
                new Decimal128("Infinity")
                    .multiply(new Decimal128("Infinity"))
                    .toString()
            ).toStrictEqual("Infinity");
        });
        test("negative infinity times negative infinity is positive infinity", () => {
            expect(
                new Decimal128("-Infinity")
                    .multiply(new Decimal128("-Infinity"))
                    .toString()
            ).toStrictEqual("Infinity");
        });
        test("negative infinity times positive infinity is negative infinity", () => {
            expect(
                new Decimal128("-Infinity")
                    .multiply(new Decimal128("Infinity"))
                    .toString()
            ).toStrictEqual("-Infinity");
        });
        let negInf = new Decimal128("-Infinity");
        let posInf = new Decimal128("Infinity");
        test("negative infinity times itself", () => {
            expect(negInf.multiply(negInf).toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("positive infinity times itself", () => {
            expect(posInf.multiply(posInf).toString()).toStrictEqual(
                "Infinity"
            );
        });
    });
});

describe("examples from the General Decimal Arithmetic specification", () => {
    test("example one", () => {
        expect(
            new Decimal128("1.20").multiply(new Decimal128("3")).toString()
        ).toStrictEqual("3.6"); // would be 3.60 in official IEEE 754
    });
    test("example two", () => {
        expect(
            new Decimal128("7").multiply(new Decimal128("3")).toString()
        ).toStrictEqual("21");
    });
    test("example three", () => {
        expect(
            new Decimal128("0.9").multiply(new Decimal128("0.8")).toString()
        ).toStrictEqual("0.72");
    });
    test("example four", () => {
        expect(
            new Decimal128("0.9").multiply(new Decimal128("-0")).toString()
        ).toStrictEqual("-0"); // would be -0.0 in official IEEE 754
    });
    test("example five", () => {
        // slightly modified because we have more precision
        expect(
            new Decimal128("654321")
                .multiply(new Decimal128("654321"))
                .toExponential()
        ).toStrictEqual("4.28135971041e+11");
    });
});
