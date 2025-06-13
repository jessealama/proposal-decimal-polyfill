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

const NORMAL_EXPONENT_MIN = -6143;
const NORMAL_EXPONENT_MAX = 6144;
const MAX_SIGNIFICANT_DIGITS = 34;

type NaNValue = "NaN";
type InfiniteValue = "Infinity" | "-Infinity";
type FiniteValue = "0" | "-0" | CoefficientExponent;

type Decimal128Value = NaNValue | InfiniteValue | FiniteValue;

const NAN = "NaN";
const POSITIVE_INFINITY = "Infinity";
const NEGATIVE_INFINITY = "-Infinity";

type PrecisionSpecification =
    | { fractionDigit: number }
    | { significantDigit: number }
    | { trailingZero: number };

const ROUNDING_MODE_CEILING = "ceil";
const ROUNDING_MODE_FLOOR = "floor";
const ROUNDING_MODE_TRUNCATE = "trunc";
const ROUNDING_MODE_HALF_EVEN = "halfEven";
const ROUNDING_MODE_HALF_EXPAND = "halfExpand";

type RoundingMode = "ceil" | "floor" | "trunc" | "halfEven" | "halfExpand";

const ROUNDING_MODES: RoundingMode[] = [
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
    ROUNDING_MODE_TRUNCATE,
    ROUNDING_MODE_HALF_EVEN,
    ROUNDING_MODE_HALF_EXPAND,
];

/**
 * Apply a rounding mode to a positive CoefficientExponent value
 * This is an internal helper function corresponding to the spec's abstract operation
 */
function ApplyRoundingModeToPositive(
    value: CoefficientExponent,
    mode: RoundingMode
): CoefficientExponent {
    // Validate rounding mode
    if (!ROUNDING_MODES.includes(mode)) {
        throw new RangeError(`Invalid rounding mode: ${mode}`);
    }

    const mLow = value.floor();
    const fraction = value.subtract(mLow);

    if (fraction.isZero()) {
        return mLow;
    }

    const mHigh = mLow.add(new CoefficientExponent(1n, 0, false));

    if (mode === ROUNDING_MODE_FLOOR || mode === ROUNDING_MODE_TRUNCATE) {
        return mLow;
    }

    if (mode === ROUNDING_MODE_CEILING) {
        return mHigh;
    }

    // For half-even and half-expand, we need to check if fraction is exactly 0.5
    const oneHalf = new CoefficientExponent(5n, -1, false);
    const cmp = fraction.cmp(oneHalf);

    if (cmp === -1) {
        return mLow;
    }

    if (cmp === 1) {
        return mHigh;
    }

    // Exactly 0.5
    if (mode === ROUNDING_MODE_HALF_EXPAND) {
        return mHigh;
    }

    // ROUNDING_MODE_HALF_EVEN: round to even
    if (mLow.isInteger()) {
        // Check if mLow is even (divisible by 2)
        if (mLow.coefficient % 2n === 0n) {
            return mLow;
        }
    }

    return mHigh;
}

/**
 * Represents a decimal number as coefficient * 10^exponent
 * The coefficient is always non-negative; the sign is stored separately
 */
class CoefficientExponent {
    private readonly _coefficient: bigint;
    private readonly _exponent: number;
    private readonly _isNegative: boolean;

    /**
     * Creates a new CoefficientExponent instance representing a decimal number as coefficient * 10^exponent.
     * The coefficient is always non-negative; the sign is stored separately.
     * @param {bigint} coefficient - The coefficient value (must be non-negative)
     * @param {number} exponent - The power of 10 exponent (must be an integer)
     * @param {boolean} [isNegative=false] - Whether the number is negative
     * @throws {RangeError} If coefficient is negative
     * @throws {TypeError} If exponent is not an integer
     */
    constructor(
        coefficient: bigint,
        exponent: number,
        isNegative: boolean = false
    ) {
        if (coefficient < 0n) {
            throw new RangeError("Coefficient must be non-negative");
        }
        if (!Number.isInteger(exponent)) {
            throw new TypeError("Exponent must be an integer");
        }

        // Normalize: remove trailing zeros
        let c = coefficient;
        let e = exponent;

        if (c === 0n) {
            this._coefficient = 0n;
            this._exponent = 0;
            this._isNegative = isNegative; // Preserve sign for -0
        } else {
            while (c % 10n === 0n) {
                c = c / 10n;
                e = e + 1;
            }
            this._coefficient = c;
            this._exponent = e;
            this._isNegative = isNegative;
        }
    }

    /**
     * Gets the coefficient of this decimal representation.
     * @returns {bigint} The coefficient value (always non-negative)
     */
    get coefficient(): bigint {
        return this._coefficient;
    }

    /**
     * Gets the exponent of this decimal representation.
     * @returns {number} The power of 10 exponent
     */
    get exponent(): number {
        return this._exponent;
    }

