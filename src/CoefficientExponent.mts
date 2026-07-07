/**
 * CoefficientExponent.mts -- exact decimal values as coefficient * 10^exponent
 *
 * Internal module backing Decimal.mts. It is deliberately not exposed to
 * users of this package: the `exports` field in package.json restricts
 * imports to the main entry point, so this module cannot be deep-imported.
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

/**
 * Apply a rounding mode to a positive CoefficientExponent value
 * This is an internal helper function corresponding to the spec's abstract operation
 */
function ApplyRoundingModeToPositive(
    value: CoefficientExponent,
    mode: RoundingMode
): CoefficientExponent {
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

    if (mode === ROUNDING_MODE_HALF_EXPAND) {
        return mHigh;
    }

    // ROUNDING_MODE_HALF_EVEN: round to even
    if (mLow.isInteger()) {
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
export class CoefficientExponent {
    private readonly _coefficient: bigint;
    private readonly _exponent: number;
    private readonly _isNegative: boolean;

    /**
     * Creates a new CoefficientExponent instance representing a decimal number as coefficient * 10^exponent.
     * The coefficient is always non-negative; the sign is stored separately.
     * @param {bigint} coefficient - The coefficient value (must be non-negative)
     * @param {number} exponent - The power of 10 exponent (must be an integer)
     * @param {boolean} [isNegative=false] - Whether the number is negative
     */
    constructor(
        coefficient: bigint,
        exponent: number,
        isNegative: boolean = false
    ) {
        // Normalize: remove trailing zeros
        let c = coefficient;
        let e = exponent;

        this._isNegative = isNegative;

        if (c === 0n) {
            this._coefficient = 0n;
            this._exponent = 0;
        } else {
            const s = c.toString();
            const trimmed = s.replace(/0+$/, "");
            this._coefficient = BigInt(trimmed);
            this._exponent = e + (s.length - trimmed.length);
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
        return new CoefficientExponent(
            this._coefficient,
            this._exponent,
            false
        );
    }

    /**
     * Parse a string into a CoefficientExponent
     * Handles decimal notation including scientific notation
     */
    static from(s: string): CoefficientExponent {
        let isNegative = false;
        if (s.startsWith("-")) {
            isNegative = true;
            s = s.substring(1);
        }

        // Handle cases like ".5" (no integer part) and "17." (trailing decimal)
        const match = s.match(/^(\d*)(?:\.(\d*))?(?:[eE]([-+]?\d+))?$/);
        if (!match || (match[1] === "" && (!match[2] || match[2] === ""))) {
            throw new SyntaxError("Invalid decimal string");
        }

        const [, intPart = "0", fracPart = "", expPart = "0"] = match;

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
        const sign = this._isNegative ? "-" : "";
        const coeffStr = this._coefficient.toString();
        const exp = this._exponent;

        if (exp >= 0) {
            return sign + coeffStr + "0".repeat(exp);
        } else {
            const absExp = -exp;
            if (absExp >= coeffStr.length) {
                // Need leading zeros after decimal point
                const leadingZeros = absExp - coeffStr.length;
                return sign + "0." + "0".repeat(leadingZeros) + coeffStr;
            } else {
                const intPart = coeffStr.slice(0, coeffStr.length - absExp);
                const fracPart = coeffStr.slice(coeffStr.length - absExp);
                return sign + intPart + "." + fracPart;
            }
        }
    }

    /**
     * Compare two CoefficientExponent values.
     * @param {CoefficientExponent} other - The value to compare with
     * @returns {-1|0|1} -1 if this < other, 0 if equal, 1 if this > other
     */
    cmp(other: CoefficientExponent): -1 | 0 | 1 {
        if (this._isNegative && !other._isNegative) {
            return -1;
        }

        if (!this._isNegative && other._isNegative) {
            return 1;
        }

        return this.compareMagnitude(other);
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
            if (this._coefficient < other._coefficient) return -1;
            if (this._coefficient > other._coefficient) return 1;
            return 0;
        }

        // Different exponents - align them. Normalized values with unequal
        // exponents can never compare equal here (the scaled magnitude ends in
        // a zero, the normalized one does not), so the boundary mutants below
        // are equivalent.
        // Stryker disable next-line EqualityOperator: exp1 === exp2 handled above
        if (exp1 > exp2) {
            // this has larger exponent, so scale this coefficient up
            const diff = exp1 - exp2;
            const scaledThisCoeff = this._coefficient * 10n ** BigInt(diff);
            // Stryker disable next-line EqualityOperator: scaled vs normalized magnitudes are never equal
            if (scaledThisCoeff < other._coefficient) {
                return -1;
            }

            return 1;
        } else {
            // other has larger exponent, so scale other coefficient up
            const diff = exp2 - exp1;
            const scaledOtherCoeff = other._coefficient * 10n ** BigInt(diff);
            // Stryker disable next-line EqualityOperator: scaled vs normalized magnitudes are never equal
            if (this._coefficient < scaledOtherCoeff) {
                return -1;
            }

            return 1;
        }
    }

    /**
     * Returns this value's coefficient scaled down to the given exponent, with
     * its sign applied. The target exponent must be less than or equal to this
     * value's own exponent, so the scaling factor is a non-negative power of 10.
     * @param {number} exponent - The exponent to align to (<= this._exponent)
     * @returns {bigint} The signed coefficient expressed at the target exponent
     * @private
     */
    private signedCoefficientAt(exponent: number): bigint {
        const scaled =
            this._coefficient * 10n ** BigInt(this._exponent - exponent);
        return this._isNegative ? -scaled : scaled;
    }

    /**
     * Adds two CoefficientExponent values.
     * @param {CoefficientExponent} other - The value to add
     * @returns {CoefficientExponent} The sum of the two values
     */
    add(other: CoefficientExponent): CoefficientExponent {
        // Align both operands to the smaller exponent and add their signed
        // coefficients directly. Signed BigInt arithmetic handles every sign
        // combination -- including exact cancellation to +0 -- without
        // branching on sign or deferring to subtract().
        const minExp = Math.min(this._exponent, other._exponent);
        const sum =
            this.signedCoefficientAt(minExp) +
            other.signedCoefficientAt(minExp);
        const isNegative = sum < 0n;

        return new CoefficientExponent(
            isNegative ? -sum : sum,
            minExp,
            isNegative
        );
    }

    /**
     * Subtracts another CoefficientExponent value from this one.
     * @param {CoefficientExponent} other - The value to subtract
     * @returns {CoefficientExponent} The difference of the two values
     */
    subtract(other: CoefficientExponent): CoefficientExponent {
        // a - b is a + (-b); negate() is sign-only, so this is not recursive.
        return this.add(other.negate());
    }

    /**
     * Multiplies two CoefficientExponent values.
     * @param {CoefficientExponent} other - The value to multiply by
     * @returns {CoefficientExponent} The product of the two values
     */
    multiply(other: CoefficientExponent): CoefficientExponent {
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
     */
    divide(other: CoefficientExponent): CoefficientExponent {
        // To get an exact result, we need to scale up the dividend
        // We'll use a large scale factor to ensure precision
        const scaleFactor = 100; // This gives us 100 extra decimal places
        const scaledDividend = this._coefficient * 10n ** BigInt(scaleFactor);

        const quotient = scaledDividend / other._coefficient;

        // The scaled quotient is used whether or not the division is exact;
        // any remainder is simply truncated at the chosen scale factor.
        const exponent = this._exponent - other._exponent - scaleFactor;
        const isNegative = this._isNegative !== other._isNegative;
        return new CoefficientExponent(quotient, exponent, isNegative);
    }

    /**
     * Gets the floor (largest integer less than or equal to this value).
     * @returns {CoefficientExponent} The floor value
     */
    floor(): CoefficientExponent {
        // Stryker disable next-line EqualityOperator: exponent 0 produces the same value through the truncation path below (divisor 10^0 = 1)
        if (this._exponent >= 0) {
            return this;
        }

        const fracDigits = -this._exponent;
        const divisor = 10n ** BigInt(fracDigits);
        const truncatedCoeff = this._coefficient / divisor;

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

        const fracDigits = -this._exponent;
        const divisor = 10n ** BigInt(fracDigits);
        return this._coefficient % divisor === 0n;
    }

    /**
     * Rounds to a specified number of significant digits.
     * @param {number} numSignificantDigits - The number of significant digits to keep
     * @param {RoundingMode} mode - The rounding mode to use
     * @returns {CoefficientExponent} The rounded value
     */
    roundToSignificantDigits(
        numSignificantDigits: number,
        mode: RoundingMode
    ): CoefficientExponent {
        const currentDigits = this._coefficient.toString().length;
        // Stryker disable next-line EqualityOperator: when currentDigits === numSignificantDigits the path below removes zero digits and returns an equal value, so the strict-vs-non-strict boundary is equivalent
        if (currentDigits <= numSignificantDigits) {
            return this;
        }

        // Need to remove (currentDigits - numSignificantDigits) digits from the right
        const digitsToRemove = currentDigits - numSignificantDigits;
        const divisor = 10n ** BigInt(digitsToRemove);
        const quotient = this._coefficient / divisor;
        const remainder = this._coefficient % divisor;

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

                if (mode === ROUNDING_MODE_HALF_EXPAND) {
                    return true;
                }
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
     */
    round(
        numFractionalDigits: number,
        mode: RoundingMode
    ): CoefficientExponent {
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
        const rounded = this.roundToSignificantDigits(
            digits,
            ROUNDING_MODE_HALF_EVEN
        );

        // Calculate the effective exponent (where decimal point would be after the first digit)
        const coeffStr = rounded._coefficient.toString();
        const effectiveExponent = rounded._exponent + coeffStr.length - 1;

        // Decide whether to use decimal or exponential notation
        // JavaScript uses decimal notation when exponent is between -6 and (digits - 1)
        if (effectiveExponent >= -6 && effectiveExponent < digits) {
            const sign = rounded._isNegative ? "-" : "";

            if (rounded._exponent >= 0) {
                const totalDigits = coeffStr.length + rounded._exponent;
                const intStr = coeffStr + "0".repeat(rounded._exponent);
                if (totalDigits < digits) {
                    // Pad with trailing zeros to reach the requested precision
                    return (
                        sign + intStr + "." + "0".repeat(digits - totalDigits)
                    );
                }
                return sign + intStr;
            } else {
                const absExp = -rounded._exponent;
                if (absExp >= coeffStr.length) {
                    // Number starts with 0.000...
                    const leadingZeros = absExp - coeffStr.length;
                    const result = "0." + "0".repeat(leadingZeros) + coeffStr;
                    const totalSignificantDigits = coeffStr.length;
                    // totalSignificantDigits <= digits (we rounded to `digits`
                    // significant digits), so this pads when short and is a
                    // no-op ("0".repeat(0)) when exact.
                    return (
                        sign +
                        result +
                        "0".repeat(digits - totalSignificantDigits)
                    );
                } else {
                    const intPart = coeffStr.slice(0, coeffStr.length - absExp);
                    const fracPart = coeffStr.slice(coeffStr.length - absExp);
                    const result = intPart + "." + fracPart;
                    const totalSignificantDigits = coeffStr.length;
                    // Pads when short, no-op ("0".repeat(0)) when exact.
                    return (
                        sign +
                        result +
                        "0".repeat(digits - totalSignificantDigits)
                    );
                }
            }
        } else {
            const sign = rounded._isNegative ? "-" : "";

            if (coeffStr.length === 1) {
                const expStr = formatExponent(effectiveExponent);
                if (digits > 1) {
                    // Pad with trailing zeros to reach the requested precision
                    return (
                        sign + coeffStr + "." + "0".repeat(digits - 1) + expStr
                    );
                }
                return sign + coeffStr + expStr;
            } else {
                const intPart = coeffStr.charAt(0);
                const fracPart = coeffStr.substring(1);
                const expStr = formatExponent(effectiveExponent);

                // fracPart.length <= digits - 1, so this pads when short and is
                // a no-op ("0".repeat(0)) when exact.
                return (
                    sign +
                    intPart +
                    "." +
                    fracPart +
                    "0".repeat(digits - 1 - fracPart.length) +
                    expStr
                );
            }
        }
    }
}

// Formats an exponent as the suffix used in exponential notation, always
// with an explicit sign (e.g. 5 -> "e+5", -3 -> "e-3", 0 -> "e+0").
export function formatExponent(e: number): string {
    return "e" + (e < 0 ? "-" : "+") + Math.abs(e);
}
