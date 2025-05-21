import { Decimal } from "../../src/Decimal.mjs";

const NoArgument = Symbol();

describe("toPrecision", () => {
    describe("simple example > 1", () => {
        let d = new Decimal("123.456");
        describe.each([
            { sign: "positive", input: d },
            { sign: "negative", input: d.negate() },
        ])("$sign", ({ sign, input }) => {
            test.each`
                name                                                                                     | arg              | output
                ${"no arguments"}                                                                        | ${NoArgument}    | ${"123.456"}
                ${"argument is greater than total number of significant digits"}                         | ${{ digits: 7 }} | ${"123.4560"}
                ${"argument is equal to number of significant digits"}                                   | ${{ digits: 6 }} | ${"123.456"}
                ${"argument less than number of significant digits, rounded needed"}                     | ${{ digits: 5 }} | ${"123.46"}
                ${"argument less than number of significant digits, rounded does not change last digit"} | ${{ digits: 4 }} | ${"123.5"}
                ${"argument equals number of integer digits"}                                            | ${{ digits: 3 }} | ${"123"}
                ${"argument less than number of integer digits"}                                         | ${{ digits: 2 }} | ${"1.2e+2"}
                ${"single digit requested"}                                                              | ${{ digits: 1 }} | ${"1e+2"}
            `("$name", ({ arg, output }) => {
                const d = input;
                const s =
                    arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
                const o = sign === "positive" ? output : `-${output}`;
                expect(s).toStrictEqual(o);
            });
        });
    });

    describe("simple example < 1, no need for exponential notation", () => {
        let d = new Decimal("0.000123456");
        describe.each([
            { sign: "positive", input: d },
            { sign: "negative", input: d.negate() },
        ])("$sign", ({ sign, input }) => {
            test.each`
                name                                                                                     | arg              | output
                ${"no arguments"}                                                                        | ${NoArgument}    | ${"0.000123456"}
                ${"argument is greater than total number of significant digits"}                         | ${{ digits: 7 }} | ${"0.0001234560"}
                ${"argument is equal to number of significant digits"}                                   | ${{ digits: 6 }} | ${"0.000123456"}
                ${"argument less than number of significant digits, rounded needed"}                     | ${{ digits: 5 }} | ${"0.00012346"}
                ${"argument less than number of significant digits, rounded does not change last digit"} | ${{ digits: 4 }} | ${"0.0001235"}
                ${"argument equals number of integer digits"}                                            | ${{ digits: 3 }} | ${"0.000123"}
                ${"argument less than number of integer digits"}                                         | ${{ digits: 2 }} | ${"0.00012"}
                ${"single digit requested"}                                                              | ${{ digits: 1 }} | ${"0.0001"}
            `("$name", ({ arg, output }) => {
                const d = input;
                const s =
                    arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
                const o = sign === "positive" ? output : `-${output}`;
                expect(s).toStrictEqual(o);
            });
        });
    });

    describe("simple example < 1, need exponential notation", () => {
        let d = new Decimal("0.00000012345678");
        describe.each([
            { sign: "positive", input: d },
            { sign: "negative", input: d.negate() },
        ])("$sign", ({ sign, input }) => {
            test.each`
                name                                                             | arg              | output
                ${"no arguments"}                                                | ${NoArgument}    | ${"1.2345678e-7"}
                ${"more digits requested than available "}                       | ${{ digits: 9 }} | ${"1.23456780e-7"}
                ${"number of digits requested exactly matches available digits"} | ${{ digits: 8 }} | ${"1.2345678e-7"}
                ${"seven digits requested"}                                      | ${{ digits: 7 }} | ${"1.234568e-7"}
                ${"six digits requested"}                                        | ${{ digits: 6 }} | ${"1.23457e-7"}
                ${"five digits requested"}                                       | ${{ digits: 5 }} | ${"1.2346e-7"}
                ${"four digits requested"}                                       | ${{ digits: 4 }} | ${"1.235e-7"}
                ${"three digits requested"}                                      | ${{ digits: 3 }} | ${"1.23e-7"}
                ${"two digits requested"}                                        | ${{ digits: 2 }} | ${"1.2e-7"}
                ${"single digit requested"}                                      | ${{ digits: 1 }} | ${"1e-7"}
            `("$name", ({ arg, output }) => {
                const d = input;
                const s =
                    arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
                const o = sign === "positive" ? output : `-${output}`;
                expect(s).toStrictEqual(o);
            });
        });
    });

    describe("weird inputs", () => {
        let d = new Decimal("123.456");
        test("non-object argument throws", () => {
            expect(() => d.toPrecision("whatever")).toThrow(TypeError);
        });
        test("object argument given, but has weird property", () => {
            expect(d.toPrecision({ foo: "bar" }).toString()).toStrictEqual(
                "123.456"
            );
        });
        test("non-integer number of digits requested", () => {
            expect(() => d.toPrecision({ digits: 1.72 }).toString()).toThrow(
                RangeError
            );
        });
        test("negative integer number of digits requested", () => {
            expect(() => d.toPrecision({ digits: -42 }).toString()).toThrow(
                RangeError
            );
        });
    });

    describe("NaN", () => {
        let nan = new Decimal("NaN");
        test("works", () => {
            expect(nan.toPrecision()).toStrictEqual("NaN");
        });
        test("works, digist requested", () => {
            expect(nan.toPrecision({ digits: 42 })).toStrictEqual("NaN");
        });
    });

    describe("zero", () => {
        test.each`
            name                                        | input     | arg              | output
            ${"positive zero"}                          | ${" 0"}   | ${NoArgument}    | ${" 0"}
            ${"negative zero"}                          | ${"-0"}   | ${NoArgument}    | ${"-0"}
            ${"zero point zero gets canonicalized"}     | ${" 0.0"} | ${NoArgument}    | ${" 0"}
            ${"zero point zero, one significant digit"} | ${" 0.0"} | ${{ digits: 1 }} | ${" 0"}
        `("$name", ({ input, arg, output }) => {
            const d = new Decimal(input.trim());
            const s = arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
            const o = output.trim();
            expect(s).toStrictEqual(o);
        });
        test("zero with additional digits", () => {
            expect(new Decimal("0").toPrecision({ digits: 2 })).toStrictEqual(
                "0.0"
            );
        });
    });

    describe("infinity", () => {
        let posInf = new Decimal("Infinity");
        let negInf = new Decimal("-Infinity");

        test.each`
            name                                     | input     | arg               | output
            ${"positive infinity"}                   | ${posInf} | ${NoArgument}     | ${" Infinity"}
            ${"positive infinity, digits requested"} | ${posInf} | ${{ digits: 42 }} | ${" Infinity"}
            ${"negative infinity"}                   | ${negInf} | ${NoArgument}     | ${"-Infinity"}
            ${"negative infinity, digits requested"} | ${negInf} | ${{ digits: 42 }} | ${"-Infinity"}
        `("$name", ({ input: d, arg, output }) => {
            const s = arg === NoArgument ? d.toPrecision() : d.toPrecision(arg);
            const o = output.trim();
            expect(s).toStrictEqual(o);
        });
    });

    describe("tests", () => {
        describe("with integer output", () => {
            test.each`
                input     | digits | output
                ${" 0.0"} | ${1}   | ${"0"}
                ${" 1.4"} | ${1}   | ${"1"}
                ${" 1.5"} | ${1}   | ${"2"}
                ${" 1.6"} | ${1}   | ${"2"}
                ${" 2.4"} | ${1}   | ${"2"}
                ${" 2.5"} | ${1}   | ${"2"}
                ${" 2.6"} | ${1}   | ${"3"}
                ${"-0.0"} | ${1}   | ${"-0"}
                ${"-1.4"} | ${1}   | ${"-1"}
                ${"-1.5"} | ${1}   | ${"-2"}
                ${"-1.6"} | ${1}   | ${"-2"}
                ${"-2.4"} | ${1}   | ${"-2"}
                ${"-2.5"} | ${1}   | ${"-2"}
                ${"-2.6"} | ${1}   | ${"-3"}
            `(
                "$input precision($digits) = $output",
                ({ input, digits, output }) => {
                    const s = new Decimal(input.trim()).toPrecision({ digits });
                    expect(s).toStrictEqual(output.trim());
                }
            );
        });
        describe("with decimal output", () => {
            test.each`
                input      | digits | output
                ${" 0.14"} | ${1}   | ${"0.1"}
                ${" 0.15"} | ${1}   | ${"0.2"}
                ${" 0.16"} | ${1}   | ${"0.2"}
                ${" 0.24"} | ${1}   | ${"0.2"}
                ${" 0.25"} | ${1}   | ${"0.2"}
                ${" 0.26"} | ${1}   | ${"0.3"}
                ${"-0.14"} | ${1}   | ${"-0.1"}
                ${"-0.15"} | ${1}   | ${"-0.2"}
                ${"-0.16"} | ${1}   | ${"-0.2"}
                ${"-0.24"} | ${1}   | ${"-0.2"}
                ${"-0.25"} | ${1}   | ${"-0.2"}
                ${"-0.26"} | ${1}   | ${"-0.3"}
            `(
                "$input precision($digits) = $output",
                ({ input, digits, output }) => {
                    const s = new Decimal(input.trim()).toPrecision({ digits });
                    expect(s).toStrictEqual(output.trim());
                }
            );
        });

        describe("with large negative exponent output", () => {
            const d = new Decimal("0.1002500000_0005500000_0008500000_0001");

            describe("positive", () => {
                test.each`
                    digits | output
                    ${3}   | ${"0.100"}
                    ${4}   | ${"0.1003"}
                    ${5}   | ${"0.10025"}
                    ${13}  | ${"0.1002500000001"}
                    ${14}  | ${"0.10025000000006"}
                    ${15}  | ${"0.100250000000055"}
                    ${23}  | ${"0.10025000000005500000001"}
                    ${24}  | ${"0.100250000000055000000009"}
                    ${25}  | ${"0.1002500000000550000000085"}
                `("precision($digits) = $output", ({ digits, output }) => {
                    const s = d.toPrecision({ digits });
                    expect(s).toStrictEqual(output.trim());
                });
            });
            describe("negative", () => {
                const negD = d.negate();
                test.each`
                    digits | output
                    ${3}   | ${"-0.100"}
                    ${4}   | ${"-0.1003"}
                    ${5}   | ${"-0.10025"}
                    ${13}  | ${"-0.1002500000001"}
                    ${14}  | ${"-0.10025000000006"}
                    ${15}  | ${"-0.100250000000055"}
                    ${23}  | ${"-0.10025000000005500000001"}
                    ${24}  | ${"-0.100250000000055000000009"}
                    ${25}  | ${"-0.1002500000000550000000085"}
                `("precision($digits) = $output", ({ digits, output }) => {
                    const s = negD.toPrecision({ digits });
                    expect(s).toStrictEqual(output.trim());
                });
            });
        });

        describe("with large negative exponent output with leading zero in decimal portion", () => {
            const d = new Decimal(
                "0.000_1002500000_0005500000_0008500000_0001"
            );
            //                       "0.000_1234567890_1234567890_1234567890_1234"

            describe("positive", () => {
                test.each`
                    digits | output
                    ${1}   | ${"0.0001"}
                    ${2}   | ${"0.00010"}
                    ${3}   | ${"0.000100"}
                    ${4}   | ${"0.0001003"}
                    ${5}   | ${"0.00010025"}
                    ${13}  | ${"0.0001002500000001"}
                    ${14}  | ${"0.00010025000000006"}
                    ${15}  | ${"0.000100250000000055"}
                    ${23}  | ${"0.00010025000000005500000001"}
                    ${24}  | ${"0.000100250000000055000000009"}
                    ${25}  | ${"0.0001002500000000550000000085"}
                `("precision($digits) = $output", ({ digits, output }) => {
                    const s = d.toPrecision({ digits });
                    expect(s).toStrictEqual(output.trim());
                });
            });
            describe("negative", () => {
                const negD = d.negate();
                test.each`
                    digits | output
                    ${1}   | ${"-0.0001"}
                    ${2}   | ${"-0.00010"}
                    ${3}   | ${"-0.000100"}
                    ${4}   | ${"-0.0001003"}
                    ${5}   | ${"-0.00010025"}
                    ${13}  | ${"-0.0001002500000001"}
                    ${14}  | ${"-0.00010025000000006"}
                    ${15}  | ${"-0.000100250000000055"}
                    ${23}  | ${"-0.00010025000000005500000001"}
                    ${24}  | ${"-0.000100250000000055000000009"}
                    ${25}  | ${"-0.0001002500000000550000000085"}
                `("precision($digits) = $output", ({ digits, output }) => {
                    const s = negD.toPrecision({ digits });
                    expect(s).toStrictEqual(output.trim());
                });
            });
        });
    });
});
