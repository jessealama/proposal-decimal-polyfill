import { Decimal } from "../../src/Decimal.mjs";

describe("NaN", () => {
    expect(() => new Decimal("NaN").scaledSignificand()).toThrow(RangeError);
});

describe("infinities", () => {
    test("positive throws", () => {
        expect(() => new Decimal("Infinity").scaledSignificand()).toThrow(
            RangeError
        );
    });
    test("negative throws", () => {
        expect(() => new Decimal("-Infinity").scaledSignificand()).toThrow(
            RangeError
        );
    });
});

describe("finite values", () => {
    test("0", () => {
        expect(new Decimal("0").scaledSignificand()).toStrictEqual(0n);
    });
    test("-0", () => {
        expect(new Decimal("-0").scaledSignificand()).toStrictEqual(0n);
    });
    test("simple number, greater than 10, with exponent apparently at limit", () => {
        expect(new Decimal("42E-6143").scaledSignificand()).toStrictEqual(
            42n * 10n ** 32n
        );
    });
    test("simple number between 1 and 10 with exponent apparently at limit", () => {
        expect(new Decimal("4.2E-6143").scaledSignificand()).toStrictEqual(
            42n * 10n ** 32n
        );
    });
    test("simple number with exponent beyond limit", () => {
        expect(new Decimal("4.2E-6150").scaledSignificand()).toStrictEqual(
            42n * 10n ** 25n
        );
    });
});