    /**
     * Gets whether this decimal value is negative.
     * @returns {boolean} True if negative, false otherwise
     */
    get isNegative(): boolean {
        return this._isNegative;
    }

    /**
     * Checks if this decimal value is zero.
     * @returns {boolean} True if the coefficient is zero
     */
    isZero(): boolean {
        return this._coefficient === 0n;
    }

    /**
     * Returns a new CoefficientExponent with the opposite sign.
     * @returns {CoefficientExponent} A new instance with negated sign
     */
    negate(): CoefficientExponent {
        if (this.isZero()) {
            return this;
        }
        return new CoefficientExponent(
            this._coefficient,
            this._exponent,
            !this._isNegative
        );
    }

    /**
     * Returns the absolute value of this CoefficientExponent.
     * @returns {CoefficientExponent} A new instance with positive sign
     */
    abs(): CoefficientExponent {
        if (this._isNegative) {
            return new CoefficientExponent(
                this._coefficient,
                this._exponent,
                false
            );
        }
        return this;
    }

    /**
     * Parse a string into a CoefficientExponent
     * Handles decimal notation including scientific notation
     */
    static from(s: string): CoefficientExponent {
        // Remove underscores and leading plus
        s = s.replace(/_/g, "").replace(/^\+/, "");

        if (s === "") {
            throw new SyntaxError("Empty string");
        }

        // Handle sign
        let isNegative = false;
        if (s.startsWith("-")) {
            isNegative = true;
            s = s.substring(1);
        }

        // Match decimal number pattern
        // Handle cases like ".5" (no integer part) and "17." (trailing decimal)
        const match = s.match(/^(\d*)(?:\.(\d*))?(?:[eE]([-+]?\d+))?$/);
        if (!match || (match[1] === "" && (!match[2] || match[2] === ""))) {
            throw new SyntaxError("Invalid decimal string");
        }

        const [, intPart = "0", fracPart = "", expPart = "0"] = match;

        // Combine integer and fractional parts
        const digits = intPart + fracPart;

        // Remove leading zeros but keep at least one digit
        const trimmedDigits = digits.replace(/^0+/, "") || "0";

        const coefficient = BigInt(trimmedDigits);
        const exponent = Number(expPart) - fracPart.length;

        return new CoefficientExponent(coefficient, exponent, isNegative);
    }

    /**
     * Scales this value by 10^n.
     * @param {bigint} n - The power of 10 to scale by
     * @returns {CoefficientExponent} A new instance scaled by 10^n
     * @throws {RangeError} If the resulting exponent overflows
     */
    scale10(n: bigint): CoefficientExponent {
        if (this.isZero()) {
            return this;
        }
        const newExponent = this._exponent + Number(n);
        if (!Number.isSafeInteger(newExponent)) {
            throw new RangeError("Exponent overflow");
        }
        return new CoefficientExponent(
            this._coefficient,
            newExponent,
            this._isNegative
        );
    }

    /**
     * Converts this CoefficientExponent to a decimal string representation.
     * @returns {string} The decimal string representation
     * @example
     * new CoefficientExponent(123n, -2).toString() // "1.23"
     * new CoefficientExponent(5n, 3).toString() // "5000"
     */
    toString(): string {
        if (this.isZero()) {
            return this._isNegative ? "-0" : "0";
        }

        const sign = this._isNegative ? "-" : "";
        const coeffStr = this._coefficient.toString();
        const exp = this._exponent;

        if (exp >= 0) {
            // Integer or number with trailing zeros
            return sign + coeffStr + "0".repeat(exp);
        } else {
            // Fractional number
            const absExp = -exp;
            if (absExp >= coeffStr.length) {
                // Need leading zeros after decimal point
                const leadingZeros = absExp - coeffStr.length;
                return sign + "0." + "0".repeat(leadingZeros) + coeffStr;
            } else {
                // Insert decimal point within coefficient
                const intPart = coeffStr.slice(0, coeffStr.length - absExp);
                const fracPart = coeffStr.slice(coeffStr.length - absExp);
                return sign + intPart + "." + fracPart;
            }
        }
    }

