import { z } from 'zod';

const measurementSchema = z
  .object({
    height: z.number().nonnegative().optional().default(0.0),
    weight: z.number().nonnegative().optional().default(0.0),
    waist: z.number().nonnegative().optional().default(0.0),
    chest: z.number().nonnegative().optional().default(0.0),
    shoulders: z.number().nonnegative().optional().default(0.0),
    legs: z.number().nonnegative().optional().default(0.0),
    forearm: z.number().nonnegative().optional().default(0.0),
    biceps: z.number().nonnegative().optional().default(0.0),
  })
  .strict({ message: "Unknown field in contact_details" });

export { measurementSchema };

