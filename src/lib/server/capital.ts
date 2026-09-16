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
  guardrailHit?: "PROFIT" | "LOSS";
}

export async function getCapitalHistory(userId: string) {
  // Fetch all capital events and trades
  const capitalEvents = await prisma.capitalEvent.findMany({
    where: { userId },
    orderBy: { eventDate: "asc" },
  });

  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { entryTime: "asc" },
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

  const guardrailEvents = await prisma.guardrailEvent.findMany({
    where: { userId },
    orderBy: { eventDate: "desc" },
  });

  const capitalCycles = await prisma.capitalCycle.findMany({
    where: { userId },
    orderBy: { startedAt: "asc" },
  });
  
  const activeBreak = guardrailEvents.find(e => e.status === "ACTIVE");

  // Combine and sort events chronologically
  const allEvents = [
    ...capitalEvents.map((e) => ({
      type: "CAPITAL_EVENT",
      date: e.eventDate,
      data: e,
    })),
    ...trades.map((t) => ({
      type: "TRADE",
      date: t.entryTime,
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
  
  let profitHitState = false;
  let lossHitState = false;
  let lastProfitHitDate: Date | null = null;
  let lastLossHitDate: Date | null = null;

  for (const event of allEvents) {
    const dateStr = new Date(event.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });

    let amount = 0;
    let eventType: any;
    let tradeId = undefined;
    let capitalEventId = undefined;

    if (event.type === "CAPITAL_EVENT") {
      const ce = event.data as typeof capitalEvents[0];
      amount = Number(ce.amount);
      eventType = ce.type;
      capitalEventId = ce.id;

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
    } else if (event.type === "TRADE") {
      const tr = event.data as typeof trades[0];
      const entryPrice = Number(tr.entryPrice);
      const exitPrice = Number(tr.exitPrice);
      const quantity = Number(tr.quantity);
      amount = tr.direction === "BUY" 
        ? (exitPrice - entryPrice) * quantity 
        : (entryPrice - exitPrice) * quantity;
      eventType = "TRADE";
      tradeId = tr.id;
      currentBalance += amount;
    }

    const eventRawDate = event.date;
    const activeCycle = capitalCycles.find(c => 
      eventRawDate >= c.startedAt && (!c.endedAt || eventRawDate <= c.endedAt)
    );

    const activeProfitGuardrail = activeCycle?.profitGuardrail ? Number(activeCycle.profitGuardrail) : (guardrails?.profitGuardrail ? Number(guardrails.profitGuardrail) : undefined);
    const activeLossGuardrail = activeCycle?.lossGuardrail ? Number(activeCycle.lossGuardrail) : (guardrails?.lossGuardrail ? Number(guardrails.lossGuardrail) : undefined);

    let guardrailHit: "PROFIT" | "LOSS" | undefined = undefined;

    if (activeProfitGuardrail !== undefined) {
      const pg = activeProfitGuardrail;
      if (currentBalance >= pg && !profitHitState) {
        guardrailHit = "PROFIT";
        profitHitState = true;
        lastProfitHitDate = event.date;
      } else if (currentBalance < pg) {
        profitHitState = false;
      }
    }

    if (activeLossGuardrail !== undefined) {
      const lg = activeLossGuardrail;
      if (currentBalance <= lg && !lossHitState) {
        guardrailHit = "LOSS";
        lossHitState = true;
        lastLossHitDate = event.date;
      } else if (currentBalance > lg) {
        lossHitState = false;
      }
    }

    journey.push({
      date: dateStr,
      rawDate: event.date,
      balance: currentBalance,
      eventType,
      amount,
      tradeId,
      capitalEventId,
      guardrailHit,
    });
  }

  // Use the currently active cycle for status reporting if one exists
  const activeCycle = capitalCycles.find(c => c.status === "ACTIVE");
  const currentProfitGuardrail = activeCycle?.profitGuardrail ? Number(activeCycle.profitGuardrail) : (guardrails?.profitGuardrail ? Number(guardrails.profitGuardrail) : undefined);
  const currentLossGuardrail = activeCycle?.lossGuardrail ? Number(activeCycle.lossGuardrail) : (guardrails?.lossGuardrail ? Number(guardrails.lossGuardrail) : undefined);

  let status = "NORMAL";
  
  if (activeBreak) {
    status = "BREAK_ACTIVE";
  } else if (currentProfitGuardrail !== undefined && currentBalance >= currentProfitGuardrail) {
    const isContinued = guardrailEvents.some(e => 
      e.guardrailType === "PROFIT" && 
      e.status === "CONTINUED" && 
      lastProfitHitDate && 
      e.eventDate.getTime() >= lastProfitHitDate.getTime()
    );
    if (!isContinued) {
      status = "PROFIT_GUARDRAIL_HIT";
    }
  } else if (currentLossGuardrail !== undefined && currentBalance <= currentLossGuardrail) {
    const isContinued = guardrailEvents.some(e => 
      e.guardrailType === "LOSS" && 
      e.status === "CONTINUED" && 
      lastLossHitDate && 
      e.eventDate.getTime() >= lastLossHitDate.getTime()
    );
    if (!isContinued) {
      status = "LOSS_GUARDRAIL_HIT";
    }
  } else {
    if (currentProfitGuardrail !== undefined) {
      const pg = currentProfitGuardrail;
      if (currentBalance >= pg * 0.95 && currentBalance < pg) {
        status = "APPROACHING_PROFIT";
      }
    }
    if (currentLossGuardrail !== undefined) {
      const lg = currentLossGuardrail;
      if (currentBalance <= lg * 1.05 && currentBalance > lg) {
        status = "APPROACHING_LOSS";
      }
    }
  }

  return {
    journey,
    currentBalance,
    activeBaseCapital,
    profile: {
      ...guardrails,
      // override with current cycle guardrails so the UI uses them
      profitGuardrail: currentProfitGuardrail !== undefined ? currentProfitGuardrail : (guardrails?.profitGuardrail ?? null),
      lossGuardrail: currentLossGuardrail !== undefined ? currentLossGuardrail : (guardrails?.lossGuardrail ?? null)
    },
    status,
    activeBreak,
  };
}
