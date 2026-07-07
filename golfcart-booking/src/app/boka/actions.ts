"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { BookingError, createBooking } from "@/lib/booking";
import { fromDatetimeLocalValue } from "@/lib/format";
import { createBookingSchema } from "@/lib/validation";

export interface BookingFormState {
  error?: string;
}

export async function createBookingAction(
  _prev: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const user = await requireUser();
  const parsed = createBookingSchema.safeParse({
    cartId: formData.get("cartId"),
    startTime: formData.get("startTime"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  let bookingId: string;
  try {
    const booking = await createBooking({
      cartId: parsed.data.cartId,
      userId: user.id,
      startTime: fromDatetimeLocalValue(parsed.data.startTime),
      createdBy: "CUSTOMER",
    });
    bookingId = booking.id;
  } catch (e) {
    if (e instanceof BookingError) return { error: e.message };
    throw e;
  }
  redirect(`/bokningar/${bookingId}`);
}
