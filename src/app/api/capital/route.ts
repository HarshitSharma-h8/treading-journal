import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { getCapitalHistory } from "@/lib/server/capital";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await getCapitalHistory(session.userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/capital error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, amount, note } = body;

    if (!type || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid type or amount" }, { status: 400 });
    }

    const event = await prisma.capitalEvent.create({
      data: {
        userId: session.userId,
        type,
        amount,
        note,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("POST /api/capital error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
