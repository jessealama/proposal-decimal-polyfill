import {
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
    ROUNDING_MODE_HALF_EXPAND,
    ROUNDING_MODE_TRUNCATE,
    RoundingMode,
} from "./common.mjs";

const zero = 0n;
const one = 1n;
const minusOne = -1n;
const ten = 10n;

function gcd(a: bigint, b: bigint): bigint {
    while (b !== zero) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

export class Rational {
    readonly numerator: bigint;
    readonly denominator: bigint;
    readonly isNegative: boolean;

    constructor(p: bigint, q: bigint) {
        if (q === zero) {
            throw new RangeError(
                "Cannot construct rational whose denominator is zero"
            );
        }

        let num = p;
        let den = q;
        let neg = false;

        if (p < zero) {
            if (q < zero) {
                num = -p;
                den = -q;
            } else {
                num = -p;
                neg = true;
            }
        } else if (q < zero) {
            den = -q;
            neg = true;
        }

        let g = gcd(num, den);
        this.numerator = num / g;
        this.denominator = den / g;
        this.isNegative = neg;
    }

    public toString(): string {
        return `${this.isNegative ? "-" : ""}${this.numerator}/${
            this.denominator
        }`;
    }

    public static fromString(s: string): Rational {
        if (s.match(/^-/)) {
            return Rational.fromString(s.substring(1)).negate();
        }

        if (s.match(/^[0-9]+$/)) {
            return new Rational(BigInt(s), 1n);
        }

        if (s.match(/^[0-9]+[eE][+-]?[0-9]+$/)) {
            let [num, exp] = s.split(/[eE]/);
            let originalRat = new Rational(BigInt(num), 1n);
            return originalRat.scale10(BigInt(exp));
        }

        if (s.match(/[.]/)) {
            let [whole, decimal] = s.split(".");

            if (decimal.match(/[eE]/)) {
                let [dec, exp] = decimal.split(/[eE]/);
                let originalRat = Rational.fromString(`${whole}.${dec}`);
                return originalRat.scale10(BigInt(exp));
            }

            let numerator = BigInt(whole + decimal);
            let denominator = ten ** BigInt(decimal.length);
            return new Rational(numerator, denominator);
        }

        throw new SyntaxError(`Invalid rational number string: ${s}`);
    }

    public scale10(n: bigint): Rational {
        if (this.isNegative) {
            return this.negate().scale10(n).negate();
        }

        if (n === 0n) {
            return this;
        }

        if (n < 0) {
            return new Rational(
                this.numerator,
                this.denominator * ten ** (0n - n)
            );
        }

        return new Rational(
            this.numerator * ten ** BigInt(n),
            this.denominator
        );
    }

    public negate(): Rational {
        if (this.isNegative) {
            return new Rational(this.numerator, this.denominator);
        }

        return new Rational(this.numerator * minusOne, this.denominator);
    }

    public add(y: Rational): Rational {
        if (this.isNegative) {
            return y.subtract(this.negate());
        }

        if (y.isNegative) {
            return this.subtract(y.negate());
        }

        return new Rational(
            this.numerator * y.denominator + y.numerator * this.denominator,
            this.denominator * y.denominator
        );
    }

    public subtract(y: Rational): Rational {
        if (this.isNegative) {
            return this.negate().add(y).negate();
        }

        return new Rational(
            this.numerator * y.denominator - y.numerator * this.denominator,
            this.denominator * y.denominator
        );
    }

    public multiply(y: Rational): Rational {
        return new Rational(
            this.numerator * y.numerator,
            this.denominator * y.denominator
        );
    }

    public divide(y: Rational): Rational {
        return new Rational(
            this.numerator * y.denominator,
            this.denominator * y.numerator
        );
    }

    /**
     * Convert the rational number to its exact decimal representation
     * This will only terminate for rational numbers whose denominator only has
     * prime factors of 2 and 5
     * @returns The exact decimal representation as a string
     */
    private toExactDecimal(): string {
        if (this.denominator === 1n) {
            return (this.isNegative ? "-" : "") + this.numerator.toString();
        }

        // Decompose denominator to check if it only has factors of 2 and 5
        let denom = this.denominator;
        let factor2 = 0;
        let factor5 = 0;

        // Count factors of 2
        while (denom % 2n === 0n) {
            denom /= 2n;
            factor2++;
        }

        // Count factors of 5
        while (denom % 5n === 0n) {
            denom /= 5n;
            factor5++;
        }

        // Find how many decimal places we need (max of factors of 2 and 5)
        const decimalPlaces = Math.max(factor2, factor5);

        // Calculate the exact decimal value
        // Multiply by 10^decimalPlaces to get an integer, then divide back
        const scaleFactor = 10n ** BigInt(decimalPlaces);

        // Ensure we have enough precision by scaling up first
        const scaledNum = this.numerator * scaleFactor;
        const exactValue = scaledNum / this.denominator;

        // Split into integer and fractional parts
        const integerPart = exactValue / scaleFactor;
        const fractionalPart = exactValue % scaleFactor;

        // Convert to string, ensuring the fractional part has the correct number of digits
        let fractionalStr = fractionalPart.toString().replace(/-/g, "");
        fractionalStr = fractionalStr.padStart(decimalPlaces, "0");

        // Trim trailing zeros (since we're showing the exact representation)
        fractionalStr = fractionalStr.replace(/0+$/, "");

        let prefix = this.isNegative ? "-" : "";

        // Combine integer and fractional parts
        return fractionalStr.length > 0
            ? `${prefix}${integerPart}.${fractionalStr}`
            : `${prefix}${integerPart}`;
    }

    public toFixed(decimalPlaces: number): string {
        if (decimalPlaces !== Infinity && !Number.isInteger(decimalPlaces)) {
            throw new TypeError(
                "Cannot enumerate a non-integer number of decimal places"
            );
        }

        if (decimalPlaces < 0) {
            throw new RangeError(
                "Cannot enumerate a negative number of decimal places"
            );
        }

        // Handle special case for Infinity - we need to calculate the exact representation
        if (decimalPlaces === Infinity) {
            return this.toExactDecimal();
        }

        if (this.isZero()) {
            return decimalPlaces === 0 ? "0" : `0.${"0".repeat(decimalPlaces)}`;
        }

        // Regular finite decimal places case
        // Get a rounded version of the value
        const rounded = this.round(decimalPlaces, "halfEven");

        // Calculate the integer and fractional parts
        const scaleFactor = 10n ** BigInt(decimalPlaces as number);
        const integerPart = rounded.numerator / rounded.denominator;
        const fractionalPart =
            ((rounded.numerator * scaleFactor) / rounded.denominator) %
            scaleFactor;
        const prefix = rounded.isNegative ? "-" : "";

        // Convert to string, ensuring the fractional part has the correct number of digits
        let fractionalStr = fractionalPart.toString().replace(/-/g, "");
        fractionalStr = fractionalStr.padStart(decimalPlaces as number, "0");

        // Combine integer and fractional parts
        return decimalPlaces === 0
            ? `${prefix}${integerPart.toString()}`
            : `${prefix}${integerPart}.${fractionalStr}`;
    }

    public mantissa(): Rational {
        if (this.isNegative) {
            return this.negate().mantissa().negate();
        }

        let x: Rational = this;
        let ratOne = new Rational(1n, 1n);
        let ratTen = new Rational(10n, 1n);

        while (0 <= x.cmp(ratTen)) {
            x = x.scale10(-1n);
        }

        while (x.cmp(ratOne) === -1) {
            x = x.scale10(1n);
        }

        return x;
    }

    public exponent(): bigint {
        if (this.isNegative) {
            return this.negate().exponent();
        }

        let e = 0n;
        let x: Rational = this;
        let ratOne = new Rational(1n, 1n);
        let ratTen = new Rational(10n, 1n);

        while (0 <= x.cmp(ratTen)) {
            x = x.scale10(-1n);
            e++;
        }

        while (x.cmp(ratOne) === -1) {
            x = x.scale10(1n);
            e--;
        }

        return e;
    }

    public toPrecision(precision: bigint): string {
        let exponent = this.exponent();

        // Determine if we should use fixed-point or exponential notation
        const useExponential = exponent < -6n || exponent >= precision;
        let scale = Math.max(0, Number(precision - 1n - exponent));

        if (useExponential) {
            // Convert to mantissa and exponent format
            let mantissa = this.mantissa();
            let scaledMantissa = mantissa.scale10(precision - 1n);
            let roundedScaledMantissa = scaledMantissa.round(0, "halfEven");
            let recaledMantissa = roundedScaledMantissa.scale10(1n - precision);
            let rescaledMantissaStr = recaledMantissa.toFixed(Infinity);

            // Possible pad with trailing zeros, if required
            let [intPart, fractionalPart] = rescaledMantissaStr
                .replace(/^-/, "")
                .split(".");

            let numDigits =
                intPart.length + (fractionalPart ? fractionalPart.length : 0);

            if (precision > numDigits) {
                let zerosToPad = Number(precision) - numDigits;
                rescaledMantissaStr += "0".repeat(zerosToPad);
            }

            // Return in exponential notation
            return `${rescaledMantissaStr}e${exponent >= 0 ? "+" : ""}${exponent}`;
        } else {
            // Use toFixed with the calculated number of decimal places
            return this.toFixed(scale);
        }
    }

    round(numFractionalDigits: number, mode: RoundingMode): Rational {
        if (numFractionalDigits < 0) {
            throw new RangeError(
                "Cannot round to negative number of decimal places"
            );
        }

        let sign = this.isNegative ? -1 : 1;
        let scaled = this.scale10(BigInt(numFractionalDigits));

        if (sign === -1) {
            scaled = scaled.negate();
            if (mode === ROUNDING_MODE_FLOOR) {
                mode = ROUNDING_MODE_CEILING;
            } else if (mode === ROUNDING_MODE_CEILING) {
                mode = ROUNDING_MODE_FLOOR;
            }
        }

        let roundedScaled = scaled.ApplyRoundingModeToPositive(mode);

        if (sign === -1) {
            roundedScaled = roundedScaled.negate();
        }

        return roundedScaled.scale10(0n - BigInt(numFractionalDigits));
    }

    cmp(x: Rational): -1 | 0 | 1 {
        let a =
            (this.isNegative ? minusOne : one) * this.numerator * x.denominator;
        let b =
            (x.isNegative ? minusOne : one) * x.numerator * this.denominator;

        if (a < b) {
            return -1;
        }

        if (b < a) {
            return 1;
        }

        return 0;
    }

    isInteger(): boolean {
        return this.denominator === 1n;
    }

    isZero(): boolean {
        return this.numerator === zero;
    }

    floor(): Rational {
        return new Rational(this.numerator / this.denominator, 1n);
    }

    intLog10(): bigint {
        let ratOne = new Rational(1n, 1n);
        let ratTen = new Rational(10n, 1n);

        if (this.cmp(ratOne) === -1) {
            let q = ratOne;
            let n = 0n;
            while (this.cmp(q) === -1) {
                q = q.scale10(-1n);
                n++;
            }

            return 0n - n;
        }

        if (this.cmp(ratOne) === 0) {
            return 0n;
        }

        let q = ratTen;
        let n = 0n;
        while (this.cmp(q) >= 0) {
            q = q.scale10(1n);
            n++;
        }

        return n;
    }

    public ApplyRoundingModeToPositive(roundingMode: RoundingMode): Rational {
        let mLow = this.floor();
        let fraction = this.subtract(mLow);

        if (fraction.isZero()) {
            return mLow;
        }

        let mHigh = mLow.add(new Rational(1n, 1n));

        if (
            roundingMode === ROUNDING_MODE_FLOOR ||
            roundingMode === ROUNDING_MODE_TRUNCATE
        ) {
            return mLow;
        }

        if (roundingMode === ROUNDING_MODE_CEILING) {
            return mHigh;
        }

        let oneHalf = new Rational(1n, 2n);

        if (fraction.cmp(oneHalf) === -1) {
            return mLow;
        }

        if (fraction.cmp(oneHalf) === 1) {
            return mHigh;
        }

        if (roundingMode === ROUNDING_MODE_HALF_EXPAND) {
            return mHigh;
        }

        if (mLow.isInteger() && mLow.divide(new Rational(2n, 1n)).isInteger()) {
            return mLow;
        }

        return mHigh;
    }

    public coefficient(): bigint {
        if (this.isInteger()) {
            return this.numerator;
        }

        return this.scale10(1n).coefficient();
    }
}
