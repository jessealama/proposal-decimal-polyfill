import { Decimal } from "../../src/Decimal.mjs";

describe("with", () => {
    describe("fractiondigit", () => {
        test("NaN works", () => {
            expect(
                new Decimal("NaN").with({ fractionDigit: 5 }).toString()
            ).toStrictEqual("NaN");
        });
        describe("infinity", () => {
            test("positive works", () => {
                expect(
                    new Decimal("Infinity")
                        .with({ fractionDigit: 5 })
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("negative works", () => {
                expect(
                    new Decimal("-Infinity")
                        .with({
                            fractionDigit: 5,
                        })
                        .toString()
                ).toStrictEqual("-Infinity");
            });
        });
        describe("-0", () => {
            test("works", () => {
                expect(
                    new Decimal("-0").with({ fractionDigit: 2 }).toString()
                ).toStrictEqual("-0.00");
            });
        });
    });
    describe("significantdigit", () => {
        test("NaN works", () => {
            expect(
                new Decimal("NaN").with({ significantDigit: 2 }).toString()
            ).toStrictEqual("NaN");
        });
        describe("infinity", () => {
            test("positive works", () => {
                expect(
                    new Decimal("Infinity")
                        .with({
                            significantDigit: 2,
                        })
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("negative works", () => {
                expect(
                    new Decimal("-Infinity")
                        .with({
                            significantDigit: 2,
                        })
                        .toString()
                ).toStrictEqual("-Infinity");
            });
        });
        describe("-0", () => {
            test("works", () => {
                expect(
                    new Decimal("-0").with({ significantDigit: 2 }).toString()
                ).toStrictEqual("-0.0");
            });
        });
    });
    describe("trailingzero", () => {
        test("NaN works", () => {
            expect(
                new Decimal("NaN").with({ trailingZero: 5 }).toString()
            ).toStrictEqual("NaN");
        });
        describe("infinity", () => {
            test("positive works", () => {
                expect(
                    new Decimal("Infinity")
                        .with({
                            trailingZero: 5,
                        })
                        .toString()
                ).toStrictEqual("Infinity");
            });
            test("negative works", () => {
                expect(
                    new Decimal("-Infinity")
                        .with({
                            trailingZero: 5,
                        })
                        .toString()
                ).toStrictEqual("-Infinity");
            });
        });
        describe("-0", () => {
            test("works", () => {
                expect(
                    new Decimal("-0").with({ trailingZero: 3 }).toString()
                ).toStrictEqual("-0.000");
            });
        });
    });
});
