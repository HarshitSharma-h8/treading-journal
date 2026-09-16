import prisma from "@/lib/prisma";

// Use Asia/Kolkata timezone to get the current trading date correctly
function getKolkataDateBounds(period: "today" | "week" | "month") {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: "Asia/Kolkata", year: "numeric", month: "numeric", day: "numeric" };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);
  
  const year = parseInt(parts.find(p => p.type === "year")!.value);
  const month = parseInt(parts.find(p => p.type === "month")!.value) - 1; // 0-indexed
  const date = parseInt(parts.find(p => p.type === "day")!.value);
  
  const tzDate = new Date(year, month, date);
  const start = new Date(tzDate);
  const end = new Date(tzDate);
  end.setHours(23, 59, 59, 999);

  if (period === "week") {
    // 0 is Sunday, 1 is Monday. Let's assume week starts on Monday for trading.
    const dayOfWeek = tzDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start.setDate(start.getDate() - diffToMonday);
    
    // Set end to Sunday of this week
    const diffToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    end.setDate(end.getDate() + diffToSunday);
  } else if (period === "month") {
    start.setDate(1);
    
    // Set end to last day of month
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
  }

  // Note: we convert these local dates back to UTC assuming the server time
  // This is a naive approach, but better is to offset based on the TZ offset
  const offsetMs = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  
  // Since Prisma compares UTC timestamps, we want the UTC equivalent of the start/end in IST
  // E.g., start of day in IST is 00:00. In UTC that is 18:30 the previous day.
  const getUtcFromIst = (localDate: Date) => {
      const utcTimestamp = Date.UTC(
          localDate.getFullYear(), 
          localDate.getMonth(), 
          localDate.getDate(), 
          localDate.getHours(), 
          localDate.getMinutes(), 
          localDate.getSeconds()
      );
      return new Date(utcTimestamp - offsetMs);
  }

  return {
      start: getUtcFromIst(start),
      end: getUtcFromIst(end)
  };
}

export async function getDashboardMetrics(userId: string) {
  // 1. Fetch all trades to calculate overall metrics
  const allTrades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { entryTime: 'asc' },
  });

  const totalTrades = allTrades.length;
  
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      todayPnl: 0,
      weekPnl: 0,
      monthPnl: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      currentStreak: 0,
      streakType: 'none',
      chartData: [],
      recentTrades: []
    };
  }

  // Calculate Overall Metrics
  let winningTrades = 0;
  let losingTrades = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let currentStreak = 0;
  let streakType: 'win' | 'loss' | 'none' = 'none';

  let cumulativePnl = 0;
  const chartData = [];

  for (const trade of allTrades) {
    // Calculate PnL on the fly
    const entryPrice = trade.entryPrice.toNumber();
    const exitPrice = trade.exitPrice.toNumber();
    const quantity = trade.quantity.toNumber();
    const pnl = trade.direction === "BUY" 
      ? (exitPrice - entryPrice) * quantity 
      : (entryPrice - exitPrice) * quantity;
      
    cumulativePnl += pnl;

    // Formatting date to a nice string for chart
    const dateObj = new Date(trade.entryTime);
    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
    
    chartData.push({
      date: dateStr,
      pnl: cumulativePnl,
      rawDate: trade.entryTime
    });

    if (pnl > 0) {
      winningTrades++;
      grossProfit += pnl;
      
      if (streakType === 'win') {
        currentStreak++;
      } else {
        streakType = 'win';
        currentStreak = 1;
      }
    } else if (pnl < 0) {
      losingTrades++;
      grossLoss += Math.abs(pnl);
      
      if (streakType === 'loss') {
        currentStreak++;
      } else {
        streakType = 'loss';
        currentStreak = 1;
      }
    } else {
      // Breakeven trade breaks the streak
      streakType = 'none';
      currentStreak = 0;
    }
  }

  // We might have multiple trades on the same day in chartData.
  // Group by date for a cleaner chart.
  const groupedChartData = chartData.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      existing.pnl = curr.pnl; // Take the latest cumulative PnL for the day
    } else {
      acc.push({ date: curr.date, pnl: curr.pnl });
    }
    return acc;
  }, [] as { date: string, pnl: number }[]);

  const winRate = totalTrades > 0 ? (winningTrades / (winningTrades + losingTrades)) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : 0);
  const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const averageLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;

  // Time-based P&L
  const todayBounds = getKolkataDateBounds("today");
  const weekBounds = getKolkataDateBounds("week");
  const monthBounds = getKolkataDateBounds("month");

  const todayTrades = allTrades.filter(t => t.entryTime >= todayBounds.start && t.entryTime <= todayBounds.end);
  const weekTrades = allTrades.filter(t => t.entryTime >= weekBounds.start && t.entryTime <= weekBounds.end);
  const monthTrades = allTrades.filter(t => t.entryTime >= monthBounds.start && t.entryTime <= monthBounds.end);

  const calculateTotalPnl = (trades: typeof allTrades) => {
    return trades.reduce((sum, t) => {
      const entryPrice = t.entryPrice.toNumber();
      const exitPrice = t.exitPrice.toNumber();
      const quantity = t.quantity.toNumber();
      const pnl = t.direction === "BUY" 
        ? (exitPrice - entryPrice) * quantity 
        : (entryPrice - exitPrice) * quantity;
      return sum + pnl;
    }, 0);
  };

  const todayPnl = calculateTotalPnl(todayTrades);
  const weekPnl = calculateTotalPnl(weekTrades);
  const monthPnl = calculateTotalPnl(monthTrades);

  // Recent 5 trades for the list
  const recentTrades = [...allTrades].sort((a, b) => b.entryTime.getTime() - a.entryTime.getTime()).slice(0, 5);

  return {
    totalTrades,
    todayPnl,
    weekPnl,
    monthPnl,
    winRate: isNaN(winRate) ? 0 : Math.round(winRate),
    profitFactor: profitFactor === Infinity ? Infinity : Number(profitFactor.toFixed(2)),
    averageWin: Math.round(averageWin),
    averageLoss: -Math.round(averageLoss), // keep it negative for display
    currentStreak,
    streakType,
    chartData: groupedChartData,
    recentTrades
  };
}
