import { z } from "zod";
import { PAYMENT_METHODS } from "../../domain/entities/sale";

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

export const paymentMethodSchema = z.enum(PAYMENT_METHODS);

export const amountSchema = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Must be a positive decimal with up to 2 places")
  .refine((value) => Number(value) > 0, "Must be greater than zero");

export const externalIdSchema = z
  .string()
  .regex(/^V-\d+$/, "externalId must match pattern V-<number>");

export const createSaleSchema = z.object({
  externalId: externalIdSchema,
  date: isoDateSchema,
  customer: z.string().trim().min(1).max(200),
  product: z.string().trim().min(1).max(200),
  quantity: z.number().int().positive(),
  amount: amountSchema,
  paymentMethod: paymentMethodSchema,
});

export const listSalesQuerySchema = z.object({
  from: isoDateSchema.optional(),
  to: isoDateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const salesSummaryQuerySchema = z
  .object({
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    month: z
      .string()
      .regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.month && (data.from || data.to)) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either month or from/to, not both",
        path: ["month"],
      });
      return;
    }

    if (!data.month && (!data.from || !data.to)) {
      ctx.addIssue({
        code: "custom",
        message: "from and to are required when month is not provided",
        path: ["from"],
      });
    }
  });
