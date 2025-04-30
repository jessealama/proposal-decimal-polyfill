import { Decimal } from "../src/Decimal.mjs";
import { pow } from "./pow.mjs";

const one = new Decimal("1");
const paymentsPerYear = new Decimal("12");

function calculateMonthlyPayment(p: string, r: string, y: string): Decimal {
    const principal = new Decimal(p);
    const annualInterestRate = new Decimal(r);
    const years = new Decimal(y);
    const monthlyInterestRate = annualInterestRate.divide(paymentsPerYear);
    const paymentCount = paymentsPerYear.multiply(years);
    const onePlusInterestRate = monthlyInterestRate.add(one);
    const ratePower = pow(onePlusInterestRate, Number(paymentCount.toString()));

    const x = principal.multiply(monthlyInterestRate);

    return x.multiply(ratePower).divide(ratePower.subtract(one));
}

const amount = calculateMonthlyPayment("5000000", "0.05", "30");

console.log(amount.toFixed({ digits: 2 }));
