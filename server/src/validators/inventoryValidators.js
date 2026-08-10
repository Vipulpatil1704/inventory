import { z } from 'zod';

const stockAdjustSchema = z.object({
  quantity: z.coerce.number().int('Quantity must be an integer').positive('Quantity must be greater than 0'),
  note: z.string().trim().max(500).optional().default(''),
});

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export { stockAdjustSchema, historyQuerySchema };
