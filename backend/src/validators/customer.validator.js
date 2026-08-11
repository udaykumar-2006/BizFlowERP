const { z } = require('zod');

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'], {
    errorMap: () => ({ message: 'customerType must be RETAIL, WHOLESALE or DISTRIBUTOR' }),
  }),
  address: z.string().optional(),
  status: z
    .enum(['LEAD', 'ACTIVE', 'INACTIVE'], {
      errorMap: () => ({ message: 'status must be LEAD, ACTIVE or INACTIVE' }),
    })
    .optional(),
  followUpDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  notes: z.string().optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

const createFollowUpSchema = z.object({
  note: z.string().min(1, 'Note is required'),
  followUpDate: z.string().datetime({ offset: true, message: 'followUpDate must be a valid ISO datetime' }),
});

module.exports = { createCustomerSchema, updateCustomerSchema, createFollowUpSchema };
