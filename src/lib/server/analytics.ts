import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";

export function getStartDate(range: AnalyticsRange): Date | undefined {
  if (range === "all") return undefined;

  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  
  // Create a date shifted to IST to get the local date
  const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  // Subtract days
  istTime.setDate(istTime.getDate() - days);
  // Set to midnight IST
  istTime.setUTCHours(0, 0, 0, 0); // these are UTC hours on the IST-shifted object
  
  // Shift back to UTC
  return new Date(istTime.getTime() - 5.5 * 60 * 60 * 1000);
}

// Convert Prisma Decimal to number safely
function toNum(decimal: Prisma.Decimal | null | undefined): number {
  if (!decimal) return 0;
  return Number(decimal.toString());
}

export async function getAnalyticsSummary(userId: string, startDate?: Date) {
  const where = {
    userId,
    ...(startDate ? { tradeDate: { gte: startDate } } : {})
  };

  const trades = await prisma.trade.findMany({
    where,
    select: { pnl: true }
  });

  let totalPnl = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let bestTrade = trades.length > 0 ? -Infinity : 0;
  let worstTrade = trades.length > 0 ? Infinity : 0;

  for (const t of trades) {
    const pnl = toNum(t.pnl);
    totalPnl += pnl;

    if (pnl > 0) {
      winningTrades++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      losingTrades++;
      grossLoss += Math.abs(pnl);
    }

    if (pnl > bestTrade) bestTrade = pnl;
    if (pnl < worstTrade) worstTrade = pnl;
  }

  const totalFinishedTrades = winningTrades + losingTrades; // ignore breakeven for win rate
  const winRate = totalFinishedTrades > 0 ? (winningTrades / totalFinishedTrades) * 100 : 0;
  
  let profitFactor: string | number = 0;
  if (grossLoss === 0 && grossProfit > 0) {
    profitFactor = "∞";
  } else if (grossLoss > 0) {
    profitFactor = (grossProfit / grossLoss).toFixed(2);
  }

  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? (grossLoss * -1) / losingTrades : 0; // Negative display

  return {
    totalPnl,
    totalTrades: trades.length,
    winRate: Math.round(winRate),
    profitFactor,
    avgWin,
    avgLoss,
    bestTrade: trades.length > 0 ? bestTrade : 0,
    worstTrade: trades.length > 0 ? worstTrade : 0,
    winningTrades,
    losingTrades,
    breakevenTrades: trades.length - winningTrades - losingTrades,
  };
}

export async function getPnLSeries(userId: string, startDate?: Date) {
  const where = {
    userId,
    ...(startDate ? { tradeDate: { gte: startDate } } : {})
  };

  const trades = await prisma.trade.findMany({
    where,
    orderBy: { tradeDate: "asc" },
    select: { tradeDate: true, pnl: true }
  });

  let cumulative = 0;
  return trades.map(t => {
    cumulative += toNum(t.pnl);
    return {
      date: t.tradeDate.toISOString(),
      cumulativePnl: cumulative,
      pnl: toNum(t.pnl)
    };
  });
}

export async function getStrategyPerformance(userId: string, startDate?: Date) {
  const where = {
    userId,
    ...(startDate ? { tradeDate: { gte: startDate } } : {})
  };

  const trades = await prisma.trade.findMany({
    where,
    include: { strategy: true }
  });

  const strategyMap = new Map<string, {
    name: string;
    trades: number;
    winning: number;
    pnl: number;
  }>();

  for (const t of trades) {
    const pnl = toNum(t.pnl);
    const key = t.strategy?.name || "No Strategy";
    
    if (!strategyMap.has(key)) {
      strategyMap.set(key, { name: key, trades: 0, winning: 0, pnl: 0 });
    }
    
    const stat = strategyMap.get(key)!;
    stat.trades++;
    stat.pnl += pnl;
    if (pnl > 0) stat.winning++;
  }

  return Array.from(strategyMap.values())
    .map(s => ({
      ...s,
      winRate: Math.round((s.winning / s.trades) * 100)
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

export async function getSymbolPerformance(userId: string, startDate?: Date) {
  const where = {
    userId,
    ...(startDate ? { tradeDate: { gte: startDate } } : {})
  };

  const trades = await prisma.trade.findMany({
    where,
    select: { symbol: true, pnl: true }
  });

  const symbolMap = new Map<string, {
    symbol: string;
    trades: number;
    winning: number;
    pnl: number;
  }>();

  for (const t of trades) {
    const pnl = toNum(t.pnl);
    const key = t.symbol;
    
    if (!symbolMap.has(key)) {
      symbolMap.set(key, { symbol: key, trades: 0, winning: 0, pnl: 0 });
    }
    
    const stat = symbolMap.get(key)!;
    stat.trades++;
    stat.pnl += pnl;
    if (pnl > 0) stat.winning++;
  }

  return Array.from(symbolMap.values())
    .map(s => ({
      ...s,
      winRate: Math.round((s.winning / s.trades) * 100)
    }))
    .sort((a, b) => b.pnl - a.pnl);
}

export async function getStreaks(userId: string, startDate?: Date) {
  const where = {
    userId,
    ...(startDate ? { tradeDate: { gte: startDate } } : {})
  };

  const trades = await prisma.trade.findMany({
    where,
    orderBy: { tradeDate: "asc" },
    select: { pnl: true }
  });

  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  for (const t of trades) {
    const pnl = toNum(t.pnl);
    if (pnl > 0) {
      tempWinStreak++;
      tempLossStreak = 0;
      if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
    } else if (pnl < 0) {
      tempLossStreak++;
      tempWinStreak = 0;
      if (tempLossStreak > maxLossStreak) maxLossStreak = tempLossStreak;
    } else {
      // breakeven resets streaks
      tempWinStreak = 0;
      tempLossStreak = 0;
    }
  }
  
  currentWinStreak = tempWinStreak;
  currentLossStreak = tempLossStreak;

  return {
    currentWinStreak,
    currentLossStreak,
    maxWinStreak,
    maxLossStreak
  };
}

export async function getDailyPerformance(userId: string, startDate?: Date) {
  const where = {
    userId,
    ...(startDate ? { tradeDate: { gte: startDate } } : {})
  };

  const trades = await prisma.trade.findMany({
    where,
    orderBy: { tradeDate: "desc" }, // to get recent days
    select: { tradeDate: true, pnl: true }
  });

  const dailyMap = new Map<string, {
    date: string;
    pnl: number;
    trades: number;
  }>();

  for (const t of trades) {
    // Format in IST context YYYY-MM-DD
    const d = new Date(t.tradeDate.getTime() + 5.5 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    
    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, { date: dateStr, pnl: 0, trades: 0 });
    }
    const stat = dailyMap.get(dateStr)!;
    stat.trades++;
    stat.pnl += toNum(t.pnl);
  }

  // Convert to array and sort desc
  return Array.from(dailyMap.values())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10); // Return up to 10 recent active trading days
}
