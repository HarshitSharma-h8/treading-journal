import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { calculatePnL } from "@/lib/trading-utils";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");

    if (!fromStr || !toStr) {
      return NextResponse.json({ error: "Missing from or to parameters" }, { status: 400 });
    }

    // Convert from and to (YYYY-MM-DD) to UTC bounds based on IST timezone.
    const fromParts = fromStr.split("-").map(Number);
    const toParts = toStr.split("-").map(Number);

    // IST is UTC+5:30. 00:00 IST is 18:30 UTC the previous day.
    const offsetMs = 5.5 * 60 * 60 * 1000;

    const fromUtc = new Date(Date.UTC(fromParts[0], fromParts[1] - 1, fromParts[2]) - offsetMs);
    const toUtc = new Date(Date.UTC(toParts[0], toParts[1] - 1, toParts[2], 23, 59, 59, 999) - offsetMs);

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.userId,
        entryTime: {
          gte: fromUtc,
          lte: toUtc,
        },
      },
      select: {
        entryTime: true,
        direction: true,
        entryPrice: true,
        exitPrice: true,
        quantity: true,
      },
    });

    const aggregated: Record<string, { pnl: number; tradeCount: number }> = {};

    for (const trade of trades) {
      // Convert entryTime (UTC) back to IST to determine the local date string
      const istTime = new Date(trade.entryTime.getTime() + offsetMs);
      const yyyy = istTime.getUTCFullYear();
      const mm = String(istTime.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(istTime.getUTCDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      if (!aggregated[dateStr]) {
        aggregated[dateStr] = { pnl: 0, tradeCount: 0 };
      }
      aggregated[dateStr].pnl += calculatePnL(
        trade.direction,
        Number(trade.entryPrice),
        Number(trade.exitPrice),
        Number(trade.quantity)
      );
      aggregated[dateStr].tradeCount += 1;
    }

    const result = Object.entries(aggregated).map(([date, data]) => ({
      date,
      pnl: data.pnl,
      tradeCount: data.tradeCount,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Calendar analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
