import { TradeDirection } from "@prisma/client";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

// A simple Decimal fallback in case decimal.js is not installed yet
// Using simple multiply by 10000 technique to avoid floating point issues
export function calculatePnL(type: TradeDirection, entry: number, exit: number, qty: number): number {
  if (!entry || !exit || !qty) return 0;
  
  const entryCents = Math.round(entry * 10000);
  const exitCents = Math.round(exit * 10000);
  const qtyCents = Math.round(qty * 10000);
  
  if (type === "BUY") {
    return ((exitCents - entryCents) * qtyCents) / 100000000;
  } else {
    return ((entryCents - exitCents) * qtyCents) / 100000000;
  }
}

export function calculateRiskReward(type: TradeDirection, entry: number, stopLoss: number, target: number): string | null {
  if (!entry || !stopLoss || !target) return null;
  
  let risk = 0;
  let reward = 0;
  
  if (type === "BUY") {
    risk = entry - stopLoss;
    reward = target - entry;
  } else {
    risk = stopLoss - entry;
    reward = entry - target;
  }

  if (risk <= 0 || reward <= 0) return null;
  
  const ratio = reward / risk;
  return `1 : ${ratio.toFixed(2)}`;
}
