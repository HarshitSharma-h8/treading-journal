import { z } from "zod";

export const tradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  tradeType: z.enum(["INTRADAY", "DELIVERY", "SWING"]),
  direction: z.enum(["BUY", "SELL"]),
  entryPrice: z.number().positive("Entry price must be positive"),
  entryTime: z.string().transform((str) => new Date(str)),
  quantity: z.number().positive("Quantity must be positive"),
  stopLoss: z.number().nonnegative("Stop loss must be non-negative").optional().nullable(),
  target: z.number().nonnegative("Target must be non-negative").optional().nullable(),
  exitPrice: z.number().positive("Exit price must be positive"),
  exitTime: z.string().transform((str) => new Date(str)),
  setupStrategy: z.string().optional().nullable(),
  exitReason: z.enum(["TARGET", "STOP_LOSS", "MANUAL"]),
  tradeNote: z.string().optional().nullable(),
  source: z.enum(["MANUAL", "SCREENSHOT"]).default("MANUAL"),

  // Backward compatibility fields
  strategyId: z.string().optional().nullable(),
  emotion: z.string().optional().nullable(),
  marketCondition: z.string().optional().nullable(),
  planFollowed: z.boolean().optional().nullable(),
  whatWentWell: z.string().optional().nullable(),
  whatWentWrong: z.string().optional().nullable(),
  lesson: z.string().optional().nullable(),
  tradeStyle: z.string().optional().nullable(),
  stopLossSource: z.string().optional().nullable(),
  targetSource: z.string().optional().nullable(),
  journalId: z.string().optional().nullable(), // Will be populated by the backend if not present
}).refine((data) => {
  if (data.direction === "BUY") {
    if (data.stopLoss && data.stopLoss >= data.entryPrice) return false;
    if (data.target && data.target <= data.entryPrice) return false;
  } else if (data.direction === "SELL") {
    if (data.stopLoss && data.stopLoss <= data.entryPrice) return false;
    if (data.target && data.target >= data.entryPrice) return false;
  }
  return true;
}, {
  message: "Invalid stop loss or target for the given trade direction",
  path: ["stopLoss"], // or target
}).refine((data) => {
  return data.exitTime.getTime() >= data.entryTime.getTime();
}, {
  message: "Exit time must be after or equal to entry time",
  path: ["exitTime"],
});

export const updateTradeSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").optional(),
  tradeType: z.enum(["INTRADAY", "DELIVERY", "SWING"]).optional(),
  direction: z.enum(["BUY", "SELL"]).optional(),
  entryPrice: z.number().positive("Entry price must be positive").optional(),
  entryTime: z.string().transform((str) => new Date(str)).optional(),
  quantity: z.number().positive("Quantity must be positive").optional(),
  stopLoss: z.number().nonnegative("Stop loss must be non-negative").optional().nullable(),
  target: z.number().nonnegative("Target must be non-negative").optional().nullable(),
  exitPrice: z.number().positive("Exit price must be positive").optional(),
  exitTime: z.string().transform((str) => new Date(str)).optional(),
  setupStrategy: z.string().optional().nullable(),
  exitReason: z.enum(["TARGET", "STOP_LOSS", "MANUAL"]).optional(),
  tradeNote: z.string().optional().nullable(),
  source: z.enum(["MANUAL", "SCREENSHOT"]).optional(),

  // Backward compatibility fields
  strategyId: z.string().optional().nullable(),
  emotion: z.string().optional().nullable(),
  marketCondition: z.string().optional().nullable(),
  planFollowed: z.boolean().optional().nullable(),
  whatWentWell: z.string().optional().nullable(),
  whatWentWrong: z.string().optional().nullable(),
  lesson: z.string().optional().nullable(),
  tradeStyle: z.string().optional().nullable(),
  stopLossSource: z.string().optional().nullable(),
  targetSource: z.string().optional().nullable(),
  journalId: z.string().optional().nullable(),
});

export type TradeInput = z.infer<typeof tradeSchema>;
