import { z } from 'zod';

const addressSchema = z
  .object({
    line1: z.string().trim().min(1, "address.line1 cannot be empty").max(200).optional(),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().max(120).optional(),
    state: z.string().trim().max(120).optional(),
    postal_code: z.string().trim().max(20).optional(),
    country: z.string().trim().max(120).optional(),
  })
  .strict({ message: "Unknown field in address" });

export { addressSchema };