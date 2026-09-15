import { z } from "zod";
import { tradeSchema } from "./trade";

export const journalSchema = z.object({
  entryDate: z.string().transform((str) => new Date(str)),
  marketThoughts: z.string().optional(),
  whatWentWell: z.string().optional(),
  whatWentWrong: z.string().optional(),
  mistakes: z.string().optional(),
  lessons: z.string().optional(),
  trades: z.array(tradeSchema).optional(),
});

export type JournalInput = z.infer<typeof journalSchema>;
