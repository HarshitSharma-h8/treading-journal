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
    const { triggerBalance, guardrailType, reason } = body;

    const event = await prisma.guardrailEvent.create({
      data: {
        userId: session.userId,
        triggerBalance,
        guardrailType,
        reason,
        status: "ACTIVE",
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("POST /api/capital/break error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
