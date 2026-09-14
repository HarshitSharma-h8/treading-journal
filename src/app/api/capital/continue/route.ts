import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { GuardrailType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { guardrailType, currentBalance } = body;

    if (!guardrailType || !["PROFIT", "LOSS"].includes(guardrailType)) {
      return NextResponse.json({ error: "Invalid guardrail type" }, { status: 400 });
    }

    // Create a new GuardrailEvent with status CONTINUED
    const event = await prisma.guardrailEvent.create({
      data: {
        userId: session.userId as string,
        guardrailType: guardrailType as GuardrailType,
        triggerBalance: currentBalance,
        status: "CONTINUED",
        reason: "User chose to continue trading",
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error saving continue decision:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
