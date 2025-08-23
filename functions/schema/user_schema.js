import { z } from 'zod';
import { contactSchema } from './contact_schema.js';
import { addressSchema } from './address_schema.js';
import { measurementSchema } from './measurement_schema.js';
import announcementSchema from './announcement_schema.js';
import { gymInputSchema } from './gym_schema.js';
import { gymPlansInputSchema } from './gym_plans_schema.js';

const userSchema = z
  .object({
    active_gym: gymInputSchema,
    active_gym_plan: gymPlansInputSchema,
    active_subscription_plan: z.string().trim().min(1, "active_subscription_plan is required"),
    plan_name: z.string().trim().min(1, "plan_name is required"),
    check_in_time_today: z.coerce.date().optional(),
    check_out_time_today: z.coerce.date().optional(),
    is_fees_paid: z.boolean().optional().default(true),
    is_present_today: z.boolean().optional().default(true),
    name: z.string().trim().min(1, "name is required"),
    subscription_status: z.boolean().optional().default(true).optional(),
    contact_details: contactSchema.optional(),
    profile_picture: z.string().trim().optional().default(""),
    is_active: z.boolean().optional().default(true),
    date_of_birth: z.coerce.date().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    role: z.enum(["Member", "Admin", "Staff", "Owner"]).optional(),
    address: addressSchema.optional(),
    measurements: measurementSchema.optional(),
    announcements: z.array(announcementSchema).default([]).optional(),
  
  })
  .strict({ message: "Unknown field in user document" });

export { userSchema };