import { Prisma, type BookingOrigin } from "@prisma/client";
import { db } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { getSettings } from "@/lib/settings";

/**
 * Lat statusuppdatering. Vi kör ingen cron i MVP:n – i stället körs detta
 * före varje läsning/skrivning som bryr sig om aktuell status:
 *  - AWAITING_PAYMENT vars hold gått ut → EXPIRED (tidsluckan släpps,
 *    eftersom exclusion-constrainten bara gäller AWAITING_PAYMENT/CONFIRMED).
 *  - CONFIRMED vars sluttid passerat → COMPLETED (bilen ledig igen).
 */
export async function refreshBookingStatuses(): Promise<void> {
  const now = new Date();
  await db.booking.updateMany({
    where: { status: "AWAITING_PAYMENT", holdExpiresAt: { lt: now } },
    data: { status: "EXPIRED" },
  });
  await db.booking.updateMany({
    where: { status: "CONFIRMED", endTime: { lt: now } },
    data: { status: "COMPLETED" },
  });
}

// Alfabet utan lättförväxlade tecken (0/O, 1/I/L) – koden ska vara lätt
// att skriva av i Swish-appen och lätt för admin att matcha mot kontoutdrag.
const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generatePaymentReference(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `GB-${code}`;
}

export class BookingError extends Error {}

function isOverlapViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError
      ? JSON.stringify(e.meta ?? {}).includes("bookings_no_overlap")
      : e instanceof Error && e.message.includes("bookings_no_overlap")
  );
}

export interface CreateBookingInput {
  cartId: string;
  userId: string;
  startTime: Date;
  createdBy: BookingOrigin;
}

/**
 * Skapar en bokning i AWAITING_PAYMENT med tillfälligt reserverad tidslucka
 * (hold_expires_at) och en Payment-rad via vald PaymentProvider.
 * Dubbelbokning stoppas i sista hand av databasens exclusion constraint –
 * appkoden gör ingen egen räknekontroll utan litar på den.
 */
export async function createBooking(input: CreateBookingInput) {
  await refreshBookingStatuses();

  const settings = await getSettings();
  const cart = await db.cart.findUnique({ where: { id: input.cartId } });
  if (!cart || cart.status !== "ACTIVE") {
    throw new BookingError("Bilen är inte tillgänglig för bokning.");
  }

  const now = new Date();
  // 5 min nåd bakåt så "boka nu" inte faller på sekundstrul.
  if (input.startTime.getTime() < now.getTime() - 5 * 60 * 1000) {
    throw new BookingError("Starttiden har redan passerat.");
  }
  if (input.startTime.getTime() > now.getTime() + 60 * 24 * 60 * 60 * 1000) {
    throw new BookingError("Det går bara att boka upp till 60 dagar framåt.");
  }

  const endTime = new Date(input.startTime.getTime() + settings.slotMinutes * 60 * 1000);
  const holdExpiresAt = new Date(now.getTime() + settings.holdMinutes * 60 * 1000);
  const { provider, kind } = getPaymentProvider();

  // Referenskoden är unik – vid (osannolik) kollision provar vi igen.
  for (let attempt = 0; attempt < 5; attempt++) {
    const reference = generatePaymentReference();
    try {
      return await db.$transaction(async (tx) => {
        const booking = await tx.booking.create({
          data: {
            cartId: input.cartId,
            userId: input.userId,
            startTime: input.startTime,
            endTime,
            status: "AWAITING_PAYMENT",
            priceAmount: settings.priceAmount,
            paymentReference: reference,
            holdExpiresAt,
            createdBy: input.createdBy,
          },
        });
        const result = await provider.createPayment({
          bookingId: booking.id,
          amount: settings.priceAmount,
          reference,
        });
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            provider: kind,
            providerRef: result.providerRef,
            amount: settings.priceAmount,
            status: result.status,
          },
        });
        return booking;
      });
    } catch (e) {
      if (isOverlapViolation(e)) {
        throw new BookingError("Tiden krockar med en annan bokning. Välj en annan tid.");
      }
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" // unik referenskod krockade – prova ny kod
      ) {
        continue;
      }
      throw e;
    }
  }
  throw new BookingError("Kunde inte skapa en unik referenskod. Försök igen.");
}

/**
 * Admin bekräftar att Swish-betalningen kommit in: Payment → PAID,
 * Booking → CONFIRMED och upplåsningskoden släpps till kunden
 * (unlock_code_released_at sätts).
 *
 * Fungerar även på EXPIRED (admin såg betalningen sent) – då återupplivas
 * bokningen, och exclusion-constrainten stoppar det om tiden hunnit tas
 * av någon annan.
 */
export async function markBookingPaid(bookingId: string, adminUserId: string) {
  try {
    return await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
      if (!booking) throw new BookingError("Bokningen finns inte.");
      if (booking.status !== "AWAITING_PAYMENT" && booking.status !== "EXPIRED") {
        throw new BookingError(`Bokningen kan inte markeras som betald (status: ${booking.status}).`);
      }

      const now = new Date();
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          holdExpiresAt: null,
          unlockCodeReleasedAt: now,
        },
      });

      const payment = booking.payments[0];
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: "PAID", paidAt: now, confirmedByUserId: adminUserId },
        });
      }

      console.log(
        JSON.stringify({
          event: "booking_marked_paid",
          bookingId,
          paymentReference: booking.paymentReference,
          confirmedBy: adminUserId,
          at: now.toISOString(),
        })
      );
      return updated;
    });
  } catch (e) {
    if (isOverlapViolation(e)) {
      throw new BookingError("Tidsluckan har hunnit bokas av någon annan. Kontakta kunden och boka om.");
    }
    throw e;
  }
}

/** Avbokning (admin, eller kund på egen obetald bokning). */
export async function cancelBooking(bookingId: string, cancelledBy: string) {
  const booking = await db.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new BookingError("Bokningen finns inte.");
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    throw new BookingError("Bokningen är redan avslutad.");
  }
  const updated = await db.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
  console.log(
    JSON.stringify({
      event: "booking_cancelled",
      bookingId,
      previousStatus: booking.status,
      cancelledBy,
      at: new Date().toISOString(),
    })
  );
  return updated;
}

export interface CartWithAvailability {
  id: string;
  name: string;
  model: string;
  status: "ACTIVE" | "MAINTENANCE" | "RETIRED";
  /** Härledd: finns en CONFIRMED-bokning som täcker now()? */
  rentedNow: boolean;
  /** Sluttid för pågående bokning = när bilen väntas bli ledig igen. */
  availableAgainAt: Date | null;
}

/**
 * "Ledig/Uthyrd just nu" härleds ur bokningarna – bilen har inget eget
 * uthyrd-fält. Uthyrd = det finns en CONFIRMED-bokning där
 * start <= now < slut.
 */
export async function getCartsWithAvailability(): Promise<CartWithAvailability[]> {
  await refreshBookingStatuses();
  const now = new Date();
  const carts = await db.cart.findMany({
    where: { status: { not: "RETIRED" } },
    orderBy: { name: "asc" },
    include: {
      bookings: {
        where: { status: "CONFIRMED", startTime: { lte: now }, endTime: { gt: now } },
        take: 1,
      },
    },
  });
  return carts.map((cart) => {
    const current = cart.bookings[0] ?? null;
    return {
      id: cart.id,
      name: cart.name,
      model: cart.model,
      status: cart.status,
      rentedNow: current !== null,
      availableAgainAt: current?.endTime ?? null,
    };
  });
}
