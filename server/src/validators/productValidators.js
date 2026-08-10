import { z } from 'zod';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .max(50)
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU must be alphanumeric (dashes/underscores allowed)'),
  category: z.string().regex(objectIdRegex, 'Valid category ID is required'),
  description: z.string().trim().max(2000).optional().default(''),
  quantity: z.coerce.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative'),
  unitPrice: z.coerce.number().positive('Unit price must be greater than 0'),
  supplierName: z.string().trim().min(1, 'Supplier name is required').max(200),
});

const updateProductSchema = createProductSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' }
);

const emptyToUndefined = (value) => (value === '' || value === null || value === undefined ? undefined : value);

const productQuerySchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  category: z.preprocess(emptyToUndefined, z.string().regex(objectIdRegex).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum(['In Stock', 'Low Stock', 'Out of Stock']).optional()
  ),
  sortBy: z.enum(['name', 'quantity', 'unitPrice', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});


export { createProductSchema,
  updateProductSchema,
  productQuerySchema, };
