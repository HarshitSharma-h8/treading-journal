import { z } from "zod";
import { tradeSchema } from "./trade";

export const journalSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  followedTradingPlan: z.enum(["YES", "PARTIALLY", "NO"]).optional().nullable(),
  executionQuality: z.enum(["EXCELLENT", "GOOD", "AVERAGE", "POOR"]).optional().nullable(),
  whatDidWell: z.string().max(500).optional().nullable(),
  biggestMistake: z.string().max(500).optional().nullable(),
  emotionalTrade: z.enum(["NO", "FOMO", "REVENGE", "OVERTRADING", "FEAR", "GREED", "OTHER"]).optional().nullable(),
  emotionalTradeOther: z.string().max(100).optional().nullable(),
  followedRiskManagement: z.enum(["YES", "NO"]).optional().nullable(),
  tomorrowLesson: z.string().max(500).optional().nullable(),
  status: z.enum(["DRAFT", "COMPLETED"]).default("DRAFT"),

  // Backward compatibility fields
  marketThoughts: z.string().optional().nullable(),
  whatWentWrong: z.string().optional().nullable(),
  mistakes: z.string().optional().nullable(),
  lessons: z.string().optional().nullable(),

  trades: z.array(tradeSchema).optional(),
});

export type JournalInput = z.infer<typeof journalSchema>;
