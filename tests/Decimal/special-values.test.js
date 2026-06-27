import {
    NAN,
    POSITIVE_INFINITY,
    NEGATIVE_INFINITY,
    POSITIVE_ZERO,
    NEGATIVE_ZERO,
} from "./special-values.js";

describe("special-value constants", () => {
    test("NAN is NaN", () => {
        expect(NAN.toString()).toStrictEqual("NaN");
    });
    test("POSITIVE_INFINITY is Infinity", () => {
        expect(POSITIVE_INFINITY.toString()).toStrictEqual("Infinity");
    });
    test("NEGATIVE_INFINITY is -Infinity", () => {
        expect(NEGATIVE_INFINITY.toString()).toStrictEqual("-Infinity");
    });
    test("POSITIVE_ZERO is 0", () => {
        expect(POSITIVE_ZERO.toString()).toStrictEqual("0");
    });
    test("NEGATIVE_ZERO is -0", () => {
        expect(NEGATIVE_ZERO.toString()).toStrictEqual("-0");
    });
});
