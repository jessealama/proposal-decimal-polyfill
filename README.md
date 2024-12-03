# decimal128.js—A userland approximation to IEEE 754 Decimal128 in JavaScript

This library is a prototype for the [decimal proposal](https://github.com/tc39/proposal-decimal). There should be no
observable difference between what this library does and what the proposal
is [supposed to do](http://tc39.es/proposal-decimal/). If you find a mismatch between what this code does and what the
decimal proposal says it should do, please file [an issue](https://github.com/jessealama/decimal128/issues) in
this repo.

## Operations

- absolute value (`abs`)
- negation (`negate`)
- addition (`add`)
- subtraction (`subtract`)
- multiplication (`multiply`)
- division (`divide`)
- remainder (`remainder`)
- rounding (`round`)
- `toString` emitting both decimal and exponential syntax (default is decimal)
- `toFixed` for fixed-point notation
- `toPrecision` for emitting a string with a specified number of significant digits

## Comparisons

- equality (`equals`) to compare for mathematical equality
- less than (`lessThan`) to compare mathematical order

## Implementation

This package is written in TypeScript. Unit tests are in Jest. There are other external dependencies.

## Data model

This package aims to reproduce the IEEE 754 [Decimal128](https://en.wikipedia.org/wiki/Decimal128_floating-point_format)
128-bit decimal floating-point numbers in JavaScript. See the [decimal proposal](https://github.com/tc39/proposal-decimal/).
These **decimal** (not binary!) numbers take up 128 bits per number. This format allows for an exact representation of
decimal numbers with 34 (decimal) significant digits and an exponent between -6143 and 6144. That's a _vast_ amount of
range and precision!

## Issues

Please file [an issue](https://github.com/jessealama/proposal-decimal-polyfill/issues) if you find a bug or have a
feature request.
