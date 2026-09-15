import { z } from "zod";

export const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  tradeType: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive("Entry price must be positive"),
  exitPrice: z.number().positive("Exit price must be positive"),
  quantity: z.number().positive("Quantity must be positive"),
  stopLoss: z.number().positive("Stop loss must be positive").optional(),
  target: z.number().positive("Target must be positive").optional(),
  strategyId: z.string().optional(),
  emotion: z.string().optional(),
  marketCondition: z.string().optional(),
  tradeSetup: z.string().optional(),
  planFollowed: z.boolean().optional(),
  quickNote: z.string().optional(),
  whatWentWell: z.string().optional(),
  whatWentWrong: z.string().optional(),
  lesson: z.string().optional(),
  tradeDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  tradeStyle: z.string().optional(),
  stopLossSource: z.string().optional(),
  targetSource: z.string().optional(),
  journalEntryId: z.string().optional(),
});

export const updateTradeSchema = tradeSchema.partial();
