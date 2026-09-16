import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { journalSchema } from "@/lib/validations/journal";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const entries = await prisma.journal.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" },
      take: limit,
      include: {
        trades: true,
      }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = journalSchema.parse(body);
    
    // Check if an entry for this date already exists for the user.
    const startOfDay = new Date(validatedData.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(validatedData.date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingEntry = await prisma.journal.findFirst({
      where: {
        userId: session.userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const tradesData = validatedData.trades?.map((trade) => {
      return {
        userId: session.userId,
        symbol: trade.symbol,
        tradeType: trade.tradeType,
        direction: trade.direction,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        entryTime: trade.entryTime,
        exitTime: trade.exitTime,
        quantity: trade.quantity,
        stopLoss: trade.stopLoss || 0,
        target: trade.target || 0,
        exitReason: trade.exitReason,
        source: trade.source,
        tradeNote: trade.tradeNote || "No note provided",
        setupStrategy: trade.setupStrategy || "None",
        // Backward compatibility
        tradeStyle: trade.tradeStyle,
        stopLossSource: trade.stopLossSource,
        targetSource: trade.targetSource,
      };
    }) || [];

    const journalUpdateData = {
      followedTradingPlan: validatedData.followedTradingPlan,
      executionQuality: validatedData.executionQuality,
      whatDidWell: validatedData.whatDidWell?.trim() || null,
      biggestMistake: validatedData.biggestMistake?.trim() || null,
      emotionalTrade: validatedData.emotionalTrade,
      emotionalTradeOther: validatedData.emotionalTradeOther?.trim() || null,
      followedRiskManagement: validatedData.followedRiskManagement,
      tomorrowLesson: validatedData.tomorrowLesson?.trim() || null,
      status: validatedData.status,

      // Backward compatibility fields
      marketThoughts: validatedData.marketThoughts?.trim() || null,
      whatWentWrong: validatedData.whatWentWrong?.trim() || null,
      mistakes: validatedData.mistakes?.trim() || null,
      lessons: validatedData.lessons?.trim() || null,
    };

    if (existingEntry) {
      const updatedEntry = await prisma.$transaction(async (tx) => {
        const entry = await tx.journal.update({
          where: { id: existingEntry.id },
          data: journalUpdateData,
        });

        if (tradesData.length > 0) {
          await tx.trade.createMany({
            data: tradesData.map(t => ({ ...t, journalId: entry.id }))
          });
        }
        
        return entry;
      });
      return NextResponse.json(updatedEntry, { status: 200 });
    }

    const newEntry = await prisma.$transaction(async (tx) => {
      const entry = await tx.journal.create({
        data: {
          userId: session.userId,
          date: validatedData.date,
          ...journalUpdateData,
        },
      });
      
      if (tradesData.length > 0) {
        await tx.trade.createMany({
          data: tradesData.map(t => ({ ...t, journalId: entry.id }))
        });
      }

      return entry;
    });

  return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating journal entry:", error);
    
    const isPrismaError = error && typeof error === 'object' && ('code' in error || 'clientVersion' in error);
    const errorMessage = isPrismaError ? "Database error occurred while saving the journal entry." : (error as any).message || "Unknown error occurred";
    
    return NextResponse.json({ error: "Failed to create journal entry", details: errorMessage }, { status: 500 });
  }
}
