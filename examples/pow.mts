import { Decimal } from "../src/Decimal.mjs";

function pow(a: Decimal, b: number): Decimal {
    let result = a;
    for (let i = 0; i < b; i++) {
        result = result.multiply(a);
    }
    return result;
}

export { pow };
