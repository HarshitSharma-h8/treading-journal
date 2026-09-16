import { Trade } from "@/lib/types";

// Helper to ensure Decimal/string types from API are parsed into actual numbers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTrade(trade: any): Trade {
  const entryPrice = Number(trade.entryPrice || 0);
  const exitPrice = Number(trade.exitPrice || 0);
  const quantity = Number(trade.quantity || 0);
  
  const pnl = trade.direction === "BUY"
    ? (exitPrice - entryPrice) * quantity
    : (entryPrice - exitPrice) * quantity;

  return {
    ...trade,
    pnl,
    entryPrice,
    exitPrice,
    quantity,
    stopLoss: trade.stopLoss != null ? Number(trade.stopLoss) : undefined,
    target: trade.target != null ? Number(trade.target) : undefined,
  };
}

export async function getTrades(): Promise<Trade[]> {
  const response = await fetch("/api/trades", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch trades");
  }

  const data = await response.json();
  return data.map(parseTrade);
}

export async function getTrade(id: string): Promise<Trade | undefined> {
  const response = await fetch(`/api/trades/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch trade");
  }

  const data = await response.json();
  return parseTrade(data);
}

export async function createTrade(trade: Partial<Trade>): Promise<Trade> {
  const response = await fetch("/api/trades", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trade),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create trade");
  }

  const data = await response.json();
  return parseTrade(data);
}

export async function updateTrade(id: string, trade: Partial<Trade>): Promise<Trade> {
  const response = await fetch(`/api/trades/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(trade),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update trade");
  }

  const data = await response.json();
  return parseTrade(data);
}

export async function deleteTrade(id: string): Promise<void> {
  const response = await fetch(`/api/trades/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete trade");
  }
}
