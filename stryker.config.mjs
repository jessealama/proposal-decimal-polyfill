/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
    testRunner: "command",
    commandRunner: {
        command:
            "./node_modules/.bin/esbuild src/Decimal.mts src/CoefficientExponent.mts src/Rounding.mts" +
            " --format=esm --target=es2020 --outdir=src --out-extension:.js=.mjs" +
            " && ./node_modules/.bin/jest",
    },
    mutate: ["src/*.mts"],
    reporters: ["clear-text", "html", "progress"],
};
