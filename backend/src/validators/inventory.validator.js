const { z } = require('zod');

const createStockMovementSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z
    .number({ invalid_type_error: 'quantity must be a number' })
    .int('quantity must be an integer')
    .positive('quantity must be greater than 0'),
  movementType: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: 'movementType must be IN or OUT' }),
  }),
  reason: z.string().min(1, 'reason is required'),
});

module.exports = { createStockMovementSchema };
