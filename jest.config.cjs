module.exports = {
    runner: "jest-light-runner",
    testEnvironment: "node",
    testRegex: "/tests/.*\\.(test|spec)?\\.(js|jsx)$",
    moduleFileExtensions: ["js", "jsx", "json", "node"],
    coverageThreshold: {
        global: {
            lines: 98,
        },
    },
};
