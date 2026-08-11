const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unitPrice: z.number({ invalid_type_error: 'unitPrice must be a number' }).min(0, 'unitPrice cannot be negative'),
  currentStock: z.number({ invalid_type_error: 'currentStock must be a number' }).int().min(0, 'currentStock cannot be negative'),
  minimumStock: z.number({ invalid_type_error: 'minimumStock must be a number' }).int().min(0, 'minimumStock cannot be negative'),
  warehouseLocation: z.string().min(1, 'warehouseLocation is required'),
});

const updateProductSchema = createProductSchema.partial();

module.exports = { createProductSchema, updateProductSchema };
