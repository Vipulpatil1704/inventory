import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
})

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required').max(200),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .max(50)
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU must be alphanumeric'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  quantity: z.coerce.number().int('Quantity must be an integer').min(0, 'Quantity cannot be negative'),
  unitPrice: z.coerce.number().positive('Unit price must be greater than 0'),
  supplierName: z.string().trim().min(1, 'Supplier name is required').max(200),
})

export const productUpdateSchema = productSchema.omit({ quantity: true })

export const stockAdjustSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  note: z.string().trim().max(500).optional().or(z.literal('')),
})
