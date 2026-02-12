module.exports = {
    runner: "jest-light-runner",
    transform: { "^.+\\.ts?$": "ts-jest" },
    testEnvironment: "node",
    testRegex: "/tests/.*\\.(test|spec)?\\.(js|ts|tsx|cjs)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "cjs"],
    coverageThreshold: {
        global: {
            lines: 98,
        },
    },
};