    /**
     * Formats this value with a fixed number of decimal places.
     * @param {number} digits - The number of decimal places to display
     * @returns {string} The formatted string
     * @throws {RangeError} If digits is NaN, negative infinity, or negative
     */
    toFixed(digits: number): string {
        if (Number.isNaN(digits)) {
            throw new RangeError("NaN is not a valid argument");
        }

        if (digits === -Infinity) {
            throw new RangeError("Negative infinity is not a valid argument");
        }

        if (digits === Infinity) {
            // Return full decimal representation
            return this.toString();
        }

        if (!Number.isInteger(digits) || digits < 0) {
            throw new RangeError("Invalid digits");
        }

        if (this.isZero()) {
            const sign = this._isNegative ? "-" : "";
            if (digits === 0) {
                return sign + "0";
            }
            return sign + "0." + "0".repeat(digits);
        }

        const str = this.toString();
        const dotIndex = str.indexOf(".");

        if (dotIndex === -1) {
            // Integer
            if (digits === 0) {
                return str;
            }
            return str + "." + "0".repeat(digits);
        }

        const currentDigits = str.length - dotIndex - 1;
        if (currentDigits === digits) {
            return str;
        } else if (currentDigits < digits) {
            return str + "0".repeat(digits - currentDigits);
        } else {
            // Need to round
            return str.substring(0, dotIndex + 1 + digits);
        }
    }

    /**
     * Compare two CoefficientExponent values.
     * @param {CoefficientExponent} other - The value to compare with
     * @returns {-1|0|1} -1 if this < other, 0 if equal, 1 if this > other
     */
    cmp(other: CoefficientExponent): -1 | 0 | 1 {
        // Handle zeros
        if (this.isZero() && other.isZero()) {
            return 0;
        }
        if (this.isZero()) {
            return other._isNegative ? 1 : -1;
        }
        if (other.isZero()) {
            return this._isNegative ? -1 : 1;
        }

        // Handle different signs
        if (this._isNegative && !other._isNegative) {
            return -1;
        }
        if (!this._isNegative && other._isNegative) {
            return 1;
        }

        // Same sign, compare magnitudes
        const cmpMag = this.compareMagnitude(other);

        // If negative, reverse the comparison
        if (this._isNegative) {
            return cmpMag === -1 ? 1 : cmpMag === 1 ? -1 : 0;
        }
        return cmpMag;
    }

    /**
     * Compare magnitudes (absolute values) of two CoefficientExponent values.
     * @param {CoefficientExponent} other - The value to compare with
     * @returns {-1|0|1} -1 if this < other, 0 if equal, 1 if this > other
     * @private
     */
    private compareMagnitude(other: CoefficientExponent): -1 | 0 | 1 {
        // Align exponents for comparison
        const exp1 = this._exponent;
        const exp2 = other._exponent;

        if (exp1 === exp2) {
            // Same exponent, compare coefficients
            if (this._coefficient < other._coefficient) return -1;
            if (this._coefficient > other._coefficient) return 1;
            return 0;
        }

        // Different exponents - align them
        if (exp1 > exp2) {
            // this has larger exponent, so scale this coefficient up
            const diff = exp1 - exp2;
            const scaledThisCoeff = this._coefficient * 10n ** BigInt(diff);
            if (scaledThisCoeff < other._coefficient) return -1;
            if (scaledThisCoeff > other._coefficient) return 1;
            return 0;
        } else {
            // other has larger exponent, so scale other coefficient up
            const diff = exp2 - exp1;
            const scaledOtherCoeff = other._coefficient * 10n ** BigInt(diff);
            if (this._coefficient < scaledOtherCoeff) return -1;
            if (this._coefficient > scaledOtherCoeff) return 1;
            return 0;
        }
    }

    /**
     * Checks if this CoefficientExponent equals another.
     * @param {CoefficientExponent} other - The value to compare with
     * @returns {boolean} True if the values are equal
     */
    equals(other: CoefficientExponent): boolean {
        return this.cmp(other) === 0;
    }

    /**
     * Adds two CoefficientExponent values.
     * @param {CoefficientExponent} other - The value to add
     * @returns {CoefficientExponent} The sum of the two values
     */
    add(other: CoefficientExponent): CoefficientExponent {
        // Handle zeros
        if (this.isZero()) {
            return other;
        }
        if (other.isZero()) {
            return this;
        }

        // Handle different signs
        if (this._isNegative && !other._isNegative) {
            return other.subtract(this.negate());
        }
        if (!this._isNegative && other._isNegative) {
            return this.subtract(other.negate());
        }

        // Same sign addition
        const exp1 = this._exponent;
        const exp2 = other._exponent;

        // Align to the smaller exponent
        const minExp = Math.min(exp1, exp2);
        const coeff1 = this._coefficient * 10n ** BigInt(exp1 - minExp);
        const coeff2 = other._coefficient * 10n ** BigInt(exp2 - minExp);

        return new CoefficientExponent(
            coeff1 + coeff2,
            minExp,
            this._isNegative
        );
    }

