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

## Installation

After installing this NPM package (`npm install proposal-decimal`), the `dist` subdirectory contains a single ESM
module, `Decimal128.mjs`. It exports a single class, `Decimal128`.

To use this package in Node.js, you can import the module as follows:

```javascript
import { Decimal128 } from "proposal-decimal";
// your code goes here
// for example:
const x = new Decimal128("0.1");
const y = new Decimal128("0.2");
console.log(x.add(y).toString());
```

To use this package in a browser, try something like this:

```html
<script type="module">
    import { Decimal128 } from "/path/to/dist/Decimal128.mjs";
    // your code goes here
    // for example:
    const x = new Decimal128("0.1");
    const y = new Decimal128("0.2");
    console.log(x.add(y).toString());
</script>
```

## Implementation

This package is written in TypeScript. Unit tests are in Jest. There are other external dependencies.

## Examples

The `examples` subdirectory contains some example code for your inspection.

## Issues

Please file [an issue](https://github.com/jessealama/proposal-decimal-polyfill/issues) if you find a bug or have a
feature request.
