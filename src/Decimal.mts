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

import {
    RoundingMode,
    ROUNDING_MODES,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODE_TRUNCATE,
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
} from "./common.mjs";
import { Rational } from "./Rational.mjs";

const NORMAL_EXPONENT_MIN = -6143;
const NORMAL_EXPONENT_MAX = 6144;
const MAX_SIGNIFICANT_DIGITS = 34;

type NaNValue = "NaN";
type InfiniteValue = "Infinity" | "-Infinity";
type FiniteValue = "0" | "-0" | Rational;

type Decimal128Value = NaNValue | InfiniteValue | FiniteValue;

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";

function RoundToDecimal128Domain(
    v: Rational,
    mode: RoundingMode = ROUNDING_MODE_HALF_EVEN
): Decimal128Value {
    /* c8 ignore start */
    if (v.isZero()) {
        return "0";
    }
    /* c8 ignore end */

    if (v.isNegative) {
        let reverseRoundingMode = mode;
        if (mode === ROUNDING_MODE_FLOOR) {
            reverseRoundingMode = ROUNDING_MODE_CEILING;
        } else if (mode === ROUNDING_MODE_CEILING) {
            reverseRoundingMode = ROUNDING_MODE_FLOOR;
        }

        let d = RoundToDecimal128Domain(v.negate(), reverseRoundingMode);

        /* c8 ignore start */
        if (d === "Infinity") {
            return "-Infinity";
        }
        /* c8 ignore end */

        /* c8 ignore start */
        if (d === "0") {
            return "-0";
        }
        /* c8 ignore end */

        return (d as Rational).negate();
    }

    let e = v.intLog10();
    let te = e - 33n;

    if (te < -6176n) {
        te = -6176n;
    }

    let rat10 = new Rational(10n, 1n);

    let m = v.scale10(0n - te);

    let rounded = m.ApplyRoundingModeToPositive(mode);

    /* c8 ignore start */
    if (rounded.cmp(rat10.scale10(34n)) === 0) {
        te = te + 1n;
        rounded = rat10.scale10(33n);
    }
    /* c8 ignore end */

    if (te > 6111n) {
        return "Infinity";
    }

    if (rounded.isZero()) {
        return "0";
    }

    return rounded.scale10(te);
}

