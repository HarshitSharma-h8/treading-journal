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

    const entries = await prisma.journalEntry.findMany({
      where: { userId: session.userId },
      orderBy: { entryDate: "desc" },
      take: limit,
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
    // The DB has a unique constraint, but handling it nicely is better.
    const startOfDay = new Date(validatedData.entryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(validatedData.entryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        userId: session.userId,
        entryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const tradesData = validatedData.trades?.map((trade) => {
      const pnl =
        trade.tradeType === "BUY"
          ? (trade.exitPrice - trade.entryPrice) * trade.quantity
          : (trade.entryPrice - trade.exitPrice) * trade.quantity;
          
      return {
        userId: session.userId,
        symbol: trade.symbol,
        tradeType: trade.tradeType,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        quantity: trade.quantity,
        pnl,
        tradeDate: trade.tradeDate || validatedData.entryDate,
        tradeStyle: trade.tradeStyle,
        stopLoss: trade.stopLoss,
        target: trade.target,
        stopLossSource: trade.stopLossSource,
        targetSource: trade.targetSource,
      };
    }) || [];

    if (existingEntry) {
      // Instead of failing, update the existing entry (Upsert behavior for same day)
      // Or just fail. Requirements: "If a user already has an entry for that date: Open/edit the existing entry rather than creating a duplicate."
      // Since this is POST (create), the frontend should ideally redirect to edit if one exists, but if they post, we can just update it.
      const updatedEntry = await prisma.$transaction(async (tx) => {
        const entry = await tx.journalEntry.update({
          where: { id: existingEntry.id },
          data: {
            marketThoughts: validatedData.marketThoughts?.trim() || null,
            whatWentWell: validatedData.whatWentWell?.trim() || null,
            whatWentWrong: validatedData.whatWentWrong?.trim() || null,
            mistakes: validatedData.mistakes?.trim() || null,
            lessons: validatedData.lessons?.trim() || null,
          },
        });

        if (tradesData.length > 0) {
          await tx.trade.createMany({
            data: tradesData.map(t => ({ ...t, journalEntryId: entry.id }))
          });
        }
        
        return entry;
      });
      return NextResponse.json(updatedEntry, { status: 200 });
    }

    const newEntry = await prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          userId: session.userId,
          entryDate: validatedData.entryDate,
          marketThoughts: validatedData.marketThoughts?.trim() || null,
          whatWentWell: validatedData.whatWentWell?.trim() || null,
          whatWentWrong: validatedData.whatWentWrong?.trim() || null,
          mistakes: validatedData.mistakes?.trim() || null,
          lessons: validatedData.lessons?.trim() || null,
        },
      });
      
      if (tradesData.length > 0) {
        await tx.trade.createMany({
          data: tradesData.map(t => ({ ...t, journalEntryId: entry.id }))
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
    
    // Check if it's a Prisma error (they usually have a code or clientVersion)
    const isPrismaError = error && typeof error === 'object' && ('code' in error || 'clientVersion' in error);
    const errorMessage = isPrismaError ? "Database error occurred while saving the journal entry." : (error as any).message || "Unknown error occurred";
    
    return NextResponse.json({ error: "Failed to create journal entry", details: errorMessage }, { status: 500 });
  }
}
