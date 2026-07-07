import { db } from "@/lib/db";
import type { Settings } from "@prisma/client";

// Fallback om seed inte körts – skapas vid första läsning.
const DEFAULTS = {
  swishPhone: "070-123 45 67",
  priceAmount: 50000,
  slotMinutes: 300,
  holdMinutes: 30,
};

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return db.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULTS },
  });
}
