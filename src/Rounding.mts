/**
 * Rounding.mts -- rounding-mode vocabulary shared by Decimal.mts and
 * CoefficientExponent.mts
 *
 * Internal module. It is deliberately not exposed to users of this
 * package: the `exports` field in package.json restricts imports to the
 * main entry point, so this module cannot be deep-imported.
 *
 * @author Jesse Alama <jesse@igalia.com>
 */

export const ROUNDING_MODE_CEILING = "ceil";
export const ROUNDING_MODE_FLOOR = "floor";
export const ROUNDING_MODE_TRUNCATE = "trunc";
export const ROUNDING_MODE_HALF_EVEN = "halfEven";
export const ROUNDING_MODE_HALF_EXPAND = "halfExpand";

export type RoundingMode =
    | "ceil"
    | "floor"
    | "trunc"
    | "halfEven"
    | "halfExpand";

export const ROUNDING_MODES: RoundingMode[] = [
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
    ROUNDING_MODE_TRUNCATE,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODE_HALF_EXPAND,
];
