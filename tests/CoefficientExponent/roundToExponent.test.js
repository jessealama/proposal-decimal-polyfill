import { CoefficientExponent } from "../../src/CoefficientExponent.mjs";

const ROUNDING_MODES = ["ceil", "floor", "trunc", "halfEven", "halfExpand"];

describe("roundToExponent", () => {
    describe("zero at a positive target exponent", () => {
        ROUNDING_MODES.forEach((mode) => {
            test(`zero stays zero under ${mode}`, () => {
                expect(
                    CoefficientExponent.from("0")
                        .roundToExponent(2, mode)
                        .toString()
                ).toStrictEqual("0");
            });
        });
        test("negative zero stays zero under ceil", () => {
            expect(
                CoefficientExponent.from("-0")
                    .roundToExponent(2, "ceil")
                    .toString()
            ).toStrictEqual("-0");
        });
    });
});
