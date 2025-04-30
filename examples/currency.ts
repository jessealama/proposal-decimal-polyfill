import { Decimal } from "../src/Decimal.mjs";

let exchangeRateEurToUsd = new Decimal("1.09");
let amountInUsd = new Decimal("450.27");
let exchangeRateUsdToEur = new Decimal(1).divide(exchangeRateEurToUsd);

let amountInEur = exchangeRateUsdToEur.multiply(amountInUsd);
console.log(amountInEur.round(2).toString());