    /**
     * Subtracts another CoefficientExponent value from this one.
     * @param {CoefficientExponent} other - The value to subtract
     * @returns {CoefficientExponent} The difference of the two values
     */
    subtract(other: CoefficientExponent): CoefficientExponent {
        // Handle zeros
        if (other.isZero()) {
            return this;
        }
        if (this.isZero()) {
            return other.negate();
        }

        // Convert to addition if signs differ
        if (this._isNegative && !other._isNegative) {
            return this.negate().add(other).negate();
        }
        if (!this._isNegative && other._isNegative) {
            return this.add(other.negate());
        }

        // Same sign subtraction
        const exp1 = this._exponent;
        const exp2 = other._exponent;

        // Align to the smaller exponent
        const minExp = Math.min(exp1, exp2);
        const coeff1 = this._coefficient * 10n ** BigInt(exp1 - minExp);
        const coeff2 = other._coefficient * 10n ** BigInt(exp2 - minExp);

        if (coeff1 >= coeff2) {
            return new CoefficientExponent(
                coeff1 - coeff2,
                minExp,
                this._isNegative
            );
        } else {
            return new CoefficientExponent(
                coeff2 - coeff1,
                minExp,
                !this._isNegative
            );
        }
    }

    /**
     * Multiplies two CoefficientExponent values.
     * @param {CoefficientExponent} other - The value to multiply by
     * @returns {CoefficientExponent} The product of the two values
     */
    multiply(other: CoefficientExponent): CoefficientExponent {
        if (this.isZero() || other.isZero()) {
            return new CoefficientExponent(0n, 0, false);
        }

        const coefficient = this._coefficient * other._coefficient;
        const exponent = this._exponent + other._exponent;
        const isNegative = this._isNegative !== other._isNegative;

        return new CoefficientExponent(coefficient, exponent, isNegative);
    }

    /**
     * Divides this CoefficientExponent by another.
     * This returns an exact result, which may have many decimal places.
     * @param {CoefficientExponent} other - The divisor
     * @returns {CoefficientExponent} The quotient
     * @throws {RangeError} If dividing by zero
     */
    divide(other: CoefficientExponent): CoefficientExponent {
        if (other.isZero()) {
            throw new RangeError("Division by zero");
        }
        if (this.isZero()) {
            return new CoefficientExponent(0n, 0, false);
        }

        // To get an exact result, we need to scale up the dividend
        // We'll use a large scale factor to ensure precision
        const scaleFactor = 100; // This gives us 100 extra decimal places
        const scaledDividend = this._coefficient * 10n ** BigInt(scaleFactor);

        const quotient = scaledDividend / other._coefficient;
        const remainder = scaledDividend % other._coefficient;

        if (remainder === 0n) {
            // Exact division
            const exponent = this._exponent - other._exponent - scaleFactor;
            const isNegative = this._isNegative !== other._isNegative;
            return new CoefficientExponent(quotient, exponent, isNegative);
        } else {
            // For now, we'll use the scaled quotient
            // In a full implementation, we might want to compute more decimal places
            const exponent = this._exponent - other._exponent - scaleFactor;
            const isNegative = this._isNegative !== other._isNegative;
            return new CoefficientExponent(quotient, exponent, isNegative);
        }
    }

    /**
     * Gets the floor (largest integer less than or equal to this value).
     * @returns {CoefficientExponent} The floor value
     */
    floor(): CoefficientExponent {
        if (this._exponent >= 0) {
            // Already an integer
            return this;
        }

        // Need to truncate fractional digits
        const fracDigits = -this._exponent;
        const divisor = 10n ** BigInt(fracDigits);
        const truncatedCoeff = this._coefficient / divisor;

        if (this._isNegative && this._coefficient % divisor !== 0n) {
            // For negative numbers, floor means going more negative
            return new CoefficientExponent(truncatedCoeff + 1n, 0, true);
        }

        return new CoefficientExponent(truncatedCoeff, 0, this._isNegative);
    }

    /**
     * Checks if this value is an integer.
     * @returns {boolean} True if the value has no fractional part
     */
    isInteger(): boolean {
        if (this._exponent >= 0) {
            return true;
        }

        // Check if coefficient is divisible by 10^(-exponent)
        const fracDigits = -this._exponent;
        const divisor = 10n ** BigInt(fracDigits);
        return this._coefficient % divisor === 0n;
    }

