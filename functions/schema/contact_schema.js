import { z } from 'zod';

const contactSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Email must be a valid email")
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[\d+\-() ]{7,20}$/, "Phone must be a valid phone")
      .optional(),

    whatsapp:z
    .string()
    .trim()
    .regex(/^[\d+\-() ]{7,20}$/, "Whatsapp no must be a valid phone")
    .optional()
  })
  .strict({ message: "Unknown field in contact_details" });

export { contactSchema };

