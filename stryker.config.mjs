/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
    testRunner: "command",
    commandRunner: {
        command:
            "./node_modules/.bin/esbuild src/Decimal.mts" +
            " --format=esm --target=es2020 --outfile=src/Decimal.mjs" +
            " && ./node_modules/.bin/jest",
    },
    mutate: ["src/Decimal.mts"],
    reporters: ["clear-text", "html", "progress"],
};
