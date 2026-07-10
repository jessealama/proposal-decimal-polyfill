# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses date-based versioning (YYYYMMDD.MAJOR.MINOR).

## [20260710.0.0] - 2026-07-10

### Changed

- `round` takes an options bag (`{ digits, roundingMode }`) instead of
  positional arguments (#40)
- `toFixed`, `toPrecision`, and `toExponential` accept the same options
  bag; `toFixed` defaults `digits` to 0, following
  `Number.prototype.toFixed`, and `toExponential` accepts `digits: 0`
- `toFixed` no longer accepts `digits: Infinity`
- Options bags are validated strictly everywhere they are accepted
  (constructor, arithmetic, rounding, formatting): TypeError for a
  non-object bag or wrongly-typed option, RangeError for invalid values,
  even when the receiver is NaN or infinite; unknown keys are ignored
- At most 10000 digits may be requested via the `digits` option

### Fixed

- Sums and differences that cancel exactly follow the IEEE 754 rule for
  the sign of a zero result (#115)
- Rounding an exact zero keeps it at zero under directed rounding modes
  (#116)
- `toExponential` with `digits` requested no longer crashes on
  single-digit mantissas, and rounds excess digits instead of truncating
  them (#114)
- `scale10` results are rounded to the Decimal128 domain (#113)
- `toBigInt` converts from the internal representation rather than
  parsing `toString()` output (#112)
- `remainder` is computed exactly instead of via a rounded quotient
  (#104)
- Results in the subnormal range are quantized at Etiny (gradual
  underflow) (#107)

## [20260708.0.0] - 2026-07-08

### Changed

- The package's entry point is now the bundled `dist/Decimal.mjs`. The
  `exports` field in package.json restricts imports to the bare specifier
  (`import { Decimal } from "proposal-decimal"`); deep imports of package
  internals (e.g. `proposal-decimal/src/...`) and of the bundle path
  (`proposal-decimal/dist/Decimal.mjs`) fail with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- Compiled internal modules (`src/*.mjs`) no longer ship in the published
  package; the TypeScript sources and declaration files still do.
- `Decimal` holds its internal state in ES `#private` fields, so package
  internals (notably the `CoefficientExponent` class) cannot be reached at
  runtime through property access.
- `npm pack`/`npm publish` build the bundle and declarations automatically
  via a `prepack` script.

## [20260616.0.0] - 2026-06-16

### Removed

- `Decimal.Amount` (see [Amount](https://github.com/tc39/proposal-amount))

## [20250613.0.0] - 2025-06-13

### Changed

- Replace rational arithmetic with coefficient-exponent representation for real numbers
    - Improves performance and memory usage
    - Maintains exact decimal arithmetic semantics
    - Simplifies internal number representation

## [20250528.1.0] - 2025-05-28

### Added

- Define a component-wise equals method (#38)

## [20250528.0.0] - 2025-05-28

### Added

- Support Infinity and NaN as Amounts (#37)
    - Full IEEE 754 special value support
    - Proper handling of edge cases in arithmetic operations
