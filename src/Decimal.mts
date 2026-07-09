/**
 * Decimal.mts -- Decimal128 implementation in JavaScript
 *
 * The purpose of this module is to provide a userland implementation of
 * IEEE 758 Decimal128, which are exact decimal floating point numbers fit into
 * 128 bits. This library provides basic arithmetic operations (addition, multiplication).
 * Its main purpose is to help gather data and experience about using Decimal128
 * in JavaScript programs. Speed is not a concern; the main goal is to simply
 * make Decimal128 values available in some form in JavaScript. In the future,
 * JavaScript may get exact decimal numbers as a built-in data type, which will
 * surely be much faster than what this library can provide.
 *
 * @author Jesse Alama <jesse@igalia.com>
 */

import { CoefficientExponent, formatExponent } from "./CoefficientExponent.mjs";
import {
    flipModeForNegative,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODES,
    type RoundingMode,
} from "./Rounding.mjs";

const NORMAL_EXPONENT_MIN = -6143;
const MAX_SIGNIFICANT_DIGITS = 34;

// The largest adjusted exponent of a finite Decimal128 value (Emax); above it,
// values round to infinity.
const ADJUSTED_EXPONENT_MAX = 6144;
// The smallest quantum exponent of a finite Decimal128 value (Etiny = Emin -
// (precision - 1)). Unlike Emax, which bounds the position of the *leading*
// significant digit, Etiny bounds the position of the *trailing* one: every
// finite Decimal128 value is an integer multiple of 10^Etiny.
const TINY_EXPONENT_MIN = NORMAL_EXPONENT_MIN - (MAX_SIGNIFICANT_DIGITS - 1);

type NaNValue = "NaN";
type InfiniteValue = "Infinity" | "-Infinity";
type FiniteValue = "0" | "-0" | CoefficientExponent;

type Decimal128Value = NaNValue | InfiniteValue | FiniteValue;

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";

function RoundToDecimal128Domain(
    v: CoefficientExponent,
    mode: RoundingMode = ROUNDING_MODE_HALF_EVEN
): Decimal128Value {
    /* c8 ignore start */
    if (v.isZero()) {
        return v.isNegative ? "-0" : "0";
    }
    /* c8 ignore end */

    if (v.isNegative) {
        const reverseRoundingMode = flipModeForNegative(mode);

        let d = RoundToDecimal128Domain(v.negate(), reverseRoundingMode);

        if (d === "Infinity") {
            return "-Infinity";
        }

        if (d === "0") {
            return "-0";
        }

        return (d as CoefficientExponent).negate();
    }

    // The adjusted exponent is the power of ten of the leading significant
    // digit.
    const adjustedExponent = v.exponent + v.coefficient.toString().length - 1;

    // The quantum -- the power of ten of the trailing significant digit -- can
    // sit no more than 33 places below the leading digit (the 34-digit
    // precision limit) and never below Etiny. In the subnormal range the
    // second bound binds, so fewer than 34 digits survive (gradual underflow).
    const targetQuantum = Math.max(
        adjustedExponent - (MAX_SIGNIFICANT_DIGITS - 1),
        TINY_EXPONENT_MIN
    );

    // Round once, directly at the target quantum; rounding to 34 significant
    // digits first and then again at Etiny would double-round. Rounding can
    // only carry the adjusted exponent upward (e.g. 999 -> 1000), never lower
    // it, so the overflow check below is exact on the rounded result.
    const result = v.roundToExponent(targetQuantum, mode);

    // Too small to round to a nonzero multiple of 10^Etiny.
    if (result.isZero()) {
        return "0";
    }

    // Above the largest finite value, round to infinity.
    const roundedAdjustedExponent =
        result.exponent + result.coefficient.toString().length - 1;
    if (roundedAdjustedExponent > ADJUSTED_EXPONENT_MAX) {
        return "Infinity";
    }

    return result;
}

function handleDecimalNotation(s: string, mode: RoundingMode): Decimal128Value {
    if (s.match(/^[+]/)) {
        return handleDecimalNotation(s.substring(1), mode);
    }

    if (s.match(/_/)) {
        return handleDecimalNotation(s.replace(/_/g, ""), mode);
    }

    if ("" === s) {
        throw new SyntaxError("Empty string not permitted");
    }

    if ("." === s) {
        throw new SyntaxError("Lone decimal point not permitted");
    }

    if ("-" === s) {
        throw new SyntaxError("Lone minus sign not permitted");
    }

    if ("-." === s) {
        throw new SyntaxError("Lone minus sign and period not permitted");
    }

    if (s === "NaN") {
        return "NaN";
    }

    if (s.match(/^-?Infinity$/)) {
        return s.match(/^-/) ? "-Infinity" : "Infinity";
    }

    let v = CoefficientExponent.from(s);

    if (v.isZero()) {
        if (v.isNegative) {
            return "-0";
        }
        return "0";
    }

    return RoundToDecimal128Domain(v, mode);
}