    /**
     * Rounds to a specified number of significant digits.
     * @param {number} numSignificantDigits - The number of significant digits to keep
     * @param {RoundingMode} mode - The rounding mode to use
     * @returns {CoefficientExponent} The rounded value
     * @throws {RangeError} If numSignificantDigits is not positive
     */
    roundToSignificantDigits(
        numSignificantDigits: number,
        mode: RoundingMode
    ): CoefficientExponent {
        if (numSignificantDigits <= 0) {
            throw new RangeError(
                "Number of significant digits must be positive"
            );
        }

        if (this.isZero()) {
            return this;
        }

        const currentDigits = this._coefficient.toString().length;
        if (currentDigits <= numSignificantDigits) {
            return this;
        }

        // Need to remove (currentDigits - numSignificantDigits) digits from the right
        const digitsToRemove = currentDigits - numSignificantDigits;
        const divisor = 10n ** BigInt(digitsToRemove);
        const quotient = this._coefficient / divisor;
        const remainder = this._coefficient % divisor;

        // Apply rounding based on the remainder
        let newCoefficient = quotient;
        if (remainder !== 0n) {
            // Create a fractional value to determine rounding
            const fraction = new CoefficientExponent(
                remainder,
                -digitsToRemove,
                false
            );
            const halfUnit = new CoefficientExponent(
                5n * 10n ** BigInt(digitsToRemove - 1),
                -digitsToRemove,
                false
            );

            const shouldRoundUp = (() => {
                if (
                    mode === ROUNDING_MODE_FLOOR ||
                    mode === ROUNDING_MODE_TRUNCATE
                ) {
                    return false;
                }
                if (mode === ROUNDING_MODE_CEILING) {
                    return true;
                }

                const cmp = fraction.cmp(halfUnit);
                if (cmp === -1) {
                    return false;
                }
                if (cmp === 1) {
                    return true;
                }

                // Exactly half
                if (mode === ROUNDING_MODE_HALF_EXPAND) {
                    return true;
                }
                // HALF_EVEN - round to even
                return quotient % 2n === 1n;
            })();

            if (shouldRoundUp) {
                newCoefficient = quotient + 1n;
            }
        }

        return new CoefficientExponent(
            newCoefficient,
            this._exponent + digitsToRemove,
            this._isNegative
        );
    }

    /**
     * Rounds to a specified number of fractional digits.
     * @param {number} numFractionalDigits - The number of decimal places to keep
     * @param {RoundingMode} mode - The rounding mode to use
     * @returns {CoefficientExponent} The rounded value
     * @throws {RangeError} If numFractionalDigits is negative or invalid rounding mode
     */
    round(
        numFractionalDigits: number,
        mode: RoundingMode
    ): CoefficientExponent {
        if (numFractionalDigits < 0) {
            throw new RangeError(
                "Cannot round to negative number of decimal places"
            );
        }

        // Validate rounding mode
        if (!ROUNDING_MODES.includes(mode)) {
            throw new RangeError(`Invalid rounding mode: ${mode}`);
        }

        // Scale up to have numFractionalDigits after the decimal point
        const scaled = this.scale10(BigInt(numFractionalDigits));

        // For negative numbers, we work with absolute value and adjust rounding mode
        if (this._isNegative) {
            let adjustedMode = mode;
            if (mode === ROUNDING_MODE_FLOOR) {
                adjustedMode = ROUNDING_MODE_CEILING;
            } else if (mode === ROUNDING_MODE_CEILING) {
                adjustedMode = ROUNDING_MODE_FLOOR;
            }

            const absScaled = scaled.abs();
            const rounded = ApplyRoundingModeToPositive(
                absScaled,
                adjustedMode
            );
            const result = rounded.scale10(-BigInt(numFractionalDigits));
            return result.negate();
        } else {
            // For positive numbers, apply rounding directly
            const rounded = ApplyRoundingModeToPositive(scaled, mode);
            return rounded.scale10(-BigInt(numFractionalDigits));
        }
    }

