import prisma from "../prisma";
import { TradeInput } from "../validations/trade";

export async function createTrade(userId: string, data: TradeInput) {
  // Determine trading date from entryTime (use local date assuming IST as standard)
  const entryDateObj = new Date(data.entryTime);
  const tradingDate = new Date(
    entryDateObj.getFullYear(),
    entryDateObj.getMonth(),
    entryDateObj.getDate()
  );

  return prisma.$transaction(async (tx) => {
    let journal;

    if (data.journalId) {
      journal = await tx.journal.findUnique({
        where: { id: data.journalId }
      });
      if (journal && journal.userId !== userId) {
        throw new Error("Unauthorized journal access");
      }
    }

    if (!journal) {
      // Find or create Journal for this trading date
      journal = await tx.journal.findFirst({
        where: {
          userId,
          date: tradingDate,
        },
      });

      if (!journal) {
        journal = await tx.journal.create({
          data: {
            userId,
            date: tradingDate,
            status: "DRAFT",
          },
        });
      }
    }

    // Create the Trade
    const newTrade = await tx.trade.create({
      data: {
        userId,
        journalId: journal.id,
        symbol: data.symbol,
        tradeType: data.tradeType,
        direction: data.direction,
        entryPrice: data.entryPrice,
        entryTime: data.entryTime,
        quantity: data.quantity,
        stopLoss: data.stopLoss || 0,
        target: data.target || 0,
        exitPrice: data.exitPrice,
        exitTime: data.exitTime,
        setupStrategy: data.setupStrategy || "None",
        exitReason: data.exitReason,
        tradeNote: data.tradeNote || "No note provided",
        source: data.source,

        // Optional/Backward compatibility fields
        strategyId: data.strategyId || null,
        emotion: data.emotion || null,
        marketCondition: data.marketCondition || null,
        planFollowed: data.planFollowed || null,
        whatWentWell: data.whatWentWell || null,
        whatWentWrong: data.whatWentWrong || null,
        lesson: data.lesson || null,
        tradeStyle: data.tradeStyle || null,
        stopLossSource: data.stopLossSource || null,
        targetSource: data.targetSource || null,
      },
    });

    return newTrade;
  });
}
