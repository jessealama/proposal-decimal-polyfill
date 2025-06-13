# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project uses date-based versioning (YYYYMMDD.MAJOR.MINOR).

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
