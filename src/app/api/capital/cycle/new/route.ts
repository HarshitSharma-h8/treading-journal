import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { baseCapital, profitGuardrail, lossGuardrail } = body;

    // Validation: Require all 3 values
    if (
      baseCapital === undefined || baseCapital === null ||
      profitGuardrail === undefined || profitGuardrail === null ||
      lossGuardrail === undefined || lossGuardrail === null
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const base = Number(baseCapital);
    const profit = Number(profitGuardrail);
    const loss = Number(lossGuardrail);

    // Validation: Non-negative
    if (base <= 0 || profit <= 0 || loss <= 0) {
      return NextResponse.json({ error: "Values must be greater than zero" }, { status: 400 });
    }

    // Validation: logical ordering
    if (loss >= base || base >= profit) {
      return NextResponse.json({ 
        error: "Invalid configuration. Must satisfy: Loss Guardrail < Base Capital < Profit Guardrail" 
      }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Close any currently ACTIVE cycle
      await tx.capitalCycle.updateMany({
        where: { userId: session.userId, status: "ACTIVE" },
        data: { status: "CLOSED", endedAt: new Date() }
      });

      // 2. Create the new active cycle
      await tx.capitalCycle.create({
        data: {
          userId: session.userId,
          baseCapital: base,
          profitGuardrail: profit,
          lossGuardrail: loss,
          status: "ACTIVE"
        }
      });

      // 3. Insert CAPITAL_RESET event for balance tracking
      await tx.capitalEvent.create({
        data: {
          userId: session.userId,
          type: "CAPITAL_RESET",
          amount: base,
          note: "Started new capital cycle",
        },
      });

      // 4. Mark any active breaks/guardrail events as RESUMED so the new cycle can proceed cleanly
      await tx.guardrailEvent.updateMany({
        where: { userId: session.userId, status: "ACTIVE" },
        data: { status: "RESUMED" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/capital/cycle/new error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
