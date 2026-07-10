import { Decimal } from "../src/Decimal.mjs";

function floor(d: Decimal): Decimal {
    return d.round({ roundingMode: "floor" });
}

export { floor };
