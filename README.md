# proposal-decimal—A polyfill for the decimal proposal (exact decimal numbers for JavaScript)

This library is a prototype for the [decimal proposal](https://github.com/tc39/proposal-decimal). There should be no
observable difference between what this library does and what the proposal
is [supposed to do](http://tc39.es/proposal-decimal/). If you find a mismatch between what this code does and what the
decimal proposal says it should do, please file [an issue](https://github.com/jessealama/proposal-decimal-polyfill/issues)
in this repo.

This package is a prototype and is not intended for production use. (The decimal proposal is currently
at [Stage 1](https://tc39.es/process-document/) in the Ecma TC39 process.) Speed is important, but it is less important
than making sure we follow the spec exactly. However, if you notice that this package is significantly slower than
other decimal implementations, please file [an issue](https://github.com/jessealama/proposal-decimal-polyfill/issues).

## Operations

- absolute value (`abs`)
- negation (`negate`))
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

## Installation

After installing this NPM package, there should be a file `proposal-decimal.mjs` available. Just include that in a
`script` tag and you're good to go. Example:

```html
<script src="path-to-this-package/proposal-decimal.mjs" type="module"></script>
```

## Implementation

This package is written in TypeScript. Unit tests are in Jest. There are other external dependencies.

## Issues

Please file [an issue](https://github.com/jessealama/proposal-decimal-polyfill/issues) if you find a bug or have a
feature request.
