const { z } = require('zod');

const challanItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z
    .number({ invalid_type_error: 'quantity must be a number' })
    .int('quantity must be an integer')
    .positive('quantity must be greater than 0'),
});

const createChallanSchema = z.object({
  customerId: z.string().min(1, 'customerId is required'),
  items: z.array(challanItemSchema).min(1, 'At least one item is required'),
});

const updateChallanSchema = z.object({
  status: z.enum(['DRAFT', 'CANCELLED'], {
    errorMap: () => ({ message: 'status must be DRAFT or CANCELLED' }),
  }),
});

module.exports = { createChallanSchema, updateChallanSchema };
