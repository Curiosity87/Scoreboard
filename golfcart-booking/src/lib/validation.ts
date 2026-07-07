import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ange ditt namn.").max(100),
  email: z.string().trim().toLowerCase().email("Ogiltig e-postadress."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 -]{7,17}$/, "Ogiltigt telefonnummer.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken."),
});

export const createBookingSchema = z.object({
  cartId: z.string().min(1),
  // Värde från <input type="datetime-local">, tolkas som Europe/Stockholm.
  startTime: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Ogiltig starttid."),
});

export const cartSchema = z.object({
  name: z.string().trim().min(1, "Ange ett namn.").max(50),
  model: z.string().trim().min(1).max(100).default("Yamaha Drive2"),
  status: z.enum(["ACTIVE", "MAINTENANCE", "RETIRED"]),
  unlockCode: z.string().trim().min(1, "Ange en låskod.").max(50),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  swishPhone: z.string().trim().min(5, "Ange ett giltigt telefonnummer."),
  // Anges i kronor i formuläret, lagras i ören.
  priceKr: z.coerce.number().min(0).max(100000),
  slotMinutes: z.coerce.number().int().min(30).max(24 * 60),
  holdMinutes: z.coerce.number().int().min(5).max(24 * 60),
});
