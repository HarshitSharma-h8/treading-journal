import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profitGuardrail, lossGuardrail } = body;

    if (profitGuardrail === undefined && lossGuardrail === undefined) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(profitGuardrail !== undefined && { profitGuardrail }),
        ...(lossGuardrail !== undefined && { lossGuardrail }),
      },
    });

    return NextResponse.json({ 
      profitGuardrail: user.profitGuardrail,
      lossGuardrail: user.lossGuardrail
    });
  } catch (error) {
    console.error("PATCH /api/capital/guardrails error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
