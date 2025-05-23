import { Decimal } from "../src/Decimal.mjs";

function stepUp(a: Decimal.Amount, n?: number): Decimal.Amount {
    if (undefined === n) {
        n = 1;
    }
    if (!Number.isInteger(n)) {
        throw new RangeError("n must be an integer");
    }
    let stepped = a.toDecimal();
    for (let i = 0; i < n; i++) {
        stepped = stepped.add(a.quantum);
    }
    return Decimal.Amount.from(stepped.toFixed({ digits: a.fractionalDigits }));
}

let a = Decimal.Amount.from("42.9").with({ kind: "fractionDigit", digits: 2 });
let stepped = stepUp(a, 9);
console.log(`a: ${a.toString()} stepped up 9 times is ${stepped.toString()}`);
console.log(`and one more time yields ${stepUp(stepped).toString()}`);
