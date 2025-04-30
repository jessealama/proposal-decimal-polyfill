import { Decimal } from "../../src/Decimal128.mjs";

describe("NaN", () => {
    test("throws", () => {
        expect(() => new Decimal("NaN").isSubnormal()).toThrow(RangeError);
    });
});

describe("infinity", () => {
    test("positive throws", () => {
        expect(() => new Decimal("Infinity").isSubnormal()).toThrow(
            RangeError
        );
    });
    test("negative throws", () => {
        expect(() => new Decimal("-Infinity").isSubnormal()).toThrow(
            RangeError
        );
    });
});

describe("limits", () => {
    test("simple number is not subnormal", () => {
        expect(new Decimal("42").isSubnormal()).toStrictEqual(false);
    });
    test("zero is not subnormal", () => {
        expect(new Decimal("0").isSubnormal()).toStrictEqual(false);
    });
    test("simple number with exponent at limit", () => {
        expect(new Decimal("42E-6144").isSubnormal()).toStrictEqual(false);
    });
    test("simple number with exponent beyond limit", () => {
        expect(new Decimal("42E-6145").isSubnormal()).toStrictEqual(true);
    });
});
