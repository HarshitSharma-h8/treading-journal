import { NextRequest, NextResponse } from "next/server";
import { getTrade, updateTrade, deleteTrade } from "@/lib/server/trades";
import { updateTradeSchema } from "@/lib/validations/trade";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;
    const { id } = await params;
    
    const trade = await getTrade(userId, id);
    
    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }
    
    return NextResponse.json(trade);
  } catch (error) {
    console.error("Error fetching trade:", error);
    return NextResponse.json({ error: "Failed to fetch trade" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = updateTradeSchema.parse(body);
    
    const updatedTrade = await updateTrade(userId, id, validatedData);
    
    return NextResponse.json(updatedTrade);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }
    
    if (error instanceof Error && error.message === "Trade not found") {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }
    
    console.error("Error updating trade:", error);
    return NextResponse.json({ error: "Failed to update trade" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.userId;
    const { id } = await params;
    
    await deleteTrade(userId, id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting trade:", error);
    return NextResponse.json({ error: "Failed to delete trade" }, { status: 500 });
  }
}
