import { Decimal } from "../../src/Decimal.mjs";

const a = "4.1";
const b = "1.25";

describe("remainder", () => {
    test("simple example", () => {
        expect(
            new Decimal(a).remainder(new Decimal(b)).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with positive argument", () => {
        expect(
            new Decimal("-4.1").remainder(new Decimal(b)).toString()
        ).toStrictEqual("-0.35");
    });
    test("negative argument", () => {
        expect(
            new Decimal(a).remainder(new Decimal("-1.25")).toString()
        ).toStrictEqual("0.35");
    });
    test("negative, with negative argument", () => {
        expect(
            new Decimal("-4.1").remainder(new Decimal("-1.25")).toString()
        ).toStrictEqual("-0.35");
    });
    test("divide by zero", () => {
        expect(
            new Decimal("42").remainder(new Decimal("0")).toString()
        ).toStrictEqual("NaN");
    });
    test("divide by minus zero", () => {
        expect(
            new Decimal("42").remainder(new Decimal("-0")).toString()
        ).toStrictEqual("NaN");
    });
    test("cleanly divides", () => {
        expect(
            new Decimal("10").remainder(new Decimal("5")).toString()
        ).toStrictEqual("0");
    });
    describe("NaN", () => {
        test("NaN remainder NaN is NaN", () => {
            expect(
                new Decimal("NaN").remainder(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("number remainder NaN is NaN", () => {
            expect(
                new Decimal("1").remainder(new Decimal("NaN")).toString()
            ).toStrictEqual("NaN");
        });
        test("NaN remainder number is NaN", () => {
            expect(
                new Decimal("NaN").remainder(new Decimal("1")).toString()
            ).toStrictEqual("NaN");
        });
    });
    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");
        test("positive infinity remainder positive infinity is NaN", () => {
            expect(posInf.remainder(posInf).toString()).toStrictEqual("NaN");
        });
        test("positive infinity remainder negative infinity is NaN", () => {
            expect(posInf.remainder(negInf).toString()).toStrictEqual("NaN");
        });
        test("negative infinity remainder positive infinity is NaN", () => {
            expect(negInf.remainder(posInf).toString()).toStrictEqual("NaN");
        });
        test("remainder with positive infinity", () => {
            expect(
                new Decimal("42").remainder(posInf).toString()
            ).toStrictEqual("42");
        });
        test("remainder with negative infinity", () => {
            expect(
                new Decimal("42").remainder(negInf).toString()
            ).toStrictEqual("42");
        });
        test("positive infinity remainder number is NaN", () => {
            expect(
                posInf.remainder(new Decimal("42")).toString()
            ).toStrictEqual("NaN");
        });
        test("negative infinity remainder number is NaN", () => {
            expect(
                negInf.remainder(new Decimal("42")).toString()
            ).toStrictEqual("NaN");
        });
    });

    describe("examples from the General Decimal Arithmetic Specification", () => {
        test("example one", () => {
            expect(
                new Decimal("2.1").remainder(new Decimal("3")).toString()
            ).toStrictEqual("2.1");
        });
        test("example two", () => {
            expect(
                new Decimal("10").remainder(new Decimal("3")).toString()
            ).toStrictEqual("1");
        });
        test("example three", () => {
            expect(
                new Decimal("-10").remainder(new Decimal("3")).toString()
            ).toStrictEqual("-1");
        });
        test("example four", () => {
            expect(
                new Decimal("10.2").remainder(new Decimal("1")).toString()
            ).toStrictEqual("0.2");
        });
        test("example five", () => {
            expect(
                new Decimal("10").remainder(new Decimal("0.3")).toString()
            ).toStrictEqual("0.1");
        });
        test("example six", () => {
            expect(
                new Decimal("3.6").remainder(new Decimal("1.3")).toString()
            ).toStrictEqual("1"); // would be 1.0 in official IEEE 754
        });
    });
    describe("not the same as IEEE 754 remainder", () => {
        test("42 % 10", () => {
            expect(
                new Decimal("42").remainder(new Decimal("10")).toString()
            ).toStrictEqual("2");
        });
        test("46 % 10", () => {
            expect(
                new Decimal("46").remainder(new Decimal("10")).toString()
            ).toStrictEqual("6");
        });
    });
});
