import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { journalSchema } from "@/lib/validations/journal";
import { z } from "zod";
import { calculatePnL } from "@/lib/trading-utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    const entry = await prisma.journal.findUnique({
      where: { id },
      include: { trades: { orderBy: { entryTime: 'desc' } } }
    });

    if (!entry || entry.userId !== session.userId) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
    }

    const trades = entry.trades;

    let dailyPnl = 0;
    let winningTrades = 0;
    
    trades.forEach(t => {
      const pnlNum = calculatePnL(t.direction, Number(t.entryPrice), Number(t.exitPrice), Number(t.quantity));
      dailyPnl += pnlNum;
      if (pnlNum > 0) winningTrades++;
    });

    const tradeStats = {
      pnl: dailyPnl,
      trades: trades.length,
      winRate: trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0,
    };

    // return the shape expected by frontend, if needed mapping date to entryDate
    return NextResponse.json({ ...entry, entryDate: entry.date, tradeStats });
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return NextResponse.json({ error: "Failed to fetch journal entry" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify ownership
    const existingEntry = await prisma.journal.findUnique({
      where: { id },
    });

    if (!existingEntry || existingEntry.userId !== session.userId) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = journalSchema.parse(body);

    const updatedEntry = await prisma.journal.update({
      where: { id },
      data: {
        date: validatedData.date,
        followedTradingPlan: validatedData.followedTradingPlan,
        executionQuality: validatedData.executionQuality,
        whatDidWell: validatedData.whatDidWell?.trim() || null,
        biggestMistake: validatedData.biggestMistake?.trim() || null,
        emotionalTrade: validatedData.emotionalTrade,
        emotionalTradeOther: validatedData.emotionalTradeOther?.trim() || null,
        followedRiskManagement: validatedData.followedRiskManagement,
        tomorrowLesson: validatedData.tomorrowLesson?.trim() || null,
        status: validatedData.status,
        // Backward compatibility
        marketThoughts: validatedData.marketThoughts?.trim() || null,
        whatWentWrong: validatedData.whatWentWrong?.trim() || null,
        mistakes: validatedData.mistakes?.trim() || null,
        lessons: validatedData.lessons?.trim() || null,
      },
    });

    return NextResponse.json({ ...updatedEntry, entryDate: updatedEntry.date });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error updating journal entry:", error);
    return NextResponse.json({ error: "Failed to update journal entry" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify ownership
    const existingEntry = await prisma.journal.findUnique({
      where: { id },
    });

    if (!existingEntry || existingEntry.userId !== session.userId) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
    }

    await prisma.journal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json({ error: "Failed to delete journal entry" }, { status: 500 });
  }
}
