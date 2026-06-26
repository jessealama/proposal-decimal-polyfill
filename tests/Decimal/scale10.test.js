import { Decimal } from "../../src/Decimal.mjs";
import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
} from "./special-values.js";

describe("scale10", () => {
    describe("NaN", () => {
        test("throws", () => {
            expect(() => NAN.scale10(5)).toThrow(RangeError);
            expect(() => NAN.scale10(5)).toThrow("NaN cannot be scaled");
        });
    });
    describe("simple examples", () => {
        test("0", () => {
            expect(POSITIVE_ZERO.scale10(4).toString()).toStrictEqual("0");
        });
        test("42, 4", () => {
            expect(new Decimal("42").scale10(4).toString()).toStrictEqual(
                "420000"
            );
        });
        test("42, -4", () => {
            expect(new Decimal("42").scale10(-4).toString()).toStrictEqual(
                "0.0042"
            );
        });
        test("zero", () => {
            expect(new Decimal("42").scale10(0).toString()).toStrictEqual("42");
        });
        test("non-integer argument", () => {
            expect(() => new Decimal("42").scale10(1.5)).toThrow(TypeError);
            expect(() => new Decimal("42").scale10(1.5)).toThrow(
                "Argument must be an integer"
            );
        });
    });
    describe("infinty", () => {
        test("positive infinity throws", () => {
            expect(() => POSITIVE_INFINITY.scale10(5)).toThrow(RangeError);
            expect(() => POSITIVE_INFINITY.scale10(5)).toThrow(
                "Infinity cannot be scaled"
            );
        });
        test("negative infinity throws", () => {
            expect(() => NEGATIVE_INFINITY.scale10(5)).toThrow(RangeError);
        });
    });
});
