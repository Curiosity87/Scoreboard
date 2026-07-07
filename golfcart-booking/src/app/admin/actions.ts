"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BookingError, cancelBooking, createBooking, markBookingPaid } from "@/lib/booking";
import { fromDatetimeLocalValue } from "@/lib/format";
import { requireAdmin } from "@/lib/session";
import { cartSchema, createBookingSchema, settingsSchema } from "@/lib/validation";

export interface AdminFormState {
  error?: string;
  ok?: boolean;
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/bokningar");
  revalidatePath("/");
}

/** "Markera som betald" – hjärtat i det manuella Swish-flödet. */
export async function markPaidAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  try {
    await markBookingPaid(bookingId, admin.id);
  } catch (e) {
    if (e instanceof BookingError) {
      // Enkel felhantering i MVP: skicka med felet i query-param.
      redirect(`/admin?fel=${encodeURIComponent(e.message)}`);
    }
    throw e;
  }
  revalidateAdmin();
}

export async function adminCancelBookingAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const bookingId = String(formData.get("bookingId") ?? "");
  try {
    await cancelBooking(bookingId, admin.id);
  } catch (e) {
    if (e instanceof BookingError) {
      redirect(`/admin/bokningar?fel=${encodeURIComponent(e.message)}`);
    }
    throw e;
  }
  revalidateAdmin();
}

/** Manuell bokning, t.ex. kund som betalar på plats. */
export async function adminCreateBookingAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = createBookingSchema.safeParse({
    cartId: formData.get("cartId"),
    startTime: formData.get("startTime"),
  });
  const userId = String(formData.get("userId") ?? "");
  if (!parsed.success || !userId) {
    return { error: "Fyll i kund, bil och starttid." };
  }
  try {
    await createBooking({
      cartId: parsed.data.cartId,
      userId,
      startTime: fromDatetimeLocalValue(parsed.data.startTime),
      createdBy: "ADMIN",
    });
  } catch (e) {
    if (e instanceof BookingError) return { error: e.message };
    throw e;
  }
  revalidateAdmin();
  return { ok: true };
}

export async function saveCartAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const cartId = String(formData.get("cartId") ?? "");
  const parsed = cartSchema.safeParse({
    name: formData.get("name"),
    model: formData.get("model") || "Yamaha Drive2",
    status: formData.get("status"),
    unlockCode: formData.get("unlockCode"),
    note: formData.get("note"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const data = { ...parsed.data, note: parsed.data.note || null };
  if (cartId) {
    await db.cart.update({ where: { id: cartId }, data });
  } else {
    await db.cart.create({ data });
  }
  revalidatePath("/admin/bilar");
  revalidatePath("/");
  return { ok: true };
}

export async function saveSettingsAction(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    swishPhone: formData.get("swishPhone"),
    priceKr: formData.get("priceKr"),
    slotMinutes: formData.get("slotMinutes"),
    holdMinutes: formData.get("holdMinutes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { swishPhone, priceKr, slotMinutes, holdMinutes } = parsed.data;
  await db.settings.upsert({
    where: { id: 1 },
    update: { swishPhone, priceAmount: Math.round(priceKr * 100), slotMinutes, holdMinutes },
    create: {
      id: 1,
      swishPhone,
      priceAmount: Math.round(priceKr * 100),
      slotMinutes,
      holdMinutes,
    },
  });
  revalidatePath("/admin/installningar");
  revalidatePath("/");
  return { ok: true };
}
