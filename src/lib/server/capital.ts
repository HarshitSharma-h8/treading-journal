import prisma from "@/lib/prisma";
import { CapitalEventType, GuardrailType } from "@prisma/client";

export interface CapitalPoint {
  date: string;
  rawDate: Date;
  balance: number;
  eventType: "STARTING_CAPITAL" | "TRADE" | "DEPOSIT" | "WITHDRAWAL" | "CAPITAL_RESET" | "ADJUSTMENT";
  amount?: number;
  tradeId?: string;
  capitalEventId?: string;
}

export async function getCapitalHistory(userId: string) {
  // Fetch all capital events and trades
  const capitalEvents = await prisma.capitalEvent.findMany({
    where: { userId },
    orderBy: { eventDate: "asc" },
  });

  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { tradeDate: "asc" },
  });

  const guardrails = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profitGuardrail: true,
      lossGuardrail: true,
      experienceLevel: true,
      primaryMarket: true,
      onboardingCompleted: true,
    },
  });

  const activeBreak = await prisma.guardrailEvent.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { eventDate: "desc" },
  });

  // Combine and sort events chronologically
  const allEvents = [
    ...capitalEvents.map((e) => ({
      type: "CAPITAL_EVENT",
      date: e.eventDate,
      data: e,
    })),
    ...trades.map((t) => ({
      type: "TRADE",
      date: t.tradeDate,
      data: t,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Ensure STARTING_CAPITAL is always the absolute first event, backdated if necessary
  const startingCapitalIdx = allEvents.findIndex(e => e.type === "CAPITAL_EVENT" && (e.data as any).type === CapitalEventType.STARTING_CAPITAL);
  if (startingCapitalIdx !== -1) {
    const startingCapitalEvent = allEvents[startingCapitalIdx];
    allEvents.splice(startingCapitalIdx, 1);
    
    if (allEvents.length > 0) {
      // Set the date to just before the earliest event
      const earliestDate = new Date(allEvents[0].date.getTime() - 1000);
      startingCapitalEvent.date = earliestDate;
    }
    
    allEvents.unshift(startingCapitalEvent);
  }

  const journey: CapitalPoint[] = [];
  let currentBalance = 0;
  let activeBaseCapital = 0; // Starts with STARTING_CAPITAL or CAPITAL_RESET

  for (const event of allEvents) {
    const dateStr = new Date(event.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });

    if (event.type === "CAPITAL_EVENT") {
      const ce = event.data as typeof capitalEvents[0];
      const amount = Number(ce.amount);

      if (ce.type === CapitalEventType.STARTING_CAPITAL) {
        currentBalance = amount;
        activeBaseCapital = amount;
      } else if (ce.type === CapitalEventType.CAPITAL_RESET) {
        currentBalance = amount;
        activeBaseCapital = amount;
      } else if (ce.type === CapitalEventType.DEPOSIT) {
        currentBalance += amount;
      } else if (ce.type === CapitalEventType.WITHDRAWAL) {
        currentBalance -= amount;
      } else if (ce.type === CapitalEventType.ADJUSTMENT) {
        currentBalance += amount;
      }

      journey.push({
        date: dateStr,
        rawDate: event.date,
        balance: currentBalance,
        eventType: ce.type as any,
        amount: amount,
        capitalEventId: ce.id,
      });
    } else if (event.type === "TRADE") {
      const tr = event.data as typeof trades[0];
      const pnl = Number(tr.pnl);
      currentBalance += pnl;

      journey.push({
        date: dateStr,
        rawDate: event.date,
        balance: currentBalance,
        eventType: "TRADE",
        amount: pnl,
        tradeId: tr.id,
      });
    }
  }

  // Find the current status based on balance and guardrails
  let status = "NORMAL";
  if (activeBreak) {
    status = "BREAK_ACTIVE";
  } else if (guardrails?.profitGuardrail && currentBalance >= Number(guardrails.profitGuardrail)) {
    status = "PROFIT_GUARDRAIL_HIT";
  } else if (guardrails?.lossGuardrail && currentBalance <= Number(guardrails.lossGuardrail)) {
    status = "LOSS_GUARDRAIL_HIT";
  } else {
    if (guardrails?.profitGuardrail) {
      const pg = Number(guardrails.profitGuardrail);
      if (currentBalance >= pg * 0.95 && currentBalance < pg) {
        status = "APPROACHING_PROFIT";
      }
    }
    if (guardrails?.lossGuardrail) {
      const lg = Number(guardrails.lossGuardrail);
      if (currentBalance <= lg * 1.05 && currentBalance > lg) {
        status = "APPROACHING_LOSS";
      }
    }
  }

  return {
    journey,
    currentBalance,
    activeBaseCapital,
    profile: guardrails,
    status,
    activeBreak,
  };
}
