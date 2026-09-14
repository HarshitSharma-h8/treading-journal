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
    const { experienceLevel, primaryMarket, startingCapital, profitGuardrail, lossGuardrail } = body;

    // Validate
    if (!startingCapital || startingCapital <= 0) {
      return NextResponse.json({ error: "Starting capital must be greater than 0" }, { status: 400 });
    }
    if (profitGuardrail <= startingCapital) {
      return NextResponse.json({ error: "Profit guardrail must be greater than starting capital" }, { status: 400 });
    }
    if (lossGuardrail >= startingCapital || lossGuardrail < 0) {
      return NextResponse.json({ error: "Loss guardrail must be less than starting capital and >= 0" }, { status: 400 });
    }

    // Use a transaction to ensure both user update and capital event creation succeed
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.userId },
        data: {
          experienceLevel,
          primaryMarket,
          onboardingCompleted: true,
          profitGuardrail,
          lossGuardrail,
        },
      });

      // Create the STARTING_CAPITAL event
      await tx.capitalEvent.create({
        data: {
          userId: session.userId,
          type: "STARTING_CAPITAL",
          amount: startingCapital,
          note: "Initial deposit during onboarding",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
