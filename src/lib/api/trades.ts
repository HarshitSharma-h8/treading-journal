import { Trade } from "@/lib/types";

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

  return response.json();
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

  return response.json();
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

  return response.json();
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

  return response.json();
}

export async function deleteTrade(id: string): Promise<void> {
  const response = await fetch(`/api/trades/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete trade");
  }
}
