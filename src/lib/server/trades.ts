import prisma from "../prisma";
import { TradeInput } from "../validations/trade";
import { createTrade as _createTrade } from "./trade-service";

export async function getTrades(userId: string) {
  // PnL is no longer stored in the database.
  // The caller or UI should calculate PnL on the fly using utility functions.
  return prisma.trade.findMany({
    where: { userId },
    orderBy: { entryTime: "desc" },
  });
}

export async function getTrade(userId: string, tradeId: string) {
  return prisma.trade.findFirst({
    where: {
      id: tradeId,
      userId: userId,
    },
  });
}

export const createTrade = _createTrade;

export async function updateTrade(
  userId: string,
  tradeId: string,
  data: Partial<TradeInput>
) {
  const existingTrade = await prisma.trade.findFirst({
    where: { id: tradeId, userId },
  });

  if (!existingTrade) {
    throw new Error("Trade not found");
  }

  // Update logic. We map the partial data to the schema.
  return prisma.trade.update({
    where: { id: tradeId },
    data: {
      symbol: data.symbol,
      tradeType: data.tradeType,
      direction: data.direction,
      entryPrice: data.entryPrice,
      entryTime: data.entryTime,
      quantity: data.quantity,
      stopLoss: data.stopLoss === null ? undefined : data.stopLoss,
      target: data.target === null ? undefined : data.target,
      exitPrice: data.exitPrice,
      exitTime: data.exitTime,
      setupStrategy: data.setupStrategy === null ? undefined : data.setupStrategy,
      exitReason: data.exitReason,
      tradeNote: data.tradeNote === null ? undefined : data.tradeNote,
      source: data.source,

      strategyId: data.strategyId,
      emotion: data.emotion,
      marketCondition: data.marketCondition,
      planFollowed: data.planFollowed,
      whatWentWell: data.whatWentWell,
      whatWentWrong: data.whatWentWrong,
      lesson: data.lesson,
      tradeStyle: data.tradeStyle,
      stopLossSource: data.stopLossSource,
      targetSource: data.targetSource,
      // We don't automatically update journalId on trade update unless specifically requested
      ...(data.journalId ? { journalId: data.journalId } : {}),
    },
  });
}

export async function deleteTrade(userId: string, tradeId: string) {
  return prisma.trade.deleteMany({
    where: {
      id: tradeId,
      userId: userId,
    },
  });
}
