import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { refreshBookingStatuses } from "@/lib/booking";
import { getSettings } from "@/lib/settings";
import { requireUser } from "@/lib/session";
import { formatDateTime, formatSEK, toDatetimeLocalValue } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm } from "./booking-form";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ cartId: string }> }) {
  await requireUser();
  const { cartId } = await params;
  await refreshBookingStatuses();

  const [cart, settings] = await Promise.all([
    db.cart.findUnique({
      where: { id: cartId },
      select: {
        id: true,
        name: true,
        model: true,
        status: true,
        bookings: {
          where: {
            status: { in: ["AWAITING_PAYMENT", "CONFIRMED"] },
            endTime: { gt: new Date() },
          },
          orderBy: { startTime: "asc" },
          select: { id: true, startTime: true, endTime: true },
        },
      },
    }),
    getSettings(),
  ]);
  if (!cart || cart.status !== "ACTIVE") notFound();

  const hours = settings.slotMinutes / 60;
  // Förslag: nästa hel timme.
  const suggested = new Date(Math.ceil(Date.now() / 3_600_000) * 3_600_000);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Boka {cart.name}</CardTitle>
          <CardDescription>
            {cart.model} · Passlängd {Number.isInteger(hours) ? hours : hours.toFixed(1)} timmar ·{" "}
            {formatSEK(settings.priceAmount)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BookingForm
            cartId={cart.id}
            defaultStart={toDatetimeLocalValue(suggested)}
            minStart={toDatetimeLocalValue(new Date())}
          />
          <p className="text-sm text-muted-foreground">
            När du bokat får du Swish-instruktioner. Tiden hålls reserverad i{" "}
            {settings.holdMinutes} minuter i väntan på betalning.
          </p>
        </CardContent>
      </Card>

      {cart.bookings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upptagna tider för {cart.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {cart.bookings.map((b) => (
                <li key={b.id}>
                  {formatDateTime(b.startTime)} – {formatDateTime(b.endTime)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
