import { CoefficientExponent } from "../../src/CoefficientExponent.mjs";
import { ROUNDING_MODE_CEILING, ROUNDING_MODES } from "../../src/Rounding.mjs";

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
                    .roundToExponent(2, ROUNDING_MODE_CEILING)
                    .toString()
            ).toStrictEqual("-0");
        });
    });
});
