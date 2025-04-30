import { Decimal } from "../src/Decimal.mjs";

function floor(d: Decimal): Decimal {
    return d.round(0, "floor");
}

export { floor };
