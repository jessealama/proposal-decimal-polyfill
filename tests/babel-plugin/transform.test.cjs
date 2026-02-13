const babel = require("@babel/core");
const path = require("path");

const pluginPath = path.resolve(__dirname, "../../src/babel-plugin.cjs");

function transform(code) {
    const result = babel.transformSync(code, {
        plugins: [pluginPath],
        configFile: false,
    });
    return result.code;
}

describe("babel-plugin-bigdecimal transform", () => {
    describe("DecimalLiteral", () => {
        test("transforms integer decimal literal", () => {
            const output = transform("const x = 42m;");
            expect(output).toContain('BigInt.Decimal("42")');
        });

        test("transforms fractional decimal literal", () => {
            const output = transform("const x = 1.23m;");
            expect(output).toContain('BigInt.Decimal("1.23")');
        });

        test("transforms zero decimal literal", () => {
            const output = transform("const x = 0m;");
            expect(output).toContain('BigInt.Decimal("0")');
        });

        test("transforms negative decimal literal in expression", () => {
            const output = transform("const x = -1.5m;");
            expect(output).toContain('BigInt.Decimal("1.5")');
        });

        test("transforms multiple decimal literals", () => {
            const output = transform("const a = 1.23m; const b = 4.56m;");
            expect(output).toContain('BigInt.Decimal("1.23")');
            expect(output).toContain('BigInt.Decimal("4.56")');
        });
    });

    describe("=== rewriting", () => {
        test("transforms === to _bigDecimalEquals", () => {
            const output = transform("a === b;");
            expect(output).toContain("_bigDecimalEquals(a, b)");
        });

        test("injects _bigDecimalEquals helper", () => {
            const output = transform("a === b;");
            expect(output).toContain("function _bigDecimalEquals(a, b)");
        });

        test("helper contains fast path with real ===", () => {
            const output = transform("a === b;");
            expect(output).toContain("if (a === b) return true");
        });

        test("helper checks isBigDecimal", () => {
            const output = transform("a === b;");
            expect(output).toContain("BigInt.Decimal.isBigDecimal(a)");
            expect(output).toContain("BigInt.Decimal.isBigDecimal(b)");
        });

        test("helper calls .equals()", () => {
            const output = transform("a === b;");
            expect(output).toContain("a.equals(b)");
        });
    });

    describe("!== rewriting", () => {
        test("transforms !== to _bigDecimalNotEquals", () => {
            const output = transform("a !== b;");
            expect(output).toContain("_bigDecimalNotEquals(a, b)");
        });

        test("injects both helpers for !==", () => {
            const output = transform("a !== b;");
            expect(output).toContain("function _bigDecimalEquals(a, b)");
            expect(output).toContain("function _bigDecimalNotEquals(a, b)");
        });

        test("_bigDecimalNotEquals delegates to _bigDecimalEquals", () => {
            const output = transform("a !== b;");
            expect(output).toContain("!_bigDecimalEquals(a, b)");
        });
    });

    describe("helper injection", () => {
        test("no helpers when no === or !==", () => {
            const output = transform("const x = 1.23m;");
            expect(output).not.toContain("_bigDecimalEquals");
            expect(output).not.toContain("_bigDecimalNotEquals");
        });

        test("helpers injected once for multiple ===", () => {
            const output = transform("a === b; c === d;");
            const matches = output.match(/function _bigDecimalEquals/g);
            expect(matches).toHaveLength(1);
        });

        test("no _bigDecimalNotEquals when only === used", () => {
            const output = transform("a === b;");
            expect(output).not.toContain("_bigDecimalNotEquals");
        });
    });
});
