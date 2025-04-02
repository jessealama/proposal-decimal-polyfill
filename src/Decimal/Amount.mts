import { Decimal128 } from "../Decimal128.mjs";

const PRECISION_MODE_FRACTIONAL_DIGITS = "fractionalDigits";
const PRECISION_MODE_SIGNIFICANT_DIGITS = "significantDigits";
type PrecisionMode = "fractionalDigits" | "significantDigits";

const PRECISION_MODES: PrecisionMode[] = [
    PRECISION_MODE_FRACTIONAL_DIGITS,
    PRECISION_MODE_SIGNIFICANT_DIGITS,
];
const DEFAULT_PRECISION_MODE = "fractionalDigits";

class Amount {
    private val: Decimal128;
    private precision: number;
    private mode: PrecisionMode;

    constructor(val: string, precision: number, mode: PrecisionMode) {
        let v = new Decimal128(val); // might throw

        if (!Number.isInteger(precision)) {
            throw new Error("Precision must be an integer");
        }

        if (precision < 0) {
            throw new RangeError("Precision must be a non-negative integer");
        }

        if (PRECISION_MODES.indexOf(mode) === -1) {
            throw new RangeError(
                `Precision mode must be one of '${PRECISION_MODES.join("', '")}'`
            );
        }

        this.val = v;
        this.precision = precision;
        this.mode = mode;
    }

    value(): Decimal128 {
        return this.val;
    }

    toString(): string {
        if (this.mode === PRECISION_MODE_FRACTIONAL_DIGITS) {
            return this.val.toFixed({ digits: this.precision });
        }

        return this.val.toPrecision({ digits: this.precision });
    }

    toLocaleString(locale: string, options: Intl.NumberFormatOptions): string {
        let v = new Decimal128(this.toString());
        return v.toLocaleString(locale, options);
    }
}

export { Amount };