export class Decimal {
    readonly #d: FiniteValue | undefined = undefined;
    readonly #isNaN: boolean = false;
    readonly #isFinite: boolean = true;
    readonly #isNegative: boolean = false;

    /**
     * Creates a new Decimal128 value.
     *
     * @param n The value to convert to a Decimal128. Can be a string, number, bigint, or CoefficientExponent.
     *   - String values can be in decimal notation (e.g., "123.45") or scientific notation (e.g., "1.23e+2")
     *   - Special string values "NaN", "Infinity", and "-Infinity" are supported
     *   - Numbers are converted to their string representation
     *   - BigInts are converted to their string representation
     * @param opts Optional configuration object
     * @param opts.roundingMode Specifies the rounding mode to use if rounding is needed during construction.
     *   Valid values are: "ceil", "floor", "trunc", "halfEven", "halfExpand".
     *   Defaults to "halfEven".
     * @throws {SyntaxError} If the string format is invalid
     * @throws {RangeError} If the value cannot be represented as a Decimal128
     *
     * @example
     * new Decimal("123.45")      // 123.45
     * new Decimal("1.23e+2")     // 123
     * new Decimal(123.45)        // 123.45
     * new Decimal(123n)          // 123
     * new Decimal("NaN")         // NaN
     * new Decimal("Infinity")    // Infinity
     * new Decimal("-0")          // -0
     */
    constructor(
        n: string | number | bigint | CoefficientExponent,
        opts?: { roundingMode?: RoundingMode }
    ) {
        let data;
        let s: string;

        // Handle CoefficientExponent directly to avoid toString() with large exponents
        if (n instanceof CoefficientExponent) {
            data = n;
        } else {
            if ("number" === typeof n) {
                s = Object.is(n, -0) ? "-0" : n.toString();
            } else if ("bigint" === typeof n) {
                s = n.toString();
            } else {
                s = n;
            }

            let mode = ROUNDING_MODE_HALF_EVEN;
            if (
                undefined !== opts &&
                "object" === typeof opts &&
                opts.roundingMode !== undefined
            ) {
                mode = opts.roundingMode;
            }

            data = handleDecimalNotation(s, mode as RoundingMode);
        }

        if (data === "NaN") {
            this.#isNaN = true;
            this.#isFinite = false;
        } else if (data === "Infinity") {
            this.#isFinite = false;
        } else if (data === "-Infinity") {
            this.#isFinite = false;
            this.#isNegative = true;
        } else {
            let v = data;
            if (v === "-0") {
                this.#isNegative = true;
            } else if (v === "0") {
                this.#isNegative = false;
            } else {
                this.#isNegative = v.isNegative;
            }
            this.#d = data;
        }
    }

    /**
     * Checks if this Decimal128 value is NaN (Not a Number).
     *
     * @returns {boolean} True if this value is NaN, false otherwise
     */
    public isNaN(): boolean {
        return this.#isNaN;
    }

    /**
     * Checks if this Decimal128 value is finite (not NaN, Infinity, or -Infinity).
     *
     * @returns {boolean} True if this value is finite, false otherwise
     */
    public isFinite(): boolean {
        return this.#isFinite;
    }

    /**
     * Checks if this Decimal128 value is negative.
     * Note that -0 is considered negative, and NaN returns false.
     *
     * @returns {boolean} True if this value is negative (including -0 and -Infinity), false otherwise
     */
    public isNegative(): boolean {
        return this.#isNegative;
    }

    /**
     * Checks if this Decimal128 value is zero (either +0 or -0).
     *
     * @returns {boolean} True if this value is zero, false otherwise (including NaN and infinities)
     */
    public isZero(): boolean {
        if (this.isNaN()) {
            return false;
        }

        if (!this.isFinite()) {
            return false;
        }

        return this.#d === "0" || this.#d === "-0";
    }

    /**
     * Returns the mantissa (significand) of this Decimal128 value.
     * The mantissa is normalized to be in the range [1, 10).
     *
     * @returns {Decimal} The mantissa as a Decimal value in the range [1, 10)
     * @throws {RangeError} If this value is zero (zero has no mantissa)
     */
    public mantissa(): Decimal {
        if (this.isZero()) {
            throw new RangeError("Zero does not have a mantissa");
        }

        if (this.isNegative()) {
            return this.negate().mantissa().negate();
        }

        const ce = this.#d as CoefficientExponent;
        const coefficientStr = ce.coefficient.toString();
        const numDigits = coefficientStr.length;

        // Create a Decimal directly with the mantissa value
        // We know the mantissa will be in the form "d.ddd..." where d is 1-9
        let mantissaStr: string;
        if (numDigits === 1) {
            mantissaStr = coefficientStr; // Single digit, already in [1, 9]
        } else {
            mantissaStr = coefficientStr[0] + "." + coefficientStr.slice(1);
        }

        return new Decimal(mantissaStr);
    }

