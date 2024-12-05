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

## Data model

There are a few different ways out there to model decimal numbers. The decimal proposal currently intends to use
the IEEE 754 [Decimal128](https://tc39.es/ecma262/#sec-bibliography) decimal floating-point standard. There is one
twist, though: we do not expose the precision (or, officially, _quantum_) of Decimal128 values. A consequnce of this
decision is that we do not support trailing zeroes. Thus, the conversion from "1.2" and "1.20" to Decimal128 values
yields _distinct_ values in the official IEEE 754 Decimal128 universe, bot for the purposes of the decimal proposal,
they are the same. In effect, Decimal128 is a representation of mathematical values having up to 34 significant digits
(but without trailing zeroes) and an exponent range of -6143 to +6144. IEEE 754 Decimal128 specifies rules for how
the precision of the arguments of an operation carry over to the precision of the result. We do not expose this
information. You can think of the Decimal128 values in this package as points on the number line, or mathematical
values.

## Quick start

```javascript
import { Decimal128 } from "proposal-decimal";
let a = new Decimal128("0.1");
let b = new Decimal128("0.2");
let c = a.add(b);
console.log(c.toString() === "0.3"); // true
```

## API

Here are the operations that this package supports:

### Arithmetic

- absolute value (`abs`)
- negation (`negate`)
- addition (`add`)
- subtraction (`subtract`)
- multiplication (`multiply`)
- division (`divide`)
- remainder (`remainder`)

### Rounding

There is a single `round` method that takes a rounding mode as an argument. The rounding modes are:

- "ceil"
- "floor"
- "trunc"
- "halfEven" (the default, as with JS Numbers)
- "halfExpand"

### Serialization

- `toString` emitting both decimal and exponential syntax (like `Number.prototype.toString`)
- `toFixed` for fixed-point notation (like `Number.prototype.toFixed`)
- `toPrecision` for emitting a string with a specified number of significant digits (like `Number.prototype.toPrecision`)

### Conversion

- `toNumber` to convert to a JavaScript Number
- `toBigInt` to convert to a JavaScript BigInt (throws for non-integers)

## Construction

Decimal128 values can be constructed from:

- a String in decimal notation (e.g., `"0.1"`)
- a String in exponential notation (e.g., `"1e-1"`)
- one of the String values `"NaN"`, `"Infinity"`, `"-Infinity"`
- a Number (e.g., `0.1`)
- a BigInt (e.g., `42n`)

## Predicates

- `isNaN` to check for `NaN`
- `isFinite` to check for a finite number
- `isZero` to check for zero
- `isNegative` to check for a negative number

## Comparisons

- equality (`equals`) to compare for mathematical equality
- difference (`notEquals`) to compare for mathematical inequality
- less than (`lessThan`) to compare mathematical order
- less than or equal to (`lessThanOrEquals`) to compare mathematical order
- greater than (`greaterThan`) to compare mathematical order
- greater than or equal to (`greaterThanOrEquals`) to compare mathematical order
- compare (`cmp`) to compare mathematical order

Why not just less-than and equals? The reason for the proliferation of all these comparisons is due to `NaN` and `-0`,
which is not 0). Thus, simply negating `lessThan` does not give you `greaterThanOrEquals`. Even if you know you're
dealing with non-`NaN` values, you need to watch out for `-0`.

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
