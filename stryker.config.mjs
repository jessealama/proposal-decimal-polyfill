// StrykerJS mutation-testing config (spike).
//
// We mutate the TypeScript SOURCE (src/Decimal.mts) so surviving mutants map
// to real source lines. The test runner is the universal "command" runner,
// which compiles the mutated source with tsc and then runs the existing Jest
// suite against the freshly built src/Decimal.mjs. We use the command runner
// (rather than @stryker-mutator/jest-runner) because this project uses the
// custom jest-light-runner, which Stryker's Jest integration does not drive.
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
    testRunner: "command",
    commandRunner: { command: "npx tsc && npx jest" },
    mutate: ["src/Decimal.mts"],
    reporters: ["clear-text", "html", "progress"],
    // concurrency defaults to (CPU count - 1); override here if needed.
};