function handleDecimalNotation(s: string): Decimal128Value {
    if (s.match(/^[+]/)) {
        return handleDecimalNotation(s.substring(1));
    }

    if (s.match(/_/)) {
        return handleDecimalNotation(s.replace(/_/g, ""));
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

    let v = Rational.fromString(s);

    if (v.isZero()) {
        if (s.match(/^-/)) {
            return "-0";
        }

        return "0";
    }

    return RoundToDecimal128Domain(v);
}

export class Decimal {
    private readonly d: FiniteValue | undefined = undefined;
    private readonly _isNaN: boolean = false;
    private readonly _isFinite: boolean = true;
    private readonly _isNegative: boolean = false;
    static Amount: any;

    // methods to be defined later
    toAmount: any;
    withSignificantDigits: any;
    withFractionalDigits: any;
    withTrailingZeroes: any;

    constructor(n: string | number | bigint) {
        let data;
        let s: string;

        if ("number" === typeof n) {
            s = Object.is(n, -0) ? "-0" : n.toString();
        } else if ("bigint" === typeof n) {
            s = n.toString();
        } else {
            s = n;
        }

        data = handleDecimalNotation(s);

        if (data === "NaN") {
            this._isNaN = true;
        } else if (data === "Infinity") {
            this._isFinite = false;
        } else if (data === "-Infinity") {
            this._isFinite = false;
            this._isNegative = true;
        } else {
            let v = data;
            if (v === "-0") {
                this._isNegative = true;
            } else if (v === "0") {
                this._isNegative = false;
            } else {
                this._isNegative = v.isNegative;
            }
            this.d = data;
        }
    }

    public isNaN(): boolean {
        return this._isNaN;
    }

    public isFinite(): boolean {
        return this._isFinite;
    }

    public isNegative(): boolean {
        return this._isNegative;
    }

    private isZero(): boolean {
        if (this.isNaN()) {
            return false;
        }

        if (!this.isFinite()) {
            return false;
        }

        return this.d === "0" || this.d === "-0";
    }

    public exponent(): number {
        if (this.isZero()) {
            return -Infinity;
        }

        if (this.isNegative()) {
            return this.negate().exponent();
        }

        let v = this.d as Rational;

        return Number(v.intLog10());
    }

    public mantissa(): Decimal {
        if (this.isZero()) {
            throw new RangeError("Zero does not have a mantissa");
        }

        if (this.isNegative()) {
            return this.negate().mantissa().negate();
        }

        let x: Decimal = this;
        let decimalOne = new Decimal("1");
        let decimalTen = new Decimal("10");

        while (0 <= x.compare(decimalTen)) {
            x = x.scale10(-1);
        }

        while (x.compare(decimalOne) === -1) {
            x = x.scale10(1);
        }

        return x;
    }

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
            return this.clone();
        }

        let v = this.d as FiniteValue;

        if (v === "0" || v === "-0") {
            return this.clone();
        }

        return new Decimal(v.scale10(BigInt(n)).toFixed(Infinity));
    }

    private coefficient(): bigint {
        let d = this.d as Rational;
        return d.coefficient();
    }

    private emitExponential(): string {
        let v = this.d;
        let e = this.exponent();

        if (v === "0" || v === "-0") {
            return v + "e+0";
        }

        let m = this.mantissa();

        let mAsString = m.toFixed({ digits: Infinity });
        let expPart = (e < 0 ? "-" : "+") + Math.abs(e);
        return mAsString + "e" + expPart;
    }

    private emitDecimal(): string {
        let v = this.d as Rational;
        return v.toFixed(Infinity);
    }

    /**
     * Returns a digit string representing this Decimal128.
     */
    toString(): string {
        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + POSITIVE_INFINITY;
        }

        if (this.isZero()) {
            return this._isNegative ? "-0" : "0";
        }

        let c = this.coefficient();

        if (c.toString().length > 6) {
            return this.emitExponential();
        }

        return this.emitDecimal();
    }

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

        if (n === Infinity) {
            return this.emitDecimal();
        }

        if (!Number.isInteger(n)) {
            throw new RangeError(
                "Argument must be an integer or positive infinity"
            );
        }

        if (this.isNaN()) {
            return NAN;
        }

        if (!this.isFinite()) {
            return this.isNegative()
                ? "-" + POSITIVE_INFINITY
                : POSITIVE_INFINITY;
        }

        let rounded = this.round(n);
        let roundedRendered = rounded.emitDecimal();

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

        let d = this.d as Rational;
        return d.toPrecision(BigInt(precision));
    }

    toExponential(opts?: { digits?: number }): string {
        if (this.isNaN()) {
            return "NaN";
        }

        if (!this.isFinite()) {
            return (this.isNegative() ? "-" : "") + "Infinity";
        }

        if (undefined === opts) {
            return this.emitExponential();
        }

        if ("object" !== typeof opts) {
            throw new TypeError("Argument must be an object");
        }

        if (undefined === opts.digits) {
            return this.emitExponential();
        }

        let n = opts.digits;

        if (n <= 0) {
            throw new RangeError("Argument must be positive");
        }

        if (!Number.isInteger(n)) {
            throw new RangeError("Argument must be an integer");
        }

        let s = this.abs().emitExponential();

        let [lhs, rhsWithEsign] = s.split(/[.]/);

        let [rhs, exp] = rhsWithEsign.split(/[eE]/);

        let p = this.isNegative() ? "-" : "";

        if (rhs.length <= n) {
            return p + lhs + "." + rhs + "0".repeat(n - rhs.length) + "e" + exp;
        }

        return p + lhs + "." + rhs.substring(0, n) + "e" + exp;
    }

    private isInteger(): boolean {
        let d = this.d as FiniteValue;

        if (d === "0" || d === "-0") {
            return true;
        }

        return d.isInteger();
    }

    toBigInt(): bigint {
        if (this.isNaN()) {
            throw new RangeError("NaN cannot be converted to a BigInt");
        }

        if (!this.isFinite()) {
            throw new RangeError("Infinity cannot be converted to a BigInt");
        }

        if (!this.isInteger()) {
            throw new RangeError(
                "Non-integer decimal cannot be converted to a BigInt"
            );
        }

        return BigInt(this.toString());
    }

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
     * Compare two values. Return
     *
     * * NaN if either argument is a decimal NaN
     * + -1 if the mathematical value of this decimal is strictly less than that of the other,
     * + 0 if the mathematical values are equal, and
     * + 1 otherwise.
     *
     * @param x
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

        let ourCohort = this.d as Rational;
        let theirCohort = x.d as Rational;

        return ourCohort.cmp(theirCohort);
    }

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

    notEquals(other: Decimal): boolean {
        if (this.isNaN() || other.isNaN()) {
            return false;
        }

        return 0 !== this.compare(other);
    }

    lessThan(x: Decimal): boolean {
        return this.compare(x) === -1;
    }

    lessThanOrEqual(x: Decimal): boolean {
        if (this.isNaN() || x.isNaN()) {
            return false;
        }

        let c = this.compare(x);

        return c === -1 || c === 0;
    }

    greaterThan(x: Decimal): boolean {
        return this.compare(x) === 1;
    }

    greaterThanOrEqual(x: Decimal): boolean {
        if (this.isNaN() || x.isNaN()) {
            return false;
        }

        let c = this.compare(x);

        return c === 1 || c === 0;
    }

    abs(): Decimal {
        if (this.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            if (this.isNegative()) {
                return this.negate();
            }

            return this.clone();
        }

        if (this.isNegative()) {
            return this.negate();
        }

        return this.clone();
    }

    /**
     * Add this Decimal128 value to one or more Decimal128 values.
     *
     * @param x
     */
    add(x: Decimal): Decimal {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return x.clone();
                }

                return new Decimal(NAN);
            }

            return this.clone();
        }

        if (!x.isFinite()) {
            return x.clone();
        }

        if (this.isNegative() && x.isNegative()) {
            return this.negate().add(x.negate()).negate();
        }

        if (this.isZero()) {
            return x.clone();
        }

        if (x.isZero()) {
            return this.clone();
        }

        let ourCohort = this.d as Rational;
        let theirCohort = x.d as Rational;
        let sum = ourCohort.add(theirCohort);

        if (sum.isZero()) {
            if (this._isNegative) {
                return new Decimal("-0");
            }

            return new Decimal("0");
        }

        let rounded = RoundToDecimal128Domain(sum) as Rational;

        return new Decimal(rounded.toFixed(Infinity));
    }

    /**
     * Subtract another Decimal128 value from one or more Decimal128 values.
     *
     * @param x
     */
    subtract(x: Decimal): Decimal {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                if (this.isNegative() === x.isNegative()) {
                    return new Decimal(NAN);
                }

                return this.clone();
            }

            return this.clone();
        }

        if (!x.isFinite()) {
            return x.negate();
        }

        if (x.isNegative()) {
            return this.add(x.negate());
        }

        if (this.isZero()) {
            return x.negate();
        }

        if (x.isZero()) {
            return this.clone();
        }

        let ourCohort = this.d as Rational;
        let theirCohort = x.d as Rational;
        let difference = ourCohort.subtract(theirCohort);

        if (difference.isZero()) {
            return new Decimal("0");
        }

        let rounded = RoundToDecimal128Domain(difference) as Rational;

        return new Decimal(rounded.toFixed(Infinity));
    }

    /**
     * Multiply this Decimal128 value by an array of other Decimal128 values.
     *
     * If no arguments are given, return this value.
     *
     * @param x
     */
    multiply(x: Decimal): Decimal {
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

        if (this.isNegative()) {
            return this.negate().multiply(x).negate();
        }

        if (x.isNegative()) {
            return this.multiply(x.negate()).negate();
        }

        let ourCohort = this.d as Rational;
        let theirCohort = x.d as Rational;

        if (this.isZero()) {
            return new Decimal(ourCohort.toString());
        }

        if (x.isZero()) {
            return new Decimal(theirCohort.toString());
        }

        let product = ourCohort.multiply(theirCohort);
        let rounded = RoundToDecimal128Domain(product) as Rational;

        return new Decimal(rounded.toFixed(Infinity));
    }

    private clone(): Decimal {
        if (this.isNaN()) {
            return new Decimal(NAN);
        }

        if (!this.isFinite()) {
            return new Decimal(
                this.isNegative() ? NEGATIVE_INFINITY : POSITIVE_INFINITY
            );
        }

        let v = this.d as FiniteValue;

        if (v === "0" || v === "-0") {
            return new Decimal(v);
        }

        return new Decimal(v.toFixed(Infinity));
    }

    /**
     * Divide this Decimal128 value by another Decimal128 value.
     *
     * @param x
     */
    divide(x: Decimal): Decimal {
        if (this.isNaN() || x.isNaN()) {
            return new Decimal(NAN);
        }

        if (x.isZero()) {
            return new Decimal(NAN);
        }

        if (this.isZero()) {
            return this.clone();
        }

        if (!this.isFinite()) {
            if (!x.isFinite()) {
                return new Decimal(NAN);
            }

            if (this.isNegative() === x.isNegative()) {
                return new Decimal(POSITIVE_INFINITY);
            }

            if (this.isNegative()) {
                return this.clone();
            }

            return new Decimal(NEGATIVE_INFINITY);
        }

        if (!x.isFinite()) {
            if (this.isNegative() === x.isNegative()) {
                return new Decimal("0");
            }

            return new Decimal("-0");
        }

        if (this.isNegative()) {
            return this.negate().divide(x).negate();
        }

        if (x.isNegative()) {
            return this.divide(x.negate()).negate();
        }

        let ourV = this.d as Rational;
        let theirV = x.d as Rational;
        let quotient = ourV.divide(theirV);
        let rounded = RoundToDecimal128Domain(quotient) as Rational;

        return new Decimal(rounded.toFixed(Infinity));
    }

    /**
     *
     * @param numDecimalDigits
     * @param {RoundingMode} mode (default: ROUNDING_MODE_DEFAULT)
     */
    round(
        numDecimalDigits: number = 0,
        mode: RoundingMode = ROUNDING_MODE_HALF_EVEN
    ): Decimal {
        if (!ROUNDING_MODES.includes(mode)) {
            throw new RangeError(`Invalid rounding mode "${mode}"`);
        }

        if (this.isNaN() || !this.isFinite()) {
            return this.clone();
        }

        if (this.isZero()) {
            return this.clone();
        }

        let v = this.d as Rational;
        let roundedV = v.round(numDecimalDigits, mode);

        if (roundedV.isZero()) {
            return new Decimal(v.isNegative ? "-0" : "0");
        }

        return new Decimal(roundedV.toFixed(Infinity));
    }

    negate(): Decimal {
        if (this.isNaN()) {
            return this.clone();
        }

        if (!this.isFinite()) {
            return new Decimal(
                this.isNegative() ? POSITIVE_INFINITY : NEGATIVE_INFINITY
            );
        }

        let v = this.d as FiniteValue;

        if (v === "0") {
            return new Decimal("-0");
        }

        if (v === "-0") {
            return new Decimal("0");
        }

        return new Decimal(v.negate().toFixed(Infinity));
    }

    /**
     * Return the remainder of this Decimal128 value divided by another Decimal128 value.
     *
     * @param d
     * @throws RangeError If argument is zero
     */
    remainder(d: Decimal): Decimal {
        if (this.isNaN() || d.isNaN()) {
            return new Decimal(NAN);
        }

        if (this.isNegative()) {
            return this.negate().remainder(d).negate();
        }

        if (d.isNegative()) {
            return this.remainder(d.negate());
        }

        if (!this.isFinite()) {
            return new Decimal(NAN);
        }

        if (!d.isFinite()) {
            return this.clone();
        }

        if (d.isZero()) {
            return new Decimal(NAN);
        }

        if (this.compare(d) === -1) {
            return this.clone();
        }

        let q = this.divide(d).round(0, ROUNDING_MODE_TRUNCATE);
        return this.subtract(d.multiply(q));
    }

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

        let exp = this.exponent();
        return exp >= NORMAL_EXPONENT_MIN && exp <= NORMAL_EXPONENT_MAX;
    }

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

        let exp = this.exponent();
        return exp < NORMAL_EXPONENT_MIN;
    }

    truncatedExponent(): number {
        if (this.isZero() || this.isSubnormal()) {
            return NORMAL_EXPONENT_MIN;
        }

        return this.exponent();
    }

    scaledSignificand(): bigint {
        if (this.isNaN()) {
            throw new RangeError("NaN does not have a scaled significand");
        }

        if (!this.isFinite()) {
            throw new RangeError("Infinity does not have a scaled significand");
        }

        if (this.isZero()) {
            return 0n;
        }

        let v = this.d as Rational;
        let te = this.truncatedExponent();
        let ss = v.scale10(BigInt(MAX_SIGNIFICANT_DIGITS - 1 - te));

        return ss.numerator;
    }
}

