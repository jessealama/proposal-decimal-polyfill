const babel = require("@babel/core");
const path = require("path");

const pluginPath = path.resolve(__dirname, "../../src/babel-plugin.cjs");

// Load the BigDecimal polyfill
require("../../src/BigDecimal.mjs");

function compileAndRun(code) {
    const result = babel.transformSync(code, {
        plugins: [pluginPath],
        configFile: false,
    });
    // Wrap in a function to get a return value
    const fn = new Function("BigInt", result.code + "\nreturn __result;");
    return fn(BigInt);
}

function compileAndRunExpr(expr) {
    return compileAndRun(`var __result = ${expr};`);
}

describe("babel-plugin-bigdecimal integration", () => {
    describe("decimal literal equality", () => {
        test("equal decimal literals are ===", () => {
            expect(compileAndRunExpr("1.23m === 1.23m")).toBe(true);
        });

        test("equivalent decimal literals with trailing zero are ===", () => {
            expect(compileAndRunExpr("1.2m === 1.20m")).toBe(true);
        });

        test("different decimal literals are not ===", () => {
            expect(compileAndRunExpr("1.23m === 1.24m")).toBe(false);
        });

        test("different decimal literals are !==", () => {
            expect(compileAndRunExpr("1.23m !== 1.24m")).toBe(true);
        });

        test("equal decimal literals are not !==", () => {
            expect(compileAndRunExpr("1.23m !== 1.23m")).toBe(false);
        });
    });

    describe("non-decimal semantics preserved", () => {
        test("number === number", () => {
            expect(compileAndRunExpr("42 === 42")).toBe(true);
        });

        test("number !== number", () => {
            expect(compileAndRunExpr("42 !== 43")).toBe(true);
        });

        test("string === string", () => {
            expect(compileAndRunExpr('"hello" === "hello"')).toBe(true);
        });

        test("null === undefined is false", () => {
            expect(compileAndRunExpr("null === undefined")).toBe(false);
        });

        test("null === null is true", () => {
            expect(compileAndRunExpr("null === null")).toBe(true);
        });

        test("boolean === boolean", () => {
            expect(compileAndRunExpr("true === true")).toBe(true);
        });

        test("NaN === NaN is false", () => {
            expect(compileAndRunExpr("NaN === NaN")).toBe(false);
        });
    });

    describe("valueOf", () => {
        test("valueOf returns the BigDecimalValue", () => {
            const result = compileAndRun(
                "var d = 1.23m; var __result = BigInt.Decimal.isBigDecimal(d.valueOf());"
            );
            expect(result).toBe(true);
        });
    });

    describe("arithmetic with literals", () => {
        test("add two decimal literals", () => {
            const result = compileAndRun(
                "var __result = BigInt.Decimal.add(1.23m, 0.1m).toString();"
            );
            expect(result).toBe("1.33");
        });

        test("subtract decimal literals", () => {
            const result = compileAndRun(
                "var __result = BigInt.Decimal.subtract(1.23m, 0.03m).toString();"
            );
            expect(result).toBe("1.2");
        });

        test("multiply decimal literals", () => {
            const result = compileAndRun(
                "var __result = BigInt.Decimal.multiply(1.5m, 2m).toString();"
            );
            expect(result).toBe("3");
        });
    });

    describe("toString", () => {
        test("decimal literal toString", () => {
            const result = compileAndRun("var __result = (1.23m).toString();");
            expect(result).toBe("1.23");
        });

        test("integer decimal literal toString", () => {
            const result = compileAndRun("var __result = (42m).toString();");
            expect(result).toBe("42");
        });
    });
});
