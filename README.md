# proposal-decimal -- A polyfill for the decimal proposal (exact decimal numbers for JavaScript)

This library is a prototype for the [decimal proposal](https://github.com/tc39/proposal-decimal), implementing BigDecimal via BigInt. It monkey-patches `BigInt.Decimal()` as a constructor with static arithmetic methods.

This package is a prototype and is not intended for production use. (The decimal proposal is currently at [Stage 1](https://tc39.es/process-document/) in the Ecma TC39 process.) Spec compliance takes precedence over performance, but if you notice this package is significantly slower than other decimal implementations, please file [an issue](https://github.com/jessealama/proposal-decimal-polyfill/issues).

## Data model

Decimal values are represented as `inner / 10^scale`, where `inner` is a signed bigint and `scale` is a non-negative integer. Trailing fractional zeros are stripped on construction, so `"1.20"` and `"1.2"` produce the same value. A maximum of 100 fraction digits is supported.

## Quick start

```javascript
import "proposal-decimal";

let a = BigInt.Decimal("0.1");
let b = BigInt.Decimal("0.2");
let c = BigInt.Decimal.add(a, b);
console.log(c.toString() === "0.3"); // true
```

## API

All arithmetic is done via static methods on `BigInt.Decimal`:

### Arithmetic

- `BigInt.Decimal.add(a, b)` -- addition
- `BigInt.Decimal.subtract(a, b)` -- subtraction
- `BigInt.Decimal.multiply(a, b)` -- multiplication
- `BigInt.Decimal.divide(a, b, opts?)` -- division (accepts `{ maximumFractionDigits }`)
- `BigInt.Decimal.remainder(a, b)` -- remainder
- `BigInt.Decimal.abs(a)` -- absolute value
- `BigInt.Decimal.negate(a)` -- negation

### Comparison

- `BigInt.Decimal.compare(a, b)` -- returns -1, 0, or 1
- `BigInt.Decimal.equals(a, b)` -- structural equality

### Rounding

`BigInt.Decimal.round(a, fractionDigits?, roundingMode?)` rounds to the given number of fraction digits. Rounding modes:

- `"ceil"`
- `"floor"`
- `"trunc"`
- `"halfEven"` (default)
- `"halfExpand"`

### Instance methods

- `toString()` -- decimal notation
- `toFixed(digits, roundingMode?)` -- fixed-point notation
- `toPrecision(digits, roundingMode?)` -- specified number of significant digits
- `toExponential(fractionDigits, roundingMode?)` -- exponential notation
- `toNumber()` -- convert to a JavaScript Number
- `toBigInt()` -- convert to a JavaScript BigInt (throws for non-integers)

### Type checking

- `BigInt.Decimal.isBigDecimal(value)` -- check if a value is a BigDecimal
- `BigInt.isInteger(value)` -- extended to recognize BigDecimal values with scale 0

## Construction

`BigInt.Decimal(value)` accepts:

- a String in decimal notation (e.g., `"0.1"`)
- a String in exponential notation (e.g., `"1e-1"`)
- a Number (e.g., `0.1`)
- a BigInt (e.g., `42n`)

Underscores are permitted as numeric separators in strings (e.g., `"1_000.50"`).

## Babel plugin

A Babel plugin is included for `m` decimal literal syntax and structural `===`/`!==` semantics:

```javascript
// Input
let x = 1.23m;
let eq = x === 0.1m;

// Output
let x = BigInt.Decimal("1.23");
let eq = BigInt.Decimal.equals(x, BigInt.Decimal("0.1"));
```

Configure it as `"proposal-decimal/babel-plugin"` in your Babel config.

## Installation

```
npm install proposal-decimal
```

Import the module to install the `BigInt.Decimal` polyfill:

```javascript
import "proposal-decimal";
```

## Implementation

This package is written in TypeScript. Unit tests are in Jest.

## Issues

Please file [an issue](https://github.com/jessealama/proposal-decimal-polyfill/issues) if you find a bug or have a feature request.
