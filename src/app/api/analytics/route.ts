import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { 
  AnalyticsRange, 
  getAnalyticsSummary, 
  getDailyPerformance, 
  getPnLSeries, 
  getStartDate, 
  getStrategyPerformance, 
  getStreaks, 
  getSymbolPerformance 
} from "@/lib/server/analytics";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "30d";
    
    if (!["7d", "30d", "90d", "all"].includes(rangeParam)) {
      return NextResponse.json({ error: "Invalid range" }, { status: 400 });
    }

    const range = rangeParam as AnalyticsRange;
    const startDate = getStartDate(range);

    const [
      summary,
      pnlSeries,
      strategies,
      symbols,
      streaks,
      dailyPerformance
    ] = await Promise.all([
      getAnalyticsSummary(session.userId, startDate),
      getPnLSeries(session.userId, startDate),
      getStrategyPerformance(session.userId, startDate),
      getSymbolPerformance(session.userId, startDate),
      getStreaks(session.userId, startDate),
      getDailyPerformance(session.userId, startDate)
    ]);

    const winLoss = {
      winning: summary.winningTrades,
      losing: summary.losingTrades,
      breakeven: summary.breakevenTrades
    };

    return NextResponse.json({
      summary,
      pnlSeries,
      winLoss,
      strategies,
      symbols,
      streaks,
      dailyPerformance
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
