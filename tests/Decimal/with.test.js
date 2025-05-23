import { Decimal } from "../../src/Decimal.mjs";

describe("with", () => {
    describe("fractiondigit", () => {
        test("NaN throws", () => {
            expect(() =>
                new Decimal("NaN").with({ kind: "fractionDigit", digits: 5 })
            ).toThrow(RangeError);
        });
        describe("infinity", () => {
            test("positive throws", () => {
                expect(() =>
                    new Decimal("Infinity").with({
                        kind: "fractionDigit",
                        digits: 5,
                    })
                ).toThrow(RangeError);
            });
            test("negative throws", () => {
                expect(() =>
                    new Decimal("-Infinity").with({
                        kind: "fractionDigit",
                        digits: 5,
                    })
                ).toThrow(RangeError);
            });
        });
        describe("-0", () => {
            test("works", () => {
                expect(
                    new Decimal("-0")
                        .with({ kind: "fractionDigit", digits: 2 })
                        .toString()
                ).toStrictEqual("-0.00");
            });
        });
    });
    describe("significantdigit", () => {
        test("NaN throws", () => {
            expect(() =>
                new Decimal("NaN").with({ kind: "significantDigit", digits: 2 })
            ).toThrow(RangeError);
        });
        describe("infinity", () => {
            test("positive throws", () => {
                expect(() =>
                    new Decimal("Infinity").with({
                        kind: "significantDigit",
                        digits: 2,
                    })
                ).toThrow(RangeError);
            });
            test("negative throws", () => {
                expect(() =>
                    new Decimal("-Infinity").with({
                        kind: "significantDigit",
                        digits: 2,
                    })
                ).toThrow(RangeError);
            });
        });
        describe("-0", () => {
            test("works", () => {
                expect(
                    new Decimal("-0")
                        .with({ kind: "significantDigit", digits: 2 })
                        .toString()
                ).toStrictEqual("-0.0");
            });
        });
    });
    describe("trailingzero", () => {
        test("NaN throws", () => {
            expect(() =>
                new Decimal("NaN").with({ kind: "trailingZero", digits: 5 })
            ).toThrow(RangeError);
        });
        describe("infinity", () => {
            test("positive throws", () => {
                expect(() =>
                    new Decimal("Infinity").with({
                        kind: "trailingZero",
                        digits: 5,
                    })
                ).toThrow(RangeError);
            });
            test("negative throws", () => {
                expect(() =>
                    new Decimal("-Infinity").with({
                        kind: "trailingZero",
                        digits: 5,
                    })
                ).toThrow(RangeError);
            });
        });
        describe("-0", () => {
            test("works", () => {
                expect(
                    new Decimal("-0")
                        .with({ kind: "trailingZero", digits: 3 })
                        .toString()
                ).toStrictEqual("-0.000");
            });
        });
    });
});