    /**
     * Scales this Decimal128 value by 10^n.
     * This operation multiplies the value by 10 raised to the power of n.
     *
     * @param {number} n The power of 10 to scale by (must be an integer)
     * @returns {Decimal} A new Decimal value equal to this * 10^n
     * @throws {RangeError} If this value is NaN
     * @throws {RangeError} If this value is infinite
     * @throws {TypeError} If n is not an integer
     */
    public scale10(n: number): Decimal {
        if (this.isNaN()) {
            throw new RangeError("NaN cannot be scaled");
        }

        if (!this.isFinite()) {
            throw new RangeError("Infinity cannot be scaled");
        }

        if (!Number.isInteger(n)) {
            throw new TypeError("Argument must be an integer");
        }

        if (n === 0) {
            return this.#clone();
        }

        let v = this.#d as FiniteValue;

        if (v === "0" || v === "-0") {
            return this.#clone();
        }

        return new Decimal(v.scale10(BigInt(n)));
    }

    #emitExponential(): string {
        let v = this.#d;
        let e = this.exponent();

        if (v === "0" || v === "-0") {
            return v + "e+0";
        }

        let m = this.mantissa();

        let mAsString = m.toFixed({ digits: Infinity });
        return mAsString + formatExponent(e);
    }

    #emitDecimal(): string {
        if (this.isZero()) {
            return this.#isNegative ? "-0" : "0";
        }

        let v = this.#d as CoefficientExponent;
        return v.toString();
    }

    /**
     * Returns a string representation of this Decimal128 value.
     * Uses decimal notation for values with exponents between -6 and 20 (inclusive),
     * and exponential notation otherwise.
     *
     * @returns {string} The string representation of this value
     */
    toString(): string {
        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + POSITIVE_INFINITY;
        }

        if (this.isZero()) {
            return this.#isNegative ? "-0" : "0";
        }

        let e = this.exponent();

        // Follow JavaScript Number.toString() behavior:
        // Use exponential notation if the exponent is >= 21 or <= -7
        if (e >= 21 || e <= -7) {
            return this.#emitExponential();
        }

        return this.#emitDecimal();
    }

    /**
     * Returns a string representation of this Decimal128 value in fixed-point notation.
     *
     * @param {Object} [opts] Optional configuration object
     * @param {number} [opts.digits] The number of digits to appear after the decimal point.
     *   Must be an integer >= 0. If not specified, uses the default toString() behavior.
     *   If Infinity, returns the full decimal representation without exponential notation.
     * @returns {string} The string representation in fixed-point notation
     * @throws {TypeError} If opts is not an object
     * @throws {RangeError} If digits is negative, NaN, or not an integer (except Infinity)
     */
    toFixed(opts?: { digits?: number }): string {
        if (undefined === opts) {
            return this.toString();
        }

        if ("object" !== typeof opts) {
            throw new TypeError("Argument must be an object");
        }

        if (undefined === opts.digits) {
            return this.toString();
        }

        let n = opts.digits;

        if (n < 0) {
            throw new RangeError("Argument must be greater than or equal to 0");
        }

        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return this.isNegative()
                ? "-" + POSITIVE_INFINITY
                : POSITIVE_INFINITY;
        }

        if (n === Infinity) {
            return this.#emitDecimal();
        }

        if (!Number.isInteger(n)) {
            throw new RangeError(
                "Argument must be an integer or positive infinity"
            );
        }

        let rounded = this.round(n);
        let roundedRendered = rounded.#emitDecimal();

        if (roundedRendered.match(/[.]/)) {
            let [lhs, rhs] = roundedRendered.split(/[.]/);
            let numFractionDigits = rhs.length;
            if (numFractionDigits <= n) {
                return lhs + "." + rhs + "0".repeat(n - numFractionDigits);
            }
        }

        if (n === 0) {
            return roundedRendered;
        }

        return roundedRendered + "." + "0".repeat(n);
    }

    /**
     * Returns a string representation of this Decimal128 value with a specified number of significant digits.
     *
     * @param {Object} [opts] Optional configuration object
     * @param {number} [opts.digits] The number of significant digits. Must be a positive integer.
     * @returns {string} The string representation with the specified precision
     * @throws {TypeError} If opts is not an object
     * @throws {RangeError} If digits is not a positive integer
     */
    toPrecision(opts?: { digits?: number }): string {
        if (undefined === opts) {
            return this.toString();
        }

        if ("object" !== typeof opts) {
            throw new TypeError("Argument must be an object");
        }

        if (undefined === opts.digits) {
            return this.toString();
        }

        let precision = opts.digits;

        if (precision <= 0) {
            throw new RangeError("Argument must be positive");
        }

        if (!Number.isInteger(precision)) {
            throw new RangeError("Argument must be an integer");
        }

        if (this.isNaN()) {
            return "NaN";
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + "Infinity";
        }

        if (this.isZero()) {
            let p = this.isNegative() ? "-" : "";

            if (precision === 1) {
                return p + "0";
            }

            let additionalZeroes = "0".repeat(precision - 1);

            return p + "0." + additionalZeroes;
        }

        let d = this.#d as CoefficientExponent;
        return d.toPrecision(precision);
    }

    /**
     * Returns a string representation of this Decimal128 value in exponential notation.
     *
     * @param {Object} [opts] Optional configuration object
     * @param {number} [opts.digits] The number of digits after the decimal point in the mantissa.
     *   Must be a positive integer.
     * @returns {string} The string representation in exponential notation
     * @throws {TypeError} If opts is not an object
     * @throws {RangeError} If digits is not a positive integer
     */
    toExponential(opts?: { digits?: number }): string {
        if (this.isNaN()) {
            return "NaN";
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + "Infinity";
        }

        if (undefined === opts) {
            return this.#emitExponential();
        }

        if ("object" !== typeof opts) {
            throw new TypeError("Argument must be an object");
        }

        if (undefined === opts.digits) {
            return this.#emitExponential();
        }

        let n = opts.digits;

        if (n <= 0) {
            throw new RangeError("Argument must be positive");
        }

        if (!Number.isInteger(n)) {
            throw new RangeError("Argument must be an integer");
        }

        let s = this.abs().#emitExponential();

        let [lhs, rhsWithEsign] = s.split(/[.]/);

        let [rhs, exp] = rhsWithEsign.split(/[eE]/);

        let p = this.isNegative() ? "-" : "";

        if (rhs.length <= n) {
            return p + lhs + "." + rhs + "0".repeat(n - rhs.length) + "e" + exp;
        }

        return p + lhs + "." + rhs.substring(0, n) + "e" + exp;
    }

    #isInteger(): boolean {
        let d = this.#d as FiniteValue;

        if (d === "0" || d === "-0") {
            return true;
        }

        return d.isInteger();
    }

    /**
     * Converts this Decimal128 value to a BigInt.
     * The value must be an integer (no fractional part).
     *
     * @returns {bigint} The BigInt representation of this value
     * @throws {RangeError} If this value is NaN
     * @throws {RangeError} If this value is infinite
     * @throws {RangeError} If this value has a fractional part
     */
    toBigInt(): bigint {
        if (this.isNaN()) {
            throw new RangeError("NaN cannot be converted to a BigInt");
        }

        if (!this.isFinite()) {
            throw new RangeError("Infinity cannot be converted to a BigInt");
        }

        if (!this.#isInteger()) {
            throw new RangeError(
                "Non-integer decimal cannot be converted to a BigInt"
            );
        }

        let v = this.#d as FiniteValue;

        if (v === "0" || v === "-0") {
            return 0n;
        }

        return v.toBigInt();
    }

    /**
     * Converts this Decimal128 value to a JavaScript number.
     * Note that this may lose precision as JavaScript numbers are 64-bit floats.
     *
     * @returns {number} The JavaScript number representation of this value
     */
    toNumber(): number {
        if (this.isNaN()) {
            return NaN;
        }

        if (!this.isFinite()) {
            if (this.isNegative()) {
                return -Infinity;
            }

            return Infinity;
        }

        return Number(this.toString());
    }

    /**
     * Compares this Decimal128 value with another Decimal128 value.
     *
     * @param {Decimal} x The value to compare with
     * @returns {number} Returns:
     *   - NaN if either value is NaN
     *   - -1 if this < x
     *   - 0 if this equals x
     *   - 1 if this > x
     */
    compare(x: Decimal): number {
        if (this.isNaN() || x.isNaN()) {
            return NaN;
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return 0;
                }

                return this.isNegative() ? -1 : 1;
            }

            if (this.isNegative()) {
                return -1;
            }

            return 1;
        }

        if (!x.isFinite()) {
            return x.isNegative() ? 1 : -1;
        }

        if (this.isZero()) {
            if (x.isZero()) {
                return 0;
            }

            return x.isNegative() ? 1 : -1;
        }

        if (x.isZero()) {
            return this.isNegative() ? -1 : 1;
        }

        let ourCohort = this.#d as CoefficientExponent;
        let theirCohort = x.#d as CoefficientExponent;

        return ourCohort.cmp(theirCohort);
    }

    /**
     * Checks if this Decimal128 value is equal to another Decimal128 value.
     * NaN is not equal to any value, including itself.
     *
     * @param {Decimal} other The value to compare with
     * @returns {boolean} True if the values are mathematically equal, false otherwise
     */
    equals(other: Decimal): boolean {
        if (this.isNaN() || other.isNaN()) {
            return false;
        }

        if (!this.isFinite()) {
            if (other.isFinite()) {
                return false;
            }

            return this.isNegative() === other.isNegative();
        }

        if (this.isZero()) {
            return other.isZero();
        }

        return 0 === this.compare(other);
    }

    /**
     * Checks if this Decimal128 value is not equal to another Decimal128 value.
     * Note that NaN.notEquals(NaN) returns false, as NaN comparisons always return false.
     *
     * @param {Decimal} other The value to compare with
     * @returns {boolean} True if the values are not mathematically equal, false if equal or if either is NaN
     */
    notEquals(other: Decimal): boolean {
        if (this.isNaN() || other.isNaN()) {
            return false;
        }

        return 0 !== this.compare(other);
    }

    /**
     * Checks if this Decimal128 value is less than another Decimal128 value.
     *
     * @param {Decimal} x The value to compare with
     * @returns {boolean} True if this < x, false otherwise (including when either value is NaN)
     */
    lessThan(x: Decimal): boolean {
        return this.compare(x) === -1;
    }

    /**
     * Checks if this Decimal128 value is less than or equal to another Decimal128 value.
     *
     * @param {Decimal} x The value to compare with
     * @returns {boolean} True if this <= x, false otherwise (including when either value is NaN)
     */
    lessThanOrEqual(x: Decimal): boolean {
        // No explicit NaN guard is needed (cf. lessThan): compare() returns NaN
        // when either operand is NaN, and NaN === -1 and NaN === 0 are both
        // false, so a NaN operand correctly yields false.
        let c = this.compare(x);

        return c === -1 || c === 0;
    }

    /**
     * Checks if this Decimal128 value is greater than another Decimal128 value.
     *
     * @param {Decimal} x The value to compare with
     * @returns {boolean} True if this > x, false otherwise (including when either value is NaN)
     */
    greaterThan(x: Decimal): boolean {
        return this.compare(x) === 1;
    }

    /**
     * Checks if this Decimal128 value is greater than or equal to another Decimal128 value.
     *
     * @param {Decimal} x The value to compare with
     * @returns {boolean} True if this >= x, false otherwise (including when either value is NaN)
     */
    greaterThanOrEqual(x: Decimal): boolean {
        // No explicit NaN guard is needed (cf. greaterThan): compare() returns
        // NaN when either operand is NaN, and NaN === 1 and NaN === 0 are both
        // false, so a NaN operand correctly yields false.
        let c = this.compare(x);

        return c === 1 || c === 0;
    }

    /**
     * Returns the absolute value of this Decimal128 value.
     *
     * @returns {Decimal} A new Decimal value that is the absolute value of this value
     */
    abs(): Decimal {
        if (this.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            if (this.isNegative()) {
                return this.negate();
            }

            return this.#clone();
        }

        if (this.isNegative()) {
            return this.negate();
        }

        return this.#clone();
    }

    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x The Decimal128 value to add to this value.
     * @param opts Optional object containing additional options for the operation.
     *   @property {roundingMode} Specifies the rounding mode to use
     *   when performing the addition. Valid values are defined in the `RoundingMode`
     *   enumeration, such as `ROUNDING_MODE_HALF_EVEN`, `ROUNDING_MODE_TRUNCATE`,
     *   `ROUNDING_MODE_CEILING`, and `ROUNDING_MODE_FLOOR`. Defaults to
     *   `ROUNDING_MODE_HALF_EVEN`.
     */
    add(x: Decimal, opts?: { roundingMode?: RoundingMode }): Decimal {
        let mode: RoundingMode = ROUNDING_MODE_HALF_EVEN;

        if (
            undefined !== opts &&
            "object" === typeof opts &&
            opts.roundingMode !== undefined
        ) {
            mode = opts.roundingMode;
        }

        if (this.isNaN() || x.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return x.#clone();
                }

                return new Decimal(NAN);
            }

            return this.#clone();
        }

        if (!x.isFinite()) {
            return x.#clone();
        }

        if (this.isZero()) {
            return x.#clone();
        }

        if (x.isZero()) {
            return this.#clone();
        }

        let ourCohort = this.#d as CoefficientExponent;
        let theirCohort = x.#d as CoefficientExponent;
        let sum = ourCohort.add(theirCohort);

        if (sum.isZero()) {
            if (this.#isNegative) {
                return new Decimal("-0");
            }

            return new Decimal("0");
        }

        let rounded = RoundToDecimal128Domain(sum, mode) as CoefficientExponent;

        return new Decimal(rounded);
    }

    /**
     * Subtract another Decimal128 value from this Decimal128 value.
     *
     * @param {Decimal} x The Decimal128 value to subtract from this value
     * @param {Object} [opts] Optional object containing additional options for the operation
     * @param {RoundingMode} [opts.roundingMode] Specifies the rounding mode to use
     *   when performing the subtraction. Valid values are: "ceil", "floor", "trunc",
     *   "halfEven", "halfExpand". Defaults to "halfEven".
     * @returns {Decimal} A new Decimal value representing the difference
     */
    subtract(x: Decimal, opts?: { roundingMode?: RoundingMode }): Decimal {
        let mode: RoundingMode = ROUNDING_MODE_HALF_EVEN;

        if (
            undefined !== opts &&
            "object" === typeof opts &&
            opts.roundingMode !== undefined
        ) {
            mode = opts.roundingMode;
        }

        if (this.isNaN() || x.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return new Decimal(NAN);
                }

                return this.#clone();
            }

            return this.#clone();
        }

        if (!x.isFinite()) {
            return x.negate();
        }

        if (this.isZero()) {
            return x.negate();
        }

        if (x.isZero()) {
            return this.#clone();
        }

        let ourCohort = this.#d as CoefficientExponent;
        let theirCohort = x.#d as CoefficientExponent;
        let difference = ourCohort.subtract(theirCohort);

        if (difference.isZero()) {
            return new Decimal("0");
        }

        let rounded = RoundToDecimal128Domain(
            difference,
            mode
        ) as CoefficientExponent;

        return new Decimal(rounded);
    }

    /**
     * Multiply this Decimal128 value by another Decimal128 value.
     *
     * @param {Decimal} x The Decimal128 value to multiply by
     * @param {Object} [opts] Optional object containing additional options for the operation
     * @param {RoundingMode} [opts.roundingMode] Specifies the rounding mode to use
     *   when performing the multiplication. Valid values are: "ceil", "floor", "trunc",
     *   "halfEven", "halfExpand". Defaults to "halfEven".
     * @returns {Decimal} A new Decimal value representing the product
     */
    multiply(x: Decimal, opts?: { roundingMode?: RoundingMode }): Decimal {
        let mode: RoundingMode = ROUNDING_MODE_HALF_EVEN;

        if (
            undefined !== opts &&
            "object" === typeof opts &&
            opts.roundingMode !== undefined
        ) {
            mode = opts.roundingMode;
        }

        if (this.isNaN() || x.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            if (x.isZero()) {
                return new Decimal(NAN);
            }

            if (this.isNegative() === x.isNegative()) {
                return new Decimal(POSITIVE_INFINITY);
            }

            return new Decimal(NEGATIVE_INFINITY);
        }

        if (!x.isFinite()) {
            if (this.isZero()) {
                return new Decimal(NAN);
            }

            if (this.isNegative() === x.isNegative()) {
                return new Decimal(POSITIVE_INFINITY);
            }

            return new Decimal(NEGATIVE_INFINITY);
        }

        // The product's sign is the exclusive-or of the operand signs, which
        // CoefficientExponent.multiply already applies to non-zero results. A
        // zero operand still carries that sign, so compute it here directly
        // rather than deferring to a sign-negating recursive call.
        if (this.isZero() || x.isZero()) {
            return new Decimal(
                this.isNegative() !== x.isNegative() ? "-0" : "0"
            );
        }

        let ourCohort = this.#d as CoefficientExponent;
        let theirCohort = x.#d as CoefficientExponent;

        let product = ourCohort.multiply(theirCohort);
        let rounded = RoundToDecimal128Domain(
            product,
            mode
        ) as CoefficientExponent;

        return new Decimal(rounded);
    }

    #clone(): Decimal {
        if (this.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            return new Decimal(
                this.isNegative() ? NEGATIVE_INFINITY : POSITIVE_INFINITY
            );
        }

        let v = this.#d as FiniteValue;

        return new Decimal(v);
    }

    /**
     * Divide this Decimal128 value by another Decimal128 value.
     *
     * @param {Decimal} x The Decimal128 value to divide by (divisor)
     * @param {Object} [opts] Optional object containing additional options for the operation
     * @param {RoundingMode} [opts.roundingMode] Specifies the rounding mode to use
     *   when performing the division. Valid values are: "ceil", "floor", "trunc",
     *   "halfEven", "halfExpand". Defaults to "halfEven".
     * @returns {Decimal} A new Decimal value representing the quotient
     */
    divide(x: Decimal, opts?: { roundingMode?: RoundingMode }): Decimal {
        let mode: RoundingMode = ROUNDING_MODE_HALF_EVEN;

        if (
            undefined !== opts &&
            "object" === typeof opts &&
            opts.roundingMode !== undefined
        ) {
            mode = opts.roundingMode;
        }

        if (this.isNaN() || x.isNaN()) {
            return new Decimal(NAN);
        }

        if (x.isZero()) {
            return new Decimal(NAN);
        }

        // The quotient's sign is the exclusive-or of the operand signs, even
        // when the dividend is zero (e.g. 0 / -1 is -0, -0 / -1 is +0). This
        // also covers a zero dividend with an infinite divisor below.
        if (this.isZero()) {
            return new Decimal(
                this.isNegative() !== x.isNegative() ? "-0" : "0"
            );
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                return new Decimal(NAN);
            }

            if (this.isNegative() === x.isNegative()) {
                return new Decimal(POSITIVE_INFINITY);
            }

            if (this.isNegative()) {
                return this.#clone();
            }

            return new Decimal(NEGATIVE_INFINITY);
        }

        if (!x.isFinite()) {
            if (this.isNegative() === x.isNegative()) {
                return new Decimal("0");
            }

            return new Decimal("-0");
        }

        // CoefficientExponent.divide applies the exclusive-or of the operand
        // signs to its result, so no sign-based recursion is needed here.
        let ourV = this.#d as CoefficientExponent;
        let theirV = x.#d as CoefficientExponent;
        let quotient = ourV.divide(theirV);
        let rounded = RoundToDecimal128Domain(
            quotient,
            mode
        ) as CoefficientExponent;

        return new Decimal(rounded);
    }

    /**
     * Rounds this Decimal128 value to a specified number of decimal places.
     *
     * @param {number} [numDecimalDigits=0] The number of decimal places to round to.
     *   Must be a non-negative integer.
     * @param {RoundingMode} [mode="halfEven"] The rounding mode to use.
     *   Valid values are: "ceil", "floor", "trunc", "halfEven", "halfExpand".
     * @returns {Decimal} A new Decimal value rounded to the specified number of decimal places
     * @throws {RangeError} If the rounding mode is invalid
     * @throws {RangeError} If numDecimalDigits is negative or not an integer
     */
    round(
        numDecimalDigits: number = 0,
        mode: RoundingMode = ROUNDING_MODE_HALF_EVEN
    ): Decimal {
        if (!ROUNDING_MODES.includes(mode)) {
            throw new RangeError(`Invalid rounding mode "${mode}"`);
        }

        if (!Number.isInteger(numDecimalDigits) || numDecimalDigits < 0) {
            throw new RangeError("Invalid number of decimal digits");
        }

        if (numDecimalDigits > 1e9) {
            throw new RangeError("Too many decimal digits requested");
        }

        if (this.isNaN() || !this.isFinite()) {
            return this.#clone();
        }

        if (this.isZero()) {
            return this.#clone();
        }

        let v = this.#d as CoefficientExponent;
        let roundedV = v.round(numDecimalDigits, mode);

        if (roundedV.isZero()) {
            return new Decimal(v.isNegative ? "-0" : "0");
        }

        return new Decimal(roundedV);
    }

    /**
     * Returns the negation of this Decimal128 value.
     *
     * @returns {Decimal} A new Decimal value with the opposite sign
     */
    negate(): Decimal {
        if (this.isNaN()) {
            return this.#clone();
        }

        if (!this.isFinite()) {
            return new Decimal(
                this.isNegative() ? POSITIVE_INFINITY : NEGATIVE_INFINITY
            );
        }

        let v = this.#d as FiniteValue;

        if (v === "0") {
            return new Decimal("-0");
        }

        if (v === "-0") {
            return new Decimal("0");
        }

        return new Decimal(v.negate());
    }

    /**
     * Returns the remainder of this Decimal128 value divided by another Decimal128 value.
     * The result has the same sign as the dividend (this value).
     *
     * @param {Decimal} d The divisor
     * @returns {Decimal} The remainder after division
     */
    remainder(d: Decimal): Decimal {
        if (this.isNaN() || d.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            return new Decimal(NAN);
        }

        if (!d.isFinite()) {
            return this.#clone();
        }

        if (d.isZero()) {
            return new Decimal(NAN);
        }

        // A zero dividend is its own remainder, keeping its sign.
        if (this.isZero()) {
            return this.#clone();
        }

        // The remainder is computed exactly: align both operands to a common
        // quantum and take the bigint remainder of their coefficients. The
        // identity this - d * trunc(this / d) is not usable here because
        // divide() rounds the quotient to 34 significant digits: once the
        // quotient reaches 10^34, the rounding error in its truncated value
        // makes the "remainder" arbitrarily larger than the divisor.
        let ourV = this.#d as CoefficientExponent;
        let theirV = d.#d as CoefficientExponent;
        let minExp = Math.min(ourV.exponent, theirV.exponent);
        let ourCoefficient =
            ourV.coefficient * 10n ** BigInt(ourV.exponent - minExp);
        let theirCoefficient =
            theirV.coefficient * 10n ** BigInt(theirV.exponent - minExp);
        let remainderCoefficient = ourCoefficient % theirCoefficient;

        // The remainder keeps the dividend's sign (an identity of truncated
        // division) even when it is exactly zero (e.g. -1 % 1 is -0).
        if (remainderCoefficient === 0n) {
            return new Decimal(this.isNegative() ? "-0" : "0");
        }

        // The exact remainder of two in-range values is itself in range
        // (writing |this| = X * 10^a and |d| = D * 10^b, either the quotient
        // is zero and the remainder is |this|, or |this| >= |d| forces
        // digits(D) + b - min(a, b) <= digits(X) <= 34), so rounding is a
        // no-op except for operands that already sit below Decimal128's
        // minimum quantum of 10^-6176.
        return new Decimal(
            RoundToDecimal128Domain(
                new CoefficientExponent(
                    remainderCoefficient,
                    minExp,
                    this.isNegative()
                )
            )
        );
    }

    /**
     * Checks if this Decimal128 value is a normal number.
     * A normal number is a finite non-zero number with an exponent in the normal range.
     *
     * @returns {boolean} True if this is a normal number, false otherwise
     * @throws {RangeError} If this value is NaN, infinite, or zero
     */
    isNormal(): boolean {
        if (this.isNaN()) {
            throw new RangeError("Cannot determine whether NaN is normal");
        }

        if (!this.isFinite()) {
            throw new RangeError(
                "Only finite numbers can be said to be normal or not"
            );
        }

        if (this.isZero()) {
            throw new RangeError(
                "Only non-zero numbers can be said to be normal or not"
            );
        }

        // "normal" is defined (IEEE 754 / General Decimal Arithmetic) as a
        // finite non-zero value whose adjusted exponent is >= Emin. There is no
        // upper bound to check: any finite value already has an adjusted
        // exponent <= Emax (anything larger overflows to Infinity on
        // construction), so a finite non-zero value is normal exactly when it
        // is not subnormal.
        let exp = this.#unrestrictedExponent();
        return exp >= NORMAL_EXPONENT_MIN;
    }

    /**
     * Checks if this Decimal128 value is a subnormal number.
     * A subnormal number is a finite non-zero number with an exponent below the normal range.
     *
     * @returns {boolean} True if this is a subnormal number, false if normal or zero
     * @throws {RangeError} If this value is NaN or infinite
     */
    isSubnormal(): boolean {
        if (this.isNaN()) {
            throw new RangeError("Cannot determine whether NaN is subnormal");
        }

        if (!this.isFinite()) {
            throw new RangeError(
                "Only finite numbers can be said to be subnormal or not"
            );
        }

        if (this.isZero()) {
            return false;
        }

        let exp = this.#unrestrictedExponent();
        return exp < NORMAL_EXPONENT_MIN;
    }

    /**
     * Returns the exponent of this Decimal128 value, regardless of whether it is normal or subnormal.
     * @private
     */
    #unrestrictedExponent(): number {
        const v = this.#d as CoefficientExponent;
        // Callers exclude zero, and the coefficient is a sign-independent magnitude.
        const numDigits = v.coefficient.toString().length;
        return v.exponent + numDigits - 1;
    }

    /**
     * Returns the adjusted exponent of this Decimal128 value: the exponent
     * of the most significant digit when written in scientific notation.
     * For subnormal values this ranges down to Etiny (Emin - (precision - 1)
     * = -6176); it is reported truthfully rather than clamped to Emin.
     *
     * @returns {number} The exponent value
     * @throws {RangeError} If this value is NaN or infinite
     */
    exponent(): number {
        if (this.isNaN()) {
            throw new RangeError("Cannot determine exponent for NaN");
        }

        if (!this.isFinite()) {
            throw new RangeError(
                "Cannot determine exponent for an infinite value"
            );
        }

        // Zero has no significant digits and so no meaningful adjusted
        // exponent; report Emin by convention.
        if (this.isZero()) {
            return NORMAL_EXPONENT_MIN;
        }

        return this.#unrestrictedExponent();
    }

    /**
     * Returns the significand (coefficient) of this Decimal128 value.
     * The significand is the integer representation of the significant digits.
     *
     * @returns {bigint} The significand as a BigInt
     * @throws {RangeError} If this value is NaN or infinite
     */
    significand(): bigint {
        if (this.isNaN()) {
            throw new RangeError("NaN does not have a scaled significand");
        }

        if (!this.isFinite()) {
            throw new RangeError("Infinity does not have a scaled significand");
        }

        if (this.isZero()) {
            return 0n;
        }

        let v = this.#d as CoefficientExponent;
        return v.coefficient;
    }
}

Decimal.prototype.valueOf = function () {
    throw TypeError("Decimal.prototype.valueOf throws unconditionally");
};
