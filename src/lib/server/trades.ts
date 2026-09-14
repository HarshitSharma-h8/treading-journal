import prisma from "../prisma";

export async function getTrades(userId: string) {
  return prisma.trade.findMany({
    where: { userId },
    orderBy: { tradeDate: "desc" },
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

type CreateTradeData = {
  symbol: string;
  tradeType: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  stopLoss?: number;
  target?: number;
  strategyId?: string;
  emotion?: string;
  marketCondition?: string;
  tradeSetup?: string;
  planFollowed?: boolean;
  quickNote?: string;
  whatWentWell?: string;
  whatWentWrong?: string;
  lesson?: string;
  tradeDate?: Date;
};

export async function createTrade(userId: string, data: CreateTradeData) {
  const rawPnl =
    data.tradeType === "BUY"
      ? (data.exitPrice - data.entryPrice) * data.quantity
      : (data.entryPrice - data.exitPrice) * data.quantity;
  const pnl = Number(rawPnl.toFixed(4));

  return prisma.trade.create({
    data: {
      userId,
      symbol: data.symbol,
      tradeType: data.tradeType,
      entryPrice: data.entryPrice,
      exitPrice: data.exitPrice,
      quantity: data.quantity,
      stopLoss: data.stopLoss,
      target: data.target,
      pnl: pnl,
      strategyId: data.strategyId,
      emotion: data.emotion,
      marketCondition: data.marketCondition,
      tradeSetup: data.tradeSetup,
      planFollowed: data.planFollowed,
      quickNote: data.quickNote,
      whatWentWell: data.whatWentWell,
      whatWentWrong: data.whatWentWrong,
      lesson: data.lesson,
      tradeDate: data.tradeDate || new Date(),
    },
  });
}

type UpdateTradeData = Partial<CreateTradeData>;

export async function updateTrade(
  userId: string,
  tradeId: string,
  data: UpdateTradeData
) {
  // We need to calculate PnL if relevant fields are updated.
  // Easiest is to fetch existing, merge, and recalculate.
  const existingTrade = await prisma.trade.findFirst({
    where: { id: tradeId, userId },
  });

  if (!existingTrade) {
    throw new Error("Trade not found");
  }

  const tradeType = data.tradeType ?? existingTrade.tradeType;
  const entryPrice = data.entryPrice ?? existingTrade.entryPrice.toNumber();
  const exitPrice = data.exitPrice ?? existingTrade.exitPrice.toNumber();
  const quantity = data.quantity ?? existingTrade.quantity.toNumber();

  const rawPnl =
    tradeType === "BUY"
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;
  const pnl = Number(rawPnl.toFixed(4));

  return prisma.trade.update({
    where: { id: tradeId },
    data: {
      symbol: data.symbol,
      tradeType: data.tradeType,
      entryPrice: data.entryPrice,
      exitPrice: data.exitPrice,
      quantity: data.quantity,
      stopLoss: data.stopLoss,
      target: data.target,
      pnl: pnl,
      strategyId: data.strategyId,
      emotion: data.emotion,
      marketCondition: data.marketCondition,
      tradeSetup: data.tradeSetup,
      planFollowed: data.planFollowed,
      quickNote: data.quickNote,
      whatWentWell: data.whatWentWell,
      whatWentWrong: data.whatWentWrong,
      lesson: data.lesson,
      tradeDate: data.tradeDate,
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
