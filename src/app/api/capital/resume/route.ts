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
    const { newCapital } = body;

    // First find the active break
    const activeBreak = await prisma.guardrailEvent.findFirst({
      where: { userId: session.userId, status: "ACTIVE" },
      orderBy: { eventDate: "desc" },
    });

    if (!activeBreak) {
      return NextResponse.json({ error: "No active break found" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Mark break as resumed
      await tx.guardrailEvent.update({
        where: { id: activeBreak.id },
        data: { status: "RESUMED" },
      });

      // If newCapital is provided, insert a CAPITAL_RESET event
      if (newCapital !== undefined && newCapital !== null) {
        await tx.capitalEvent.create({
          data: {
            userId: session.userId,
            type: "CAPITAL_RESET",
            amount: newCapital,
            note: "Capital adjusted after taking a break",
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/capital/resume error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
