# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses date-based versioning (YYYYMMDD.MAJOR.MINOR).

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
