import { z } from 'zod';

const subscriptionSchema = z.object({

    plan_charges: z.number().min(1, "plan_charges is required"),
    plan_description: z.string().trim().min(1, "description is required"),
    is_active: z.boolean().optional().default(true),
    plan_name: z.string().trim().min(1, "plan_name is required"),
}).optional()

export  {subscriptionSchema};