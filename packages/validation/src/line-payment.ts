import { z } from "zod";
import { moneySchema } from "./common";

export const createLinePaymentSchema = z.object({
  amount: moneySchema,
  period: z.string().trim().max(50).optional(),
  paymentDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const reverseLinePaymentSchema = z.object({
  reason: z.string().trim().min(1, "سبب العكس مطلوب").max(500),
});

export const updateLinePaymentSchema = z.object({
  amount: moneySchema.optional(),
  notes: z.string().trim().max(500).optional().nullable(),
  paymentDate: z.coerce.date().optional(),
});

export type CreateLinePaymentInput = z.infer<typeof createLinePaymentSchema>;
export type UpdateLinePaymentInput = z.infer<typeof updateLinePaymentSchema>;
export type ReverseLinePaymentInput = z.infer<
  typeof reverseLinePaymentSchema
>;
