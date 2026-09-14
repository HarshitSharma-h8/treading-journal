import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { journalSchema } from "@/lib/validations/journal";
import { z } from "zod";

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
    
    const entry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.userId !== session.userId) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
    }

    const startOfDay = new Date(entry.entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(entry.entryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.userId,
        tradeDate: { gte: startOfDay, lte: endOfDay },
      },
      select: { pnl: true }
    });

    let dailyPnl = 0;
    let winningTrades = 0;
    
    trades.forEach(t => {
      const pnlNum = Number(t.pnl);
      dailyPnl += pnlNum;
      if (pnlNum > 0) winningTrades++;
    });

    const tradeStats = {
      pnl: dailyPnl,
      trades: trades.length,
      winRate: trades.length > 0 ? Math.round((winningTrades / trades.length) * 100) : 0,
    };

    return NextResponse.json({ ...entry, tradeStats });
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
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!existingEntry || existingEntry.userId !== session.userId) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = journalSchema.parse(body);

    const updatedEntry = await prisma.journalEntry.update({
      where: { id },
      data: {
        entryDate: validatedData.entryDate, // Might want to ensure it doesn't conflict with another day
        marketThoughts: validatedData.marketThoughts?.trim() || null,
        whatWentWell: validatedData.whatWentWell?.trim() || null,
        whatWentWrong: validatedData.whatWentWrong?.trim() || null,
        mistakes: validatedData.mistakes?.trim() || null,
        lessons: validatedData.lessons?.trim() || null,
      },
    });

    return NextResponse.json(updatedEntry);
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
    const existingEntry = await prisma.journalEntry.findUnique({
      where: { id },
    });

    if (!existingEntry || existingEntry.userId !== session.userId) {
      return NextResponse.json({ error: "Journal entry not found" }, { status: 404 });
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json({ error: "Failed to delete journal entry" }, { status: 500 });
  }
}
