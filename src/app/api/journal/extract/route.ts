import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const extractionServiceUrl = process.env.TRADE_EXTRACTION_SERVICE_URL;
    if (!extractionServiceUrl) {
      return NextResponse.json(
        { error: "TRADE_EXTRACTION_SERVICE_URL is not configured" },
        { status: 500 }
      );
    }

    const extractionFormData = new FormData();
    extractionFormData.append("image", imageFile);

    const response = await fetch(`${extractionServiceUrl}/api/v1/extract`, {
      method: "POST",
      body: extractionFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Extraction service failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Process trades to apply default SL/Target rules
    const processedTrades = data.trades?.map((trade: any) => {
      let stopLoss = trade.stopLoss || null;
      let target = trade.target || null;
      let stopLossSource = "USER"; 
      let targetSource = "USER";

      const pnl = trade.pnl || 0;
      
      if (pnl < 0) {
        stopLoss = trade.exit?.price || trade.exitPrice || stopLoss;
        target = null;
        stopLossSource = "AUTO_FROM_EXIT";
      } else if (pnl > 0) {
        target = trade.exit?.price || trade.exitPrice || target;
        stopLoss = null;
        targetSource = "AUTO_FROM_EXIT";
      }

      return {
        id: `temp-${Math.random().toString(36).substring(2, 9)}`,
        symbol: trade.symbol,
        tradeType: trade.direction === "LONG" ? "BUY" : "SELL", 
        quantity: trade.quantity,
        entryPrice: trade.entry?.price || trade.entryPrice,
        exitPrice: trade.exit?.price || trade.exitPrice,
        entryTime: trade.entry?.time || trade.entryTime,
        exitTime: trade.exit?.time || trade.exitTime,
        pnl: pnl,
        tradeStyle: "INTRADAY",
        stopLoss,
        target,
        stopLossSource,
        targetSource,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      requiresReview: true,
      journal: {
        date: new Date().toISOString().split('T')[0],
      },
      trades: processedTrades,
      warnings: data.warnings || [],
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
