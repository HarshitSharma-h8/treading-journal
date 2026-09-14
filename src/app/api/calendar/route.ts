import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearStr = searchParams.get("year");
    const monthStr = searchParams.get("month"); // 1-12

    if (!yearStr || !monthStr) {
      return NextResponse.json({ error: "Missing year or month" }, { status: 400 });
    }

    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-12

    // Calculate start and end of month using Indian standard time conceptual limits
    // But since JS Date in UTC will be used to query DB, we create UTC dates that cover the month in local time.
    // Actually, just querying the month range in UTC is mostly fine as long as we group properly on the frontend.
    // For precise querying:
    const startOfMonth = new Date(`${year}-${month.toString().padStart(2, "0")}-01T00:00:00+05:30`);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.userId,
        tradeDate: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      select: {
        tradeDate: true,
        pnl: true,
      },
    });

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId: session.userId,
        entryDate: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
      select: {
        entryDate: true,
      },
    });

    return NextResponse.json({ trades, journalEntries });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}
