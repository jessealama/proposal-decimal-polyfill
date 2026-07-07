# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses date-based versioning (YYYYMMDD.MAJOR.MINOR).

## [Unreleased]

### Changed

- Restrict imports to the package's main entry point via the `exports`
  field in package.json. Deep imports of package internals (e.g.
  `proposal-decimal/src/...`) now fail with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`.

## [20260616.0.0 ] - 2026-06-16

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
