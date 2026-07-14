import { Decimal } from "../src/Decimal.mjs";
import { BigNumber } from "bignumber.js";
import DecimalLight from "decimal.js-light";

const numIterations = 100;
const lotsOfNines = "9.999999999999999999999999999999999E-6143";
const lotsOfThrees = "3.333333333333333333333333333333333E-6143";

console.log("proposal-decimal");
console.time();

for (let i = 0; i < numIterations; i++) {
    let d = new Decimal(lotsOfNines);
    new Decimal(lotsOfThrees).divide(d).toString();
}

console.timeEnd();

console.log("BigNumber");
console.time();
for (let i = 0; i < numIterations; i++) {
    let d = new BigNumber(lotsOfNines);
    new BigNumber(lotsOfThrees).dividedBy(d).toString();
}

console.timeEnd();

console.log("decimal.js-light");
console.time();
for (let i = 0; i < numIterations; i++) {
    let d = new DecimalLight(lotsOfNines);
    new DecimalLight(lotsOfThrees).dividedBy(d).toString();
}

console.timeEnd();
