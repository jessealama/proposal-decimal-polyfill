import { Decimal } from "../../src/Decimal.mjs";

describe("toString", () => {
    describe("NaN", () => {
        test("works", () => {
            expect(new Decimal("NaN").toString()).toStrictEqual("NaN");
        });
    });
    describe("zero", () => {
        test("positive zero", () => {
            expect(new Decimal("0").toString()).toStrictEqual("0");
        });
        test("negative zero", () => {
            expect(new Decimal("-0").toString()).toStrictEqual("-0");
        });
    });
    describe("infinity", () => {
        test("positive infinity", () => {
            expect(new Decimal("Infinity").toString()).toStrictEqual(
                "Infinity"
            );
        });
        test("negative infinity", () => {
            expect(new Decimal("-Infinity").toString()).toStrictEqual(
                "-Infinity"
            );
        });
    });
    describe("normalization", () => {
        let d = new Decimal("1.20");
        test("on by default", () => {
            expect(d.toString()).toStrictEqual("1.2");
        });
        test("not normalizing minus zero", () => {
            expect(new Decimal("-0.0").toString()).toStrictEqual("-0");
        });
    });

    describe("edge cases matching JavaScript Number behavior", () => {
        describe("positive exponent boundaries", () => {
            test("exponent 20: uses decimal notation", () => {
                expect(new Decimal("1e20").toString()).toStrictEqual(
                    "100000000000000000000"
                );
            });
            test("exponent 21: uses exponential notation", () => {
                expect(new Decimal("1e21").toString()).toStrictEqual("1e+21");
            });
            test("multiple digits with exponent 15", () => {
                expect(new Decimal("12345e15").toString()).toStrictEqual(
                    "12345000000000000000"
                );
            });
            test("multiple digits with exponent 16", () => {
                expect(new Decimal("12345e16").toString()).toStrictEqual(
                    "123450000000000000000"
                );
            });
            test("multiple digits with exponent 17", () => {
                expect(new Decimal("12345e17").toString()).toStrictEqual(
                    "1.2345e+21"
                );
            });
            test("exactly at boundary with fractional coefficient", () => {
                expect(new Decimal("9.99999e20").toString()).toStrictEqual(
                    "999999000000000000000"
                );
            });
            test("just over boundary with fractional coefficient", () => {
                expect(new Decimal("1.00001e21").toString()).toStrictEqual(
                    "1.00001e+21"
                );
            });
        });

        describe("negative exponent boundaries", () => {
            test("exponent -5: uses decimal notation", () => {
                expect(new Decimal("1e-5").toString()).toStrictEqual("0.00001");
            });
            test("exponent -6: uses decimal notation", () => {
                expect(new Decimal("1e-6").toString()).toStrictEqual(
                    "0.000001"
                );
            });
            test("exponent -7: uses exponential notation", () => {
                expect(new Decimal("1e-7").toString()).toStrictEqual("1e-7");
            });
            test("multiple digits with negative exponent", () => {
                expect(new Decimal("12345e-10").toString()).toStrictEqual(
                    "0.0000012345"
                );
            });
            test("multiple digits crossing boundary", () => {
                expect(new Decimal("12345e-11").toString()).toStrictEqual(
                    "1.2345e-7"
                );
            });
        });
    });
});
