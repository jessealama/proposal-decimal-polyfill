"use strict";

const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare((api) => {
    api.assertVersion(7);

    return {
        name: "babel-plugin-bigdecimal",

        manipulateOptions(opts, parserOpts) {
            parserOpts.plugins.push("decimal");
        },

        visitor: {
            Program: {
                enter(path, state) {
                    state.needsEqualsHelper = false;
                    state.needsNotEqualsHelper = false;
                },
                exit(path, state) {
                    const helpers = [];

                    if (state.needsEqualsHelper) {
                        helpers.push(
                            buildEqualsHelper(path.hub.file.ast.program)
                        );
                    }

                    if (state.needsNotEqualsHelper) {
                        helpers.push(
                            buildNotEqualsHelper(path.hub.file.ast.program)
                        );
                    }

                    if (helpers.length > 0) {
                        path.unshiftContainer("body", helpers);
                    }
                },
            },

            DecimalLiteral(path) {
                const value = path.node.value;
                // BigInt.Decimal("1.23")
                path.replaceWith(
                    api.types.callExpression(
                        api.types.memberExpression(
                            api.types.identifier("BigInt"),
                            api.types.identifier("Decimal")
                        ),
                        [api.types.stringLiteral(value)]
                    )
                );
            },

            BinaryExpression(path, state) {
                if (path.node._skipBigDecimalTransform) {
                    return;
                }
                if (path.node.operator === "===") {
                    state.needsEqualsHelper = true;
                    path.replaceWith(
                        api.types.callExpression(
                            api.types.identifier("_bigDecimalEquals"),
                            [path.node.left, path.node.right]
                        )
                    );
                } else if (path.node.operator === "!==") {
                    state.needsEqualsHelper = true;
                    state.needsNotEqualsHelper = true;
                    path.replaceWith(
                        api.types.callExpression(
                            api.types.identifier("_bigDecimalNotEquals"),
                            [path.node.left, path.node.right]
                        )
                    );
                }
            },
        },
    };
});

function buildEqualsHelper() {
    const { types: t } = require("@babel/core");

    // function _bigDecimalEquals(a, b) {
    //     if (a === b) return true;
    //     if (BigInt.Decimal.isBigDecimal(a) && BigInt.Decimal.isBigDecimal(b)) {
    //         return a.equals(b);
    //     }
    //     return false;
    // }
    return t.functionDeclaration(
        t.identifier("_bigDecimalEquals"),
        [t.identifier("a"), t.identifier("b")],
        t.blockStatement([
            // if (a === b) return true;  (fast path, not rewritten)
            t.ifStatement(
                Object.assign(
                    t.binaryExpression(
                        "===",
                        t.identifier("a"),
                        t.identifier("b")
                    ),
                    { _skipBigDecimalTransform: true }
                ),
                t.returnStatement(t.booleanLiteral(true))
            ),
            // if (BigInt.Decimal.isBigDecimal(a) && BigInt.Decimal.isBigDecimal(b)) { return a.equals(b); }
            t.ifStatement(
                t.logicalExpression(
                    "&&",
                    t.callExpression(
                        t.memberExpression(
                            t.memberExpression(
                                t.identifier("BigInt"),
                                t.identifier("Decimal")
                            ),
                            t.identifier("isBigDecimal")
                        ),
                        [t.identifier("a")]
                    ),
                    t.callExpression(
                        t.memberExpression(
                            t.memberExpression(
                                t.identifier("BigInt"),
                                t.identifier("Decimal")
                            ),
                            t.identifier("isBigDecimal")
                        ),
                        [t.identifier("b")]
                    )
                ),
                t.blockStatement([
                    t.returnStatement(
                        t.callExpression(
                            t.memberExpression(
                                t.identifier("a"),
                                t.identifier("equals")
                            ),
                            [t.identifier("b")]
                        )
                    ),
                ])
            ),
            // return false;
            t.returnStatement(t.booleanLiteral(false)),
        ])
    );
}

function buildNotEqualsHelper() {
    const { types: t } = require("@babel/core");

    // function _bigDecimalNotEquals(a, b) {
    //     return !_bigDecimalEquals(a, b);
    // }
    return t.functionDeclaration(
        t.identifier("_bigDecimalNotEquals"),
        [t.identifier("a"), t.identifier("b")],
        t.blockStatement([
            t.returnStatement(
                t.unaryExpression(
                    "!",
                    t.callExpression(t.identifier("_bigDecimalEquals"), [
                        t.identifier("a"),
                        t.identifier("b"),
                    ])
                )
            ),
        ])
    );
}
