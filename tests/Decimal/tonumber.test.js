import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";
import { expectDecimal128 } from "./util.js";

describe("toNumber", () => {
    describe("NaN", () => {
        test("works", () => {
            expect(NAN.toNumber()).toStrictEqual(NaN);
        });
    });
    describe("zero", () => {
        test("positive zero", () => {
            expect(POSITIVE_ZERO.toNumber()).toStrictEqual(0);
        });
        test("negative zero", () => {
            expect(NEGATIVE_ZERO.toNumber()).toStrictEqual(-0);
        });
    });
    describe("infinity", () => {
        test("positive infinity", () => {
            expect(POSITIVE_INFINITY.toNumber()).toStrictEqual(Infinity);
        });
        test("negative infinity", () => {
            expect(NEGATIVE_INFINITY.toNumber()).toStrictEqual(-Infinity);
        });
    });
    describe("simple examples", () => {
        test("1.25", () => {
            expect(new Decimal("1.25").toNumber()).toStrictEqual(1.25);
        });
        test("0.1", () => {
            expect(new Decimal("0.1").toNumber()).toStrictEqual(0.1);
        });
        test("extreme precision", () => {
            expect(
                new Decimal("0." + "0".repeat(100) + "1").toNumber()
            ).toStrictEqual(1e-101);
        });
    });
});
