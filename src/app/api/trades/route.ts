import { NextRequest, NextResponse } from "next/server";
import { getTrades, createTrade } from "@/lib/server/trades";
import { tradeSchema } from "@/lib/validations/trade";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;
    const trades = await getTrades(userId);
    return NextResponse.json(trades);
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;
    const body = await request.json();
    
    // Validate request body
    const validatedData = tradeSchema.parse(body);
    
    const newTrade = await createTrade(userId, validatedData);
    
    return NextResponse.json(newTrade, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    
    console.error("Error creating trade:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create trade" }, { status: 500 });
  }
}
