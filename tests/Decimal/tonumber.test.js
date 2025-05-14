import { Decimal } from "../../src/Decimal.mjs";
import { expectDecimal128 } from "./util.js";

describe("NaN", () => {
    test("works", () => {
        expect(new Decimal("NaN").toNumber()).toStrictEqual(NaN);
    });
});

describe("zero", () => {
    test("positive zero", () => {
        expect(new Decimal("0").toNumber()).toStrictEqual(0);
    });
    test("negative zero", () => {
        expect(new Decimal("-0").toNumber()).toStrictEqual(-0);
    });
});

describe("infinity", () => {
    test("positive infinity", () => {
        expect(new Decimal("Infinity").toNumber()).toStrictEqual(Infinity);
    });
    test("negative infinity", () => {
        expect(new Decimal("-Infinity").toNumber()).toStrictEqual(-Infinity);
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
