"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { BookingError, cancelBooking } from "@/lib/booking";
import { requireUser } from "@/lib/session";

// Kunden kan bara avboka sina egna ännu ej betalda bokningar.
// Betalda bokningar avbokas av admin (ev. återbetalning hanteras manuellt).
export async function cancelOwnBookingAction(formData: FormData) {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== user.id) {
    throw new BookingError("Bokningen finns inte.");
  }
  if (booking.status !== "AWAITING_PAYMENT") {
    throw new BookingError("Kontakta oss för att avboka en betald bokning.");
  }
  await cancelBooking(bookingId, user.id);
  revalidatePath(`/bokningar/${bookingId}`);
  revalidatePath("/bokningar");
}
