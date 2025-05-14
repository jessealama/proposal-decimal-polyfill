import { Decimal } from "../../src/Decimal.mjs";

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
        expect(new Decimal("Infinity").toString()).toStrictEqual("Infinity");
    });
    test("negative infinity", () => {
        expect(new Decimal("-Infinity").toString()).toStrictEqual("-Infinity");
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
