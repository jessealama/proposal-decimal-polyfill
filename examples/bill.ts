import { Decimal } from "../src/Decimal.mjs";

const zero = new Decimal("0");
const one = new Decimal("1");

interface Item {
    price: string;
    count: string;
}

function calculateBill(items: Item[], tax: string): Decimal {
    let total = items.reduce((total, { price, count }) => {
        return total.add(new Decimal(price).multiply(new Decimal(count)));
    }, zero);
    return total.multiply(new Decimal(tax).add(one));
}

const items = [
    { price: "1.25", count: "5" },
    { price: "5.00", count: "1" },
];
const tax = "0.0735";
console.log(calculateBill(items, tax).toFixed({ digits: 2 }));
