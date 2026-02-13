/**
 * BigDecimal.mts -- BigDecimal via BigInt polyfill
 *
 * Implements TC39 proposal-decimal #202: extending BigInt to support
 * decimal values. Monkey-patches BigInt.Decimal() as a constructor
 * with static arithmetic methods.
 *
 * @author Jesse Alama <jesse@igalia.com>
 */

const MAX_DIGITS = 100;

type RoundingMode = "ceil" | "floor" | "trunc" | "halfEven" | "halfExpand";

const ROUNDING_MODES: RoundingMode[] = [
    "ceil",
    "floor",
    "trunc",
    "halfEven",
    "halfExpand",
];

const BIG_DECIMAL_BRAND = Symbol("BigDecimal");

/**
 * Represents a decimal number as inner / 10^scale.
 * inner is a signed bigint, scale is a non-negative integer.
 * Trailing fractional zeros are stripped on construction.
 */
class BigDecimal {
    readonly #inner: bigint;
    readonly #scale: number;
    readonly [BIG_DECIMAL_BRAND] = true;

    constructor(inner: bigint, scale: number) {
        if (!Number.isInteger(scale) || scale < 0) {
            throw new RangeError("Scale must be a non-negative integer");
        }

        if (scale > MAX_DIGITS) {
            throw new RangeError(
                `Scale exceeds maximum of ${MAX_DIGITS} fraction digits`
            );
        }

        let c = inner;
        let s = scale;
        while (s > 0 && c !== 0n && c % 10n === 0n) {
            c /= 10n;
            s--;
        }

        if (c === 0n) {
            s = 0;
        }

        this.#inner = c;
        this.#scale = s;
    }

    get inner(): bigint {
        return this.#inner;
    }

    get scale(): number {
        return this.#scale;
    }

