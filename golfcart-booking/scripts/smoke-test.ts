// Integrationstest av bokningslogiken mot riktiga databasen.
// Körs med: pnpm tsx <denna fil> (från golfcart-booking/)
import { PrismaClient } from "@prisma/client";
import {
  createBooking,
  markBookingPaid,
  cancelBooking,
  refreshBookingStatuses,
  getCartsWithAvailability,
  BookingError,
} from "../src/lib/booking";

const db = new PrismaClient();
let failures = 0;

function check(name: string, ok: boolean, extra = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name} ${extra}`);
  if (!ok) failures++;
}

async function main() {
  const admin = await db.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const customer = await db.user.findFirstOrThrow({ where: { email: "kund@example.com" } });
  const cart = await db.cart.findFirstOrThrow({ where: { name: "Bil 1" } });

  // Städa gamla testbokningar
  await db.payment.deleteMany({});
  await db.booking.deleteMany({});

  const start = new Date(Date.now() + 24 * 3600 * 1000); // imorgon

  // 1. Skapa bokning
  const b1 = await createBooking({ cartId: cart.id, userId: customer.id, startTime: start, createdBy: "CUSTOMER" });
  check("bokning skapas som AWAITING_PAYMENT", b1.status === "AWAITING_PAYMENT");
  check("referenskod genereras (GB-XXXX)", /^GB-[2-9A-HJKMNP-Z]{4}$/.test(b1.paymentReference), b1.paymentReference);
  check("hold_expires_at sätts", b1.holdExpiresAt !== null);
  const p1 = await db.payment.findFirstOrThrow({ where: { bookingId: b1.id } });
  check("payment skapas som PENDING/MANUAL_SWISH", p1.status === "PENDING" && p1.provider === "MANUAL_SWISH");

  // 2. Dubbelbokning samma tid → ska stoppas av DB-constrainten
  let overlapBlocked = false;
  try {
    await createBooking({
      cartId: cart.id,
      userId: customer.id,
      startTime: new Date(start.getTime() + 60 * 60 * 1000), // 1h in i passet
      createdBy: "CUSTOMER",
    });
  } catch (e) {
    overlapBlocked = e instanceof BookingError;
  }
  check("överlappande bokning blockeras av exclusion constraint", overlapBlocked);

  // 3. Rygg-mot-rygg (start = förra passets slut) ska tillåtas
  const b2 = await createBooking({
    cartId: cart.id,
    userId: customer.id,
    startTime: new Date(start.getTime() + 300 * 60 * 1000),
    createdBy: "CUSTOMER",
  });
  check("rygg-mot-rygg-pass tillåts", b2.status === "AWAITING_PAYMENT");
  await cancelBooking(b2.id, admin.id);

  // 4. Markera som betald
  const paid = await markBookingPaid(b1.id, admin.id);
  check("markera betald → CONFIRMED", paid.status === "CONFIRMED");
  check("unlock_code_released_at sätts", paid.unlockCodeReleasedAt !== null);
  const p1b = await db.payment.findFirstOrThrow({ where: { bookingId: b1.id } });
  check("payment → PAID med confirmed_by", p1b.status === "PAID" && p1b.confirmedByUserId === admin.id && p1b.paidAt !== null);

  // 5. Dubbelklick på "markera betald" → fel, inte krasch
  let doublePaidBlocked = false;
  try {
    await markBookingPaid(b1.id, admin.id);
  } catch (e) {
    doublePaidBlocked = e instanceof BookingError;
  }
  check("redan betald bokning kan inte markeras igen", doublePaidBlocked);

  // 6. Hold-utgång: skapa bokning på annan bil med hold i det förflutna
  const cart2 = await db.cart.findFirstOrThrow({ where: { name: "Bil 2" } });
  const b3 = await createBooking({ cartId: cart2.id, userId: customer.id, startTime: start, createdBy: "CUSTOMER" });
  await db.booking.update({ where: { id: b3.id }, data: { holdExpiresAt: new Date(Date.now() - 1000) } });
  await refreshBookingStatuses();
  const b3After = await db.booking.findUniqueOrThrow({ where: { id: b3.id } });
  check("utgången hold → EXPIRED", b3After.status === "EXPIRED");

  // 7. Efter EXPIRED ska tiden vara bokningsbar igen
  const b4 = await createBooking({ cartId: cart2.id, userId: customer.id, startTime: start, createdBy: "CUSTOMER" });
  check("tid bokningsbar igen efter EXPIRED", b4.status === "AWAITING_PAYMENT");

  // 8. Admin kan återuppliva EXPIRED... men här är tiden tagen av b4 → ska blockeras
  let reviveBlocked = false;
  try {
    await markBookingPaid(b3.id, admin.id);
  } catch (e) {
    reviveBlocked = e instanceof BookingError;
  }
  check("EXPIRED kan inte återupplivas när tiden tagits av annan", reviveBlocked);
  await cancelBooking(b4.id, admin.id);
  const revived = await markBookingPaid(b3.id, admin.id);
  check("EXPIRED kan återupplivas när tiden är fri", revived.status === "CONFIRMED");

  // 9. Uthyrd nu: skapa pågående bekräftad bokning
  const cart3 = await db.cart.findFirstOrThrow({ where: { name: "Bil 3" } });
  const b5 = await createBooking({
    cartId: cart3.id,
    userId: customer.id,
    startTime: new Date(Date.now() - 2 * 60 * 1000),
    createdBy: "ADMIN",
  });
  await markBookingPaid(b5.id, admin.id);
  const carts = await getCartsWithAvailability();
  const c3 = carts.find((c) => c.name === "Bil 3")!;
  check("pågående CONFIRMED ⇒ uthyrd nu", c3.rentedNow === true);
  check("tillgänglig igen = passets sluttid", c3.availableAgainAt?.getTime() === b5.endTime.getTime());

  // 10. Passet slut → COMPLETED och ledig igen
  await db.booking.update({
    where: { id: b5.id },
    data: { startTime: new Date(Date.now() - 6 * 3600 * 1000), endTime: new Date(Date.now() - 1000) },
  });
  await refreshBookingStatuses();
  const b5After = await db.booking.findUniqueOrThrow({ where: { id: b5.id } });
  const carts2 = await getCartsWithAvailability();
  check("passerat pass → COMPLETED", b5After.status === "COMPLETED");
  check("bilen ledig efter avslutat pass", carts2.find((c) => c.name === "Bil 3")!.rentedNow === false);

  // Städa
  await db.payment.deleteMany({});
  await db.booking.deleteMany({});

  console.log(failures === 0 ? "\nALLA TESTER GRÖNA" : `\n${failures} TESTER RÖDA`);
  process.exit(failures === 0 ? 0 : 1);
}

main().finally(() => db.$disconnect());
