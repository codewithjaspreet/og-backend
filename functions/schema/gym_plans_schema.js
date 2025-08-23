import { z } from 'zod';

const gymPlansInputSchema = z
  .object({
    gym_id: z.string().trim().min(1, "gym_id is required"),
    gym_name: z.string().trim().min(1, "gym_name is required"),
    plan_name: z.string().trim().min(1, "plan_name is required"),
    is_active: z.boolean().optional().default(true),
    plan_charges: z.number().nonnegative().optional().default(0.0),
    plan_description: z.string().trim().optional().default(""),
    plan_duration: z.number().nonnegative().optional().default(0.0),
  })
  .strict({ message: "Unknown field in gym document" });

export { gymPlansInputSchema };