    toString(): string {
        if (this.#inner === 0n) {
            return "0";
        }

        const isNeg = this.#inner < 0n;
        const sign = isNeg ? "-" : "";
        const absInner = isNeg ? -this.#inner : this.#inner;
        const digits = absInner.toString();

        if (this.#scale === 0) {
            return sign + digits;
        }

        if (this.#scale >= digits.length) {
            // Need leading zeros: e.g. inner=5, scale=3 -> "0.005"
            const leadingZeros = this.#scale - digits.length;
            return sign + "0." + "0".repeat(leadingZeros) + digits;
        } else {
            const intPart = digits.slice(0, digits.length - this.#scale);
            const fracPart = digits.slice(digits.length - this.#scale);
            return sign + intPart + "." + fracPart;
        }
    }

    valueOf(): this {
        return this;
    }

    equals(other: BigDecimal): boolean {
        return this.#inner === other.#inner && this.#scale === other.#scale;
    }

    compare(other: BigDecimal): -1 | 0 | 1 {
        const s1 = this.#scale;
        const s2 = other.#scale;

        let v1: bigint;
        let v2: bigint;

        if (s1 === s2) {
            v1 = this.#inner;
            v2 = other.#inner;
        } else if (s1 > s2) {
            v1 = this.#inner;
            v2 = other.#inner * 10n ** BigInt(s1 - s2);
        } else {
            v1 = this.#inner * 10n ** BigInt(s2 - s1);
            v2 = other.#inner;
        }

        if (v1 < v2) return -1;
        if (v1 > v2) return 1;
        return 0;
    }

    toBigInt(): bigint {
        if (this.#scale === 0) {
            return this.#inner;
        }

        const divisor = 10n ** BigInt(this.#scale);
        if (this.#inner % divisor !== 0n) {
            throw new RangeError(
                "Non-integer BigDecimal cannot be converted to a BigInt"
            );
        }

        return this.#inner / divisor;
    }

    toNumber(): number {
        return Number(this.toString());
    }

    toFixed(digits: number, roundingMode: RoundingMode = "halfEven"): string {
        if (!Number.isInteger(digits) || digits < 0) {
            throw new RangeError("Argument must be a non-negative integer");
        }
        if (digits > MAX_DIGITS) {
            throw new RangeError(`Argument must be at most ${MAX_DIGITS}`);
        }

        const rounded = roundToFractionDigits(this, digits, roundingMode);
        return formatFixed(rounded, digits);
    }

    toPrecision(
        digits: number,
        roundingMode: RoundingMode = "halfEven"
    ): string {
        if (!Number.isInteger(digits) || digits <= 0) {
            throw new RangeError("Argument must be a positive integer");
        }
        if (digits > MAX_DIGITS) {
            throw new RangeError(`Argument must be at most ${MAX_DIGITS}`);
        }

        const rounded = roundToSignificantDigits(this, digits, roundingMode);
        return formatPrecision(rounded, digits);
    }

    toExponential(
        fractionDigits: number,
        roundingMode: RoundingMode = "halfEven"
    ): string {
        if (!Number.isInteger(fractionDigits) || fractionDigits < 0) {
            throw new RangeError("Argument must be a non-negative integer");
        }
        if (fractionDigits > MAX_DIGITS) {
            throw new RangeError(`Argument must be at most ${MAX_DIGITS}`);
        }

        // Round to fractionDigits + 1 significant digits
        const sigDigits = fractionDigits + 1;
        const rounded = roundToSignificantDigits(this, sigDigits, roundingMode);
        return formatExponential(rounded, fractionDigits);
    }

    // ---- Static methods ----

    static add(a: BigDecimal, b: BigDecimal): BigDecimal {
        ensureBigDecimal(a);
        ensureBigDecimal(b);
        return addBigDecimal(a, b);
    }

    static subtract(a: BigDecimal, b: BigDecimal): BigDecimal {
        ensureBigDecimal(a);
        ensureBigDecimal(b);
        return subtractBigDecimal(a, b);
    }

    static multiply(a: BigDecimal, b: BigDecimal): BigDecimal {
        ensureBigDecimal(a);
        ensureBigDecimal(b);
        return multiplyBigDecimal(a, b);
    }

    static divide(
        a: BigDecimal,
        b: BigDecimal,
        opts?: { maximumFractionDigits?: number }
    ): BigDecimal {
        ensureBigDecimal(a);
        ensureBigDecimal(b);
        const maxFrac = opts?.maximumFractionDigits ?? MAX_DIGITS;
        if (!Number.isInteger(maxFrac) || maxFrac < 0 || maxFrac > MAX_DIGITS) {
            throw new RangeError(
                `maximumFractionDigits must be between 0 and ${MAX_DIGITS}`
            );
        }
        return divideBigDecimal(a, b, maxFrac);
    }

    static remainder(a: BigDecimal, b: BigDecimal): BigDecimal {
        ensureBigDecimal(a);
        ensureBigDecimal(b);
        return remainderBigDecimal(a, b);
    }

    static abs(a: BigDecimal): BigDecimal {
        ensureBigDecimal(a);
        if (a.inner < 0n) {
            return new BigDecimal(-a.inner, a.scale);
        }
        return a;
    }

    static negate(a: BigDecimal): BigDecimal {
        ensureBigDecimal(a);
        return new BigDecimal(-a.inner, a.scale);
    }

    static compare(a: BigDecimal, b: BigDecimal): -1 | 0 | 1 {
        ensureBigDecimal(a);
        ensureBigDecimal(b);
        return a.compare(b);
    }

    static equals(a: BigDecimal, b: BigDecimal): boolean {
        ensureBigDecimal(a);
        ensureBigDecimal(b);
        return a.equals(b);
    }

    static round(
        a: BigDecimal,
        fractionDigits: number = 0,
        roundingMode: RoundingMode = "halfEven"
    ): BigDecimal {
        ensureBigDecimal(a);
        if (!Number.isInteger(fractionDigits) || fractionDigits < 0) {
            throw new RangeError(
                "fractionDigits must be a non-negative integer"
            );
        }
        if (fractionDigits > MAX_DIGITS) {
            throw new RangeError(
                `fractionDigits must be at most ${MAX_DIGITS}`
            );
        }
        if (!ROUNDING_MODES.includes(roundingMode)) {
            throw new RangeError(`Invalid rounding mode "${roundingMode}"`);
        }
        return roundToFractionDigits(a, fractionDigits, roundingMode);
    }

    static isBigDecimal(value: unknown): value is BigDecimal {
        return (
            value !== null &&
            typeof value === "object" &&
            BIG_DECIMAL_BRAND in value &&
            (value as Record<symbol, unknown>)[BIG_DECIMAL_BRAND] === true
        );
    }
}

// ---- Parsing ----

function parseBigDecimal(value: string | number | bigint): BigDecimal {
    if (typeof value === "bigint") {
        return new BigDecimal(value, 0);
    }

    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new RangeError("BigDecimal does not support Infinity or NaN");
        }
        if (Object.is(value, -0)) {
            return new BigDecimal(0n, 0);
        }
        return parseBigDecimal(value.toString());
    }

    if (typeof value !== "string") {
        throw new TypeError("Argument must be a string, number, or bigint");
    }

    let s = value.replace(/_/g, "");

    if (s === "") {
        throw new SyntaxError("Empty string not permitted");
    }

    let isNegative = false;
    if (s.startsWith("-")) {
        isNegative = true;
        s = s.substring(1);
    } else if (s.startsWith("+")) {
        s = s.substring(1);
    }

    if (s === "" || s === ".") {
        throw new SyntaxError("Invalid decimal string");
    }

    const match = s.match(/^(\d*)(?:\.(\d*))?(?:[eE]([-+]?\d+))?$/);
    if (!match || (match[1] === "" && (!match[2] || match[2] === ""))) {
        throw new SyntaxError("Invalid decimal string");
    }

    const [, intPart = "", fracPart = "", expPart = "0"] = match;

    if (intPart === "" && fracPart === "") {
        throw new SyntaxError("Invalid decimal string");
    }

    const allDigits = intPart + fracPart;
    const trimmedDigits = allDigits.replace(/^0+/, "") || "0";

    const coefficient = BigInt(trimmedDigits);
    const exponent = Number(expPart) - fracPart.length;

    let inner: bigint;
    let scale: number;

    if (exponent >= 0) {
        inner = coefficient * 10n ** BigInt(exponent);
        scale = 0;
    } else {
        scale = -exponent;
        inner = coefficient;
    }

    if (isNegative && inner !== 0n) {
        inner = -inner;
    }

    if (scale > MAX_DIGITS) {
        const excess = scale - MAX_DIGITS;
        const divisor = 10n ** BigInt(excess);
        const absInner = inner < 0n ? -inner : inner;
        const quot = absInner / divisor;
        const rem = absInner % divisor;
        const half = divisor / 2n;

        let rounded: bigint;
        if (rem > half) {
            rounded = quot + 1n;
        } else if (rem < half) {
            rounded = quot;
        } else {
            // halfEven
            if (quot % 2n === 0n) {
                rounded = quot;
            } else {
                rounded = quot + 1n;
            }
        }

        inner = inner < 0n ? -rounded : rounded;
        scale = MAX_DIGITS;
    }

    return new BigDecimal(inner, scale);
}

// ---- Rounding helpers ----

function roundToFractionDigits(
    v: BigDecimal,
    digits: number,
    mode: RoundingMode
): BigDecimal {
    if (v.scale <= digits) {
        return v;
    }

    const excess = v.scale - digits;
    const divisor = 10n ** BigInt(excess);
    const absInner = v.inner < 0n ? -v.inner : v.inner;
    const isNeg = v.inner < 0n;

    const quot = absInner / divisor;
    const rem = absInner % divisor;

    const rounded = applyRounding(quot, rem, divisor, isNeg, mode);
    const newInner = isNeg ? -rounded : rounded;

    return new BigDecimal(newInner, digits);
}

function roundToSignificantDigits(
    v: BigDecimal,
    digits: number,
    mode: RoundingMode
): BigDecimal {
    if (v.inner === 0n) {
        return v;
    }

    const absInner = v.inner < 0n ? -v.inner : v.inner;
    const isNeg = v.inner < 0n;
    const currentDigits = absInner.toString().length;

    if (currentDigits <= digits) {
        return v;
    }

    const excess = currentDigits - digits;
    const divisor = 10n ** BigInt(excess);

    const quot = absInner / divisor;
    const rem = absInner % divisor;

    const rounded = applyRounding(quot, rem, divisor, isNeg, mode);

    const newScale = Math.max(0, v.scale - excess);

    // If scale went to 0 but we removed fewer scale digits, multiply up
    if (v.scale < excess) {
        const extra = excess - v.scale;
        const newInner = isNeg ? -rounded : rounded;
        return new BigDecimal(newInner * 10n ** BigInt(extra), 0);
    }

    const newInner = isNeg ? -rounded : rounded;
    return new BigDecimal(newInner, newScale);
}

function applyRounding(
    quot: bigint,
    rem: bigint,
    divisor: bigint,
    isNeg: boolean,
    mode: RoundingMode
): bigint {
    if (rem === 0n) {
        return quot;
    }

    const half = divisor / 2n;
    const isExactHalf = divisor % 2n === 0n ? rem === half : false;

    switch (mode) {
        case "trunc":
            return quot;
        case "floor":
            return isNeg ? quot + 1n : quot;
        case "ceil":
            return isNeg ? quot : quot + 1n;
        case "halfExpand":
            return rem >= half ? quot + 1n : quot;
        case "halfEven":
        default:
            if (isExactHalf) {
                // Round to even
                return quot % 2n === 0n ? quot : quot + 1n;
            }
            return rem > half ? quot + 1n : quot;
    }
}

// ---- Formatting helpers ----

function formatFixed(v: BigDecimal, digits: number): string {
    const isNeg = v.inner < 0n;
    const sign = isNeg ? "-" : "";
    const absInner = isNeg ? -v.inner : v.inner;

    if (digits === 0) {
        return sign + absInner.toString();
    }

    let paddedInner = absInner;
    let currentScale = v.scale;
    if (currentScale < digits) {
        paddedInner = paddedInner * 10n ** BigInt(digits - currentScale);
        currentScale = digits;
    }

    const str = paddedInner.toString();

    if (currentScale >= str.length) {
        const leadingZeros = currentScale - str.length;
        return sign + "0." + "0".repeat(leadingZeros) + str;
    }

    const intPart = str.slice(0, str.length - currentScale);
    const fracPart = str.slice(str.length - currentScale);
    return sign + (intPart || "0") + "." + fracPart;
}

function formatPrecision(v: BigDecimal, digits: number): string {
    if (v.inner === 0n) {
        if (digits === 1) return "0";
        return "0." + "0".repeat(digits - 1);
    }

    const isNeg = v.inner < 0n;
    const sign = isNeg ? "-" : "";
    const absInner = isNeg ? -v.inner : v.inner;
    const coeffStr = absInner.toString();

    // The effective exponent: the number is absInner * 10^(-scale)
    // Written in normalized form: d.ddd * 10^e where e = coeffStr.length - 1 - scale
    const effectiveExponent = coeffStr.length - 1 - v.scale;

    // Use decimal notation when exponent is between -6 and digits-1
    if (effectiveExponent >= -6 && effectiveExponent < digits) {
        if (v.scale === 0) {
            // Integer
            let result = coeffStr;
            if (coeffStr.length < digits) {
                result = result + "." + "0".repeat(digits - coeffStr.length);
            }
            return sign + result;
        }

        // Has fractional part
        const str = v.toString().replace(/^-/, "");
        const parts = str.split(".");
        const intPart = parts[0];
        const fracPart = parts[1] || "";

        // Count significant digits
        let sigDigits: number;
        if (intPart === "0") {
            // Leading zeros in fractional part don't count
            const stripped = fracPart.replace(/^0+/, "");
            sigDigits = stripped.length;
        } else {
            sigDigits = intPart.length + fracPart.length;
        }

        if (sigDigits < digits) {
            return sign + str + "0".repeat(digits - sigDigits);
        }
        return sign + str;
    }

    // Exponential notation
    const expSign = effectiveExponent >= 0 ? "+" : "";
    const expStr = "e" + expSign + effectiveExponent;

    if (coeffStr.length === 1) {
        if (digits === 1) {
            return sign + coeffStr + expStr;
        }
        return sign + coeffStr + "." + "0".repeat(digits - 1) + expStr;
    }

    const intDigit = coeffStr.charAt(0);
    let fracDigits = coeffStr.substring(1);
    if (fracDigits.length < digits - 1) {
        fracDigits = fracDigits + "0".repeat(digits - 1 - fracDigits.length);
    }
    return sign + intDigit + "." + fracDigits + expStr;
}

function formatExponential(v: BigDecimal, fractionDigits: number): string {
    if (v.inner === 0n) {
        if (fractionDigits === 0) return "0e+0";
        return "0." + "0".repeat(fractionDigits) + "e+0";
    }

    const isNeg = v.inner < 0n;
    const sign = isNeg ? "-" : "";
    const absInner = isNeg ? -v.inner : v.inner;
    const coeffStr = absInner.toString();

    const effectiveExponent = coeffStr.length - 1 - v.scale;
    const expSign = effectiveExponent >= 0 ? "+" : "";
    const expStr = "e" + expSign + effectiveExponent;

    if (fractionDigits === 0) {
        return sign + coeffStr.charAt(0) + expStr;
    }

    const intDigit = coeffStr.charAt(0);
    let fracDigits = coeffStr.substring(1);
    if (fracDigits.length < fractionDigits) {
        fracDigits =
            fracDigits + "0".repeat(fractionDigits - fracDigits.length);
    } else if (fracDigits.length > fractionDigits) {
        fracDigits = fracDigits.substring(0, fractionDigits);
    }

    return sign + intDigit + "." + fracDigits + expStr;
}

// ---- Arithmetic ----

function alignScales(a: BigDecimal, b: BigDecimal): [bigint, bigint, number] {
    const maxScale = Math.max(a.scale, b.scale);
    return [
        a.inner * 10n ** BigInt(maxScale - a.scale),
        b.inner * 10n ** BigInt(maxScale - b.scale),
        maxScale,
    ];
}

function addBigDecimal(a: BigDecimal, b: BigDecimal): BigDecimal {
    const [v1, v2, scale] = alignScales(a, b);
    return new BigDecimal(v1 + v2, scale);
}

function subtractBigDecimal(a: BigDecimal, b: BigDecimal): BigDecimal {
    const [v1, v2, scale] = alignScales(a, b);
    return new BigDecimal(v1 - v2, scale);
}

function multiplyBigDecimal(a: BigDecimal, b: BigDecimal): BigDecimal {
    const newScale = a.scale + b.scale;
    const newInner = a.inner * b.inner;

    if (newScale > MAX_DIGITS) {
        return roundToFractionDigits(
            new BigDecimal(newInner, newScale),
            MAX_DIGITS,
            "halfEven"
        );
    }

    return new BigDecimal(newInner, newScale);
}

function divideBigDecimal(
    a: BigDecimal,
    b: BigDecimal,
    maximumFractionDigits: number = MAX_DIGITS
): BigDecimal {
    if (b.inner === 0n) {
        throw new RangeError("Division by zero");
    }

    const extraScale = maximumFractionDigits + b.scale - a.scale;

    let dividend: bigint;
    if (extraScale >= 0) {
        dividend = a.inner * 10n ** BigInt(extraScale);
    } else {
        dividend = a.inner;
    }

    const absDividend = dividend < 0n ? -dividend : dividend;
    const absDivisor = b.inner < 0n ? -b.inner : b.inner;
    const isNeg = a.inner < 0n !== b.inner < 0n;

    const quot = absDividend / absDivisor;
    const rem = absDividend % absDivisor;

    let resultInner: bigint;
    if (rem === 0n) {
        resultInner = quot;
    } else {
        const doubleRem = rem * 2n;
        if (doubleRem > absDivisor) {
            resultInner = quot + 1n;
        } else if (doubleRem < absDivisor) {
            resultInner = quot;
        } else {
            resultInner = quot % 2n === 0n ? quot : quot + 1n;
        }
    }

    if (isNeg && resultInner !== 0n) {
        resultInner = -resultInner;
    }

    const actualScale =
        extraScale >= 0
            ? maximumFractionDigits
            : maximumFractionDigits - extraScale;
    return new BigDecimal(resultInner, Math.max(0, actualScale));
}

function remainderBigDecimal(a: BigDecimal, b: BigDecimal): BigDecimal {
    if (b.inner === 0n) {
        throw new RangeError("Division by zero");
    }

    const [v1, v2, scale] = alignScales(a, b);
    const quot = v1 / v2;
    const rem = v1 - quot * v2;

    return new BigDecimal(rem, scale);
}

// ---- BigInt.Decimal monkey-patching ----

function ensureBigDecimal(v: unknown): BigDecimal {
    if (BigDecimal.isBigDecimal(v)) return v;
    throw new TypeError("Argument must be a BigDecimal value");
}

interface BigDecimalConstructor {
    (value: string | number | bigint): BigDecimal;
    add(a: BigDecimal, b: BigDecimal): BigDecimal;
    subtract(a: BigDecimal, b: BigDecimal): BigDecimal;
    multiply(a: BigDecimal, b: BigDecimal): BigDecimal;
    divide(
        a: BigDecimal,
        b: BigDecimal,
        opts?: { maximumFractionDigits?: number }
    ): BigDecimal;
    remainder(a: BigDecimal, b: BigDecimal): BigDecimal;
    abs(a: BigDecimal): BigDecimal;
    negate(a: BigDecimal): BigDecimal;
    compare(a: BigDecimal, b: BigDecimal): -1 | 0 | 1;
    equals(a: BigDecimal, b: BigDecimal): boolean;
    round(
        a: BigDecimal,
        fractionDigits?: number,
        roundingMode?: RoundingMode
    ): BigDecimal;
    isBigDecimal(value: unknown): value is BigDecimal;
}

const Decimal = function Decimal(value: string | number | bigint): BigDecimal {
    if (new.target) {
        throw new TypeError("BigInt.Decimal is not a constructor");
    }
    return parseBigDecimal(value);
} as BigDecimalConstructor;

for (const key of [
    "add",
    "subtract",
    "multiply",
    "divide",
    "remainder",
    "abs",
    "negate",
    "compare",
    "equals",
    "round",
    "isBigDecimal",
] as const) {
    (Decimal as any)[key] = (BigDecimal as any)[key];
}

// ---- Global augmentation ----

declare global {
    interface BigIntConstructor {
        Decimal: BigDecimalConstructor;
        isInteger(value: unknown): boolean;
    }
}

(BigInt as unknown as Record<string, unknown>).Decimal = Decimal;

const originalIsInteger = (BigInt as unknown as Record<string, unknown>)
    .isInteger as ((value: unknown) => boolean) | undefined;

(BigInt as unknown as Record<string, unknown>).isInteger = function (
    value: unknown
): boolean {
    if (typeof value === "bigint") return true;
    if (Decimal.isBigDecimal(value)) return (value as BigDecimal).scale === 0;
    return originalIsInteger ? originalIsInteger(value) : false;
};

export { BigDecimal };
