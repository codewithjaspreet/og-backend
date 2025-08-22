import { z } from 'zod';

const contactSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("contact_details.email must be a valid email")
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[\d+\-() ]{7,20}$/, "contact_details.phone must be a valid phone")
      .optional(),
  })
  .strict({ message: "Unknown field in contact_details" });

export { contactSchema };