Decimal.Amount = class Amount {
    private val: Decimal;
    public readonly trailingZeroes: number;
    public readonly significantDigits: number;
    public readonly fractionalDigits: number;

    static from(s: string): Amount {
        // @todo handle exponential notation, too, not just decimal notation
        let [intPart, fracPart] = s.split(/[.]/);
        let numFractionDigits = undefined === fracPart ? 0 : fracPart.length;
        return new Amount(s, numFractionDigits);
    }

    constructor(val: string, fractionalDigits: number) {
        if ("string" !== typeof val) {
            throw new TypeError("Digit string argument must be a string");
        }

        if ("number" !== typeof fractionalDigits) {
            throw new TypeError("Precision argument must be a number");
        }

        let d = new Decimal(val);
        this.val = d; // might throw

        // @todo handle exponential notation, too, not just decimal notation

        let [intPart, fracPart] = d
            .toFixed({ digits: fractionalDigits })
            .split(/[.]/);

        this.fractionalDigits = undefined === fracPart ? 0 : fracPart.length;

        if (undefined === fracPart) {
            this.trailingZeroes = 0;
        } else {
            let m = fracPart.match(/0+$/);
            if (m) {
                this.trailingZeroes = m[0].length;
            } else {
                this.trailingZeroes = 0;
            }
        }

        this.significantDigits =
            intPart.length + (undefined === fracPart ? 0 : fracPart.length);
    }

    toString(): string {
        return this.val.toFixed({ digits: this.fractionalDigits });
    }

    toLocaleString(locale: string, options: Intl.NumberFormatOptions): string {
        if (undefined === options) {
            options = {};
        }

        options.minimumFractionDigits = this.fractionalDigits;

        let formatter = new Intl.NumberFormat(locale, options);
        // @ts-ignore
        return formatter.format(this.toString());
    }

    withSignificantDigits(precision: number): Amount {
        let s = this.val.toPrecision({ digits: precision });
        let [intPart, fracPart] = s.split(/[.]/);
        let numFractionDigits = undefined === fracPart ? 0 : fracPart.length;
        return new Amount(s, numFractionDigits);
    }

    withFractionalDigits(precision: number): Amount {
        return new Amount(this.val.toFixed({ digits: Infinity }), precision);
    }

    withTrailingZeroes(precision: number): Amount {
        let s = this.val.toFixed({ digits: this.fractionalDigits + precision });
        let [intPart, fracPart] = s.split(/[.]/);
        let numFractionDigits = undefined === fracPart ? 0 : fracPart.length;
        return new Amount(s, numFractionDigits);
    }
};

Decimal.prototype.toAmount = function () {
    return Decimal.Amount.from(this.toFixed({ digits: Infinity }));
};

Decimal.prototype.valueOf = function () {
    throw TypeError("Decimal.prototype.valueOf throws unconditionally");
};

Decimal.prototype.withSignificantDigits = function (n: number): object {
    return new Decimal.Amount(
        this.toFixed({ digits: Infinity })
    ).withSignificantDigits(n);
};

Decimal.prototype.withFractionalDigits = function (n: number): object {
    return new Decimal.Amount(
        this.toFixed({ digits: Infinity })
    ).withFractionalDigits(n);
};

Decimal.prototype.withTrailingZeroes = function (n: number): object {
    return new Decimal.Amount(
        this.toFixed({ digits: Infinity })
    ).withTrailingZeroes(n);
};
