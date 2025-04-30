import {
    countFractionalDigits,
    Digit,
    ROUNDING_MODE_CEILING,
    ROUNDING_MODE_FLOOR,
    ROUNDING_MODE_HALF_EVEN,
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

function* nextDigitForDivision(
    x: bigint,
    y: bigint,
    n: number
): Generator<Digit> {
    let result = "";
    let emittedDecimalPoint = false;
    let done = false;

    while (!done && countFractionalDigits(result) < n) {
        if (x === zero) {
            done = true;
        } else if (x < y) {
            if (emittedDecimalPoint) {
                x = x * ten;
                if (x < y) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            } else {
                emittedDecimalPoint = true;
                result = (result === "" ? "0" : result) + ".";
                x = x * ten;
                yield -1;
                if (x < y) {
                    // look ahead: are we still a power of 10 behind?
                    result = result + "0";
                    yield 0;
                }
            }
        } else {
            let q = x / y;
            x = x % y;
            let qString = q.toString();
            result = result + qString;
            for (let i = 0; i < qString.length; i++) {
                yield parseInt(qString.charAt(i)) as Digit;
            }
        }
    }

    return 0;
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

    public abs(): Rational {
        if (this.isNegative) {
            return this.negate();
        }

        return new Rational(this.numerator, this.denominator);
    }

    public negate(): Rational {
        if (this.isNegative) {
            return new Rational(this.numerator, this.denominator);
        }

        return new Rational(this.numerator * minusOne, this.denominator);
    }

    public add( y: Rational): Rational {
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
        if (y.isZero()) {
            throw new RangeError("Cannot divide by zero");
        }

        return new Rational(
            this.numerator * y.denominator,
            this.denominator * y.numerator
        );
    }

    toNumber(): number {
        return Number(this.toFixed(Infinity));
    }

    public toFixed(n: number): string {
        if (n !== Infinity && !Number.isInteger(n)) {
            throw new TypeError(
                "Cannot enumerate a non-integer number of decimal places"
            );
        }

        if (n < 0) {
            throw new RangeError(
                "Cannot enumerate a negative number of decimal places"
            );
        }

        if (this.isNegative) {
            return "-" + this.negate().toFixed(n);
        }

        if (this.numerator === zero) {
            if (Infinity === n) {
                return "0";
            }

            return "0" + "." + "0".repeat(n);
        }

        let digitGenerator = nextDigitForDivision(
            this.numerator,
            this.denominator,
            n
        );

        let digit = digitGenerator.next();
        let result = "";

        while (!digit.done) {
            let v = digit.value;
            if (-1 === v) {
                result = ("" === result ? "0" : result) + ".";
            } else {
                result = result + `${v}`;
            }

            digit = digitGenerator.next();
        }

        if (Infinity === n) {
            return result;
        }

        let numFractionalDigits = countFractionalDigits(result);

        if (numFractionalDigits >= n) {
            return result;
        }

        let numZeroesNeeded = n - numFractionalDigits;
        let zeroesNeeded = "0".repeat(numZeroesNeeded);

        if (result.match(/[.]/)) {
            return result + zeroesNeeded;
        }

        return result + "." + zeroesNeeded;
    }

    private static roundHalfEven(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (finalDigit < 5) {
            return initialPart;
        }

        if (finalDigit > 5) {
            return initialPart.add(
                initialPart.isNegative ? quantum.negate() : quantum
            );
        }

        if (penultimateDigit % 2 === 0) {
            return initialPart;
        }

        return initialPart.add(
            initialPart.isNegative ? quantum.negate() : quantum
        );
    }

    private static roundHalfExpand(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (finalDigit < 5) {
            return initialPart;
        }

        return initialPart.add(
            initialPart.isNegative ? quantum.negate() : quantum
        );
    }

    private static roundCeil(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (initialPart.isNegative) {
            return initialPart;
        }

        if (finalDigit === 0) {
            return initialPart;
        }

        return initialPart.add(quantum);
    }

    private static roundFloor(
        initialPart: Rational,
        penultimateDigit: Digit,
        finalDigit: Digit,
        quantum: Rational
    ): Rational {
        if (initialPart.isNegative) {
            return initialPart.subtract(quantum);
        }

        return initialPart;
    }

    round(numFractionalDigits: number, mode: RoundingMode): Rational {
        if (numFractionalDigits < 0) {
            throw new RangeError(
                "Cannot round to negative number of decimal places"
            );
        }

        if (!Number.isInteger(numFractionalDigits)) {
            throw new RangeError("Cannot round to non-integer number of decimal places");
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
        if (this.isInteger()) {
            return this;
        }

        let s = this.toFixed(1);

        let [integerPart, _] = s.split(".");

        return Rational.fromString(integerPart);
    }

    intLog10(): bigint {
        if (this.isNegative) {
             throw new Error("Cannot compute logarithm of a negative number");
        }

        if (this.isZero()) {
            throw new Error("Cannot compute logarithm of zero");
        }

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
        if (this.isNegative) {
            throw new RangeError("Cannot apply rounding mode to negative number");
        }

        if (this.isZero()) {
            throw new RangeError("Cannot apply rounding mode to zero");
        }

        let mLow = this.floor();
        let fraction = this.subtract(mLow);

        if (fraction.isZero()) {
            return mLow;
        }

        let mHigh = mLow.add(new Rational(1n, 1n));

        if (roundingMode === ROUNDING_MODE_FLOOR || roundingMode === ROUNDING_MODE_TRUNCATE) {
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
