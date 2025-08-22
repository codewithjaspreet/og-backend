import { z } from 'zod';
import { addressSchema } from './address_schema.js';
import { contactSchema } from './contact_schema.js';

const gymInputSchema = z
  .object({
    gym_name: z.string().trim().min(1, "gym_name is required"),
    address: addressSchema.optional(),
    gym_plans: z.array(z.any()).default([]),             
    gym_members: z.array(z.any()).default([]),
    owner: z.string().trim().min(1, "owner is required"),
    contact_details: contactSchema.optional(),
    gym_logo: z.string().trim().optional().default(""),
    is_active: z.boolean().optional().default(true),
    feedbacks: z.array(z.any()).default([]),
    gym_dob: z.coerce.date().optional(),              
    subscription_status: z.boolean().optional().default(true),
    subscription_plan: z.string().trim().optional(),
    announcements: z.array(z.any()).default([]),
    total_revenue: z.number().nonnegative().optional().default(0.0),
    revenue_this_month: z.number().nonnegative().optional().default(0.0),
  })
  .strict({ message: "Unknown field in gym document" });

export { gymInputSchema };