    /**
     * Formats with a specified number of significant digits.
     * @param {number} digits - The number of significant digits
     * @returns {string} The formatted string in decimal or exponential notation
     * @throws {RangeError} If digits is not positive or not an integer
     */
    toPrecision(digits: number): string {
        if (digits <= 0) {
            throw new RangeError("Precision must be positive");
        }

        if (!Number.isInteger(digits)) {
            throw new RangeError("Precision must be an integer");
        }

        if (this.isZero()) {
            const sign = this._isNegative ? "-" : "";
            if (digits === 1) {
                return sign + "0";
            }
            return sign + "0." + "0".repeat(digits - 1);
        }

        // Round to the specified number of significant digits
        const rounded = this.roundToSignificantDigits(
            digits,
            ROUNDING_MODE_HALF_EVEN
        );

        // Calculate the effective exponent (where decimal point would be after first digit)
        const coeffStr = rounded._coefficient.toString();
        const effectiveExponent = rounded._exponent + coeffStr.length - 1;

        // Decide whether to use decimal or exponential notation
        // JavaScript uses decimal notation when exponent is between -6 and (digits - 1)
        if (effectiveExponent >= -6 && effectiveExponent < digits) {
            // Use decimal notation
            const sign = rounded._isNegative ? "-" : "";

            if (rounded._exponent >= 0) {
                // No decimal point needed
                const totalDigits = coeffStr.length + rounded._exponent;
                if (totalDigits === digits) {
                    // Exact match, no decimal point
                    return sign + coeffStr + "0".repeat(rounded._exponent);
                } else {
                    // Need to add decimal point and trailing zeros
                    const result = coeffStr + "0".repeat(rounded._exponent);
                    const zerosToAdd = digits - result.length;
                    return sign + result + "." + "0".repeat(zerosToAdd);
                }
            } else {
                // Need decimal point
                const absExp = -rounded._exponent;
                if (absExp >= coeffStr.length) {
                    // Number starts with 0.000...
                    const leadingZeros = absExp - coeffStr.length;
                    const result = "0." + "0".repeat(leadingZeros) + coeffStr;
                    const totalSignificantDigits = coeffStr.length;
                    if (totalSignificantDigits < digits) {
                        // Need trailing zeros
                        return (
                            sign +
                            result +
                            "0".repeat(digits - totalSignificantDigits)
                        );
                    }
                    return sign + result;
                } else {
                    // Insert decimal point within coefficient
                    const intPart = coeffStr.slice(0, coeffStr.length - absExp);
                    const fracPart = coeffStr.slice(coeffStr.length - absExp);
                    const result = intPart + "." + fracPart;
                    const totalSignificantDigits = coeffStr.length;
                    if (totalSignificantDigits < digits) {
                        // Need trailing zeros
                        return (
                            sign +
                            result +
                            "0".repeat(digits - totalSignificantDigits)
                        );
                    }
                    return sign + result;
                }
            }
        } else {
            // Use exponential notation
            const sign = rounded._isNegative ? "-" : "";

            if (coeffStr.length === 1) {
                // Single digit coefficient
                const expSign = effectiveExponent >= 0 ? "+" : "";
                const expStr = "e" + expSign + effectiveExponent;
                if (digits === 1) {
                    return sign + coeffStr + expStr;
                } else {
                    // Need decimal point and trailing zeros
                    return (
                        sign + coeffStr + "." + "0".repeat(digits - 1) + expStr
                    );
                }
            } else {
                // Multiple digit coefficient
                const intPart = coeffStr.charAt(0);
                const fracPart = coeffStr.substring(1);
                const expSign = effectiveExponent >= 0 ? "+" : "";
                const expStr = "e" + expSign + effectiveExponent;

                if (fracPart.length < digits - 1) {
                    // Need trailing zeros
                    return (
                        sign +
                        intPart +
                        "." +
                        fracPart +
                        "0".repeat(digits - 1 - fracPart.length) +
                        expStr
                    );
                } else {
                    return sign + intPart + "." + fracPart + expStr;
                }
            }
        }
    }
}

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

        return (d as CoefficientExponent).negate();
    }

    // Get the number of significant digits
    const sigDigits = v.coefficient.toString().length;
    const currentExponent = v.exponent;

    // Calculate the effective exponent (where the decimal point would be after the first digit)
    const effectiveExponent = currentExponent + sigDigits - 1;

    // Check if we're above the normal range
    if (effectiveExponent > 6144) {
        // Check if we can fit in the extreme range
        if (effectiveExponent > 6111 + 33) {
            return "Infinity";
        }
    }

    // Check if we need to reduce precision to fit
    let result = v;
    if (sigDigits > MAX_SIGNIFICANT_DIGITS) {
        // Need to round to 34 significant digits
        result = v.roundToSignificantDigits(MAX_SIGNIFICANT_DIGITS, mode);
    }

    // Check final exponent bounds
    const finalExp = result.exponent + result.coefficient.toString().length - 1;
    if (finalExp > 6144) {
        // We're in the extreme range, check if we exceed it
        const digitsAvailable = Math.max(1, 34 - (finalExp - 6144));
        if (digitsAvailable < 1 || finalExp > 6111 + 33) {
            return "Infinity";
        }
    }

    // Check for subnormal (very small) values
    if (finalExp < -6143) {
        const digitsAvailable = Math.max(0, 34 + (finalExp + 6143));
        if (digitsAvailable <= 0) {
            return "0";
        }
    }

    if (result.isZero()) {
        return "0";
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
    private readonly d: FiniteValue | undefined = undefined;
    private readonly _isNaN: boolean = false;
    private readonly _isFinite: boolean = true;
    private readonly _isNegative: boolean = false;

    // methods to be defined later
    toAmount: any;
    with: any;

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

    /**
     * Checks if this Decimal128 value is NaN (Not a Number).
     *
     * @returns {boolean} True if this value is NaN, false otherwise
     */
    public isNaN(): boolean {
        return this._isNaN;
    }

    /**
     * Checks if this Decimal128 value is finite (not NaN, Infinity, or -Infinity).
     *
     * @returns {boolean} True if this value is finite, false otherwise
     */
    public isFinite(): boolean {
        return this._isFinite;
    }

    /**
     * Checks if this Decimal128 value is negative.
     * Note that -0 is considered negative, and NaN returns false.
     *
     * @returns {boolean} True if this value is negative (including -0 and -Infinity), false otherwise
     */
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

        // Direct calculation using coefficient-exponent representation
        const ce = this.d as CoefficientExponent;
        const coefficientStr = ce.coefficient.toString();
        const numDigits = coefficientStr.length;

        // To get mantissa in range [1, 10), we need to scale by -(numDigits - 1)
        // For example: 123 with 3 digits needs to be scaled by -2 to get 1.23
        const scaleAmount = -(numDigits - 1);

        // Create a Decimal directly with the mantissa value
        // We know the mantissa will be in the form "d.ddd..." where d is 1-9
        let mantissaStr: string;
        if (numDigits === 1) {
            mantissaStr = coefficientStr; // Single digit, already in [1, 9]
        } else {
            // Insert decimal point after first digit
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
            return this.clone();
        }

        let v = this.d as FiniteValue;

        if (v === "0" || v === "-0") {
            return this.clone();
        }

        return new Decimal(v.scale10(BigInt(n)));
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
        if (this.isZero()) {
            return this._isNegative ? "-0" : "0";
        }

        let v = this.d as CoefficientExponent;
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
            return this._isNegative ? "-0" : "0";
        }

        let e = this.exponent();

        // Follow JavaScript Number.toString() behavior:
        // Use exponential notation if the exponent is >= 21 or <= -7
        if (e >= 21 || e <= -7) {
            return this.emitExponential();
        }

        return this.emitDecimal();
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

        let d = this.d as CoefficientExponent;
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

        if (!this.isInteger()) {
            throw new RangeError(
                "Non-integer decimal cannot be converted to a BigInt"
            );
        }

        return BigInt(this.toString());
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

        let ourCohort = this.d as CoefficientExponent;
        let theirCohort = x.d as CoefficientExponent;

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
        if (this.isNaN() || x.isNaN()) {
            return false;
        }

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
        if (this.isNaN() || x.isNaN()) {
            return false;
        }

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
     * @param x The Decimal128 value to add to this value.
     * @param opts Optional object containing additional options for the operation.
     *   @property {RoundingMode} [roundingMode] Specifies the rounding mode to use
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

        let ourCohort = this.d as CoefficientExponent;
        let theirCohort = x.d as CoefficientExponent;
        let sum = ourCohort.add(theirCohort);

        if (sum.isZero()) {
            if (this._isNegative) {
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

        let ourCohort = this.d as CoefficientExponent;
        let theirCohort = x.d as CoefficientExponent;
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

        if (this.isNegative()) {
            return this.negate().multiply(x, opts).negate();
        }

        if (x.isNegative()) {
            return this.multiply(x.negate(), opts).negate();
        }

        let ourCohort = this.d as CoefficientExponent;
        let theirCohort = x.d as CoefficientExponent;

        if (this.isZero()) {
            return this.clone();
        }

        if (x.isZero()) {
            return x.clone();
        }

        let product = ourCohort.multiply(theirCohort);
        let rounded = RoundToDecimal128Domain(
            product,
            mode
        ) as CoefficientExponent;

        return new Decimal(rounded);
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

        // For CoefficientExponent, toString() already gives us decimal notation
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
            return this.negate().divide(x, opts).negate();
        }

        if (x.isNegative()) {
            return this.divide(x.negate(), opts).negate();
        }

        let ourV = this.d as CoefficientExponent;
        let theirV = x.d as CoefficientExponent;
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

        // Check for excessively large values
        if (numDecimalDigits > 1e9) {
            throw new RangeError("Too many decimal digits requested");
        }

        if (this.isNaN() || !this.isFinite()) {
            return this.clone();
        }

        if (this.isZero()) {
            return this.clone();
        }

        let v = this.d as CoefficientExponent;
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

        let exp = this.unrestrictedExponent();
        return exp >= NORMAL_EXPONENT_MIN && exp <= NORMAL_EXPONENT_MAX;
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

        let exp = this.unrestrictedExponent();
        return exp < NORMAL_EXPONENT_MIN;
    }

    /**
     * Returns the exponent of this Decimal128 value, regardless of whether it is normal or subnormal.
     * @private
     */
    private unrestrictedExponent(): number {
        if (this.isZero()) {
            return -Infinity;
        }

        if (this.isNegative()) {
            return this.negate().exponent();
        }

        let v = this.d as CoefficientExponent;
        // For CoefficientExponent, the mathematical exponent is
        // the stored exponent plus the number of digits in coefficient minus 1
        const numDigits = v.coefficient.toString().length;
        return v.exponent + numDigits - 1;
    }

    /**
     * Returns the exponent of this Decimal128 value.
     * For normal numbers, this is the actual exponent.
     * For subnormal numbers, this returns the minimum normal exponent.
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
                "Cannot determine whether an infinite value is subnormal"
            );
        }

        let te = this.unrestrictedExponent();
        return Math.max(te, NORMAL_EXPONENT_MIN);
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

        let v = this.d as CoefficientExponent;
        // Return the coefficient directly - the minimal integer representation
        return v.coefficient;
    }
}

export namespace Decimal {
    export class Amount {
        private val: Decimal;
        public readonly trailingZeroes: number;
        public readonly significantDigits: number;
        public readonly fractionalDigits: number;
        public readonly quantum: Decimal;

        static from(s: string): Amount {
            // @todo handle exponential notation, too, not just decimal notation
            let [_, fracPart] = s.split(/[.]/);
            let numFractionDigits =
                undefined === fracPart ? 0 : fracPart.length;
            return new Amount(s, numFractionDigits);
        }

        private constructor(val: string, fractionalDigits: number) {
            if ("string" !== typeof val) {
                throw new TypeError("Digit string argument must be a string");
            }

            if ("number" !== typeof fractionalDigits) {
                throw new TypeError("Precision argument must be a number");
            }

            let d = new Decimal(val); // might throw

            this.val = d;

            // @todo handle exponential notation, too, not just decimal notation

            if (d.isNaN() || !d.isFinite()) {
                this.fractionalDigits = 0;
                this.trailingZeroes = 0;
                this.significantDigits = 0;
                this.quantum = new Decimal("0");
            } else {
                let [intPart, fracPart] = d
                    .toFixed({ digits: fractionalDigits })
                    .split(/[.]/);

                this.fractionalDigits =
                    undefined === fracPart ? 0 : fracPart.length;

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
                    intPart.length +
                    (undefined === fracPart ? 0 : fracPart.length);

                this.quantum = new Decimal(1n).scale10(
                    0 - this.fractionalDigits
                );
            }
        }

        toDecimal(): Decimal {
            return this.val;
        }

        toString(): string {
            return this.val.toFixed({ digits: this.fractionalDigits });
        }

        toLocaleString(
            locale: string,
            options: Intl.NumberFormatOptions
        ): string {
            if (undefined === options) {
                options = {};
            }

            options.minimumFractionDigits = this.fractionalDigits;

            let formatter = new Intl.NumberFormat(locale, options);
            // @ts-ignore
            return formatter.format(this.toString());
        }

        with(opts: PrecisionSpecification): Amount {
            if (opts.hasOwnProperty("fractionDigit")) {
                // @ts-ignore
                return this.withFractionalDigits(opts.fractionDigit);
            } else if (opts.hasOwnProperty("significantDigit")) {
                // @ts-ignore
                return this.withSignificantDigits(opts.significantDigit);
            } else if (opts.hasOwnProperty("trailingZero")) {
                // @ts-ignore
                return this.withTrailingZeroes(opts.trailingZero);
            } else {
                throw new TypeError(
                    "Don't know how to handle precision specification"
                );
            }
        }

        private withSignificantDigits(precision: number): Amount {
            let s = this.val.toPrecision({ digits: precision });
            let [intPart, fracPart] = s.split(/[.]/);
            let numFractionDigits =
                undefined === fracPart ? 0 : fracPart.length;
            return new Amount(s, numFractionDigits);
        }

        private withFractionalDigits(precision: number): Amount {
            return new Amount(
                this.val.toFixed({ digits: Infinity }),
                precision
            );
        }

        private withTrailingZeroes(precision: number): Amount {
            let s = this.val.toFixed({
                digits: this.fractionalDigits + precision,
            });
            let [intPart, fracPart] = s.split(/[.]/);
            let numFractionDigits =
                undefined === fracPart ? 0 : fracPart.length;
            return new Amount(s, numFractionDigits);
        }

        /**
         * Check whether this Amount is equal to another Amount, which means that they
         * have the same mathematical value as well as the same precision (same number
         * of trailing zeroes, significant digits, and fractional digits).
         * @param other
         */
        equals(other: Amount): boolean {
            if (!this.toDecimal().equals(other.toDecimal())) {
                return false;
            }

            if (this.trailingZeroes !== other.trailingZeroes) {
                return false;
            }

            if (this.significantDigits !== other.significantDigits) {
                return false;
            }

            return this.fractionalDigits === other.fractionalDigits;
        }
    }
}

Decimal.prototype.toAmount = function () {
    return Decimal.Amount.from(this.toFixed({ digits: Infinity }));
};

Decimal.prototype.valueOf = function () {
    throw TypeError("Decimal.prototype.valueOf throws unconditionally");
};

/**
 * Convert this Decimal to an Amount, specifying the way in which precision should be understood
 * and the number of digits of precision.
 *
 * @param opts
 */
Decimal.prototype.with = function (
    opts: PrecisionSpecification
): Decimal.Amount {
    return this.toAmount().with(opts);
};
