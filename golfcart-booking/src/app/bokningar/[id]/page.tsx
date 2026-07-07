import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { refreshBookingStatuses } from "@/lib/booking";
import { getSettings } from "@/lib/settings";
import { requireUser } from "@/lib/session";
import { formatDateTime, formatSEK, formatTime } from "@/lib/format";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelOwnBookingAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  await refreshBookingStatuses();

  const booking = await db.booking.findUnique({
    where: { id },
    include: { cart: { select: { name: true, model: true } } },
  });
  // Endast ägaren eller admin får se bokningen.
  if (!booking || (booking.userId !== user.id && user.role !== "ADMIN")) notFound();

  const settings = await getSettings();

  // Upplåsningskoden hämtas ENDAST när bokningen är bekräftad (betald) –
  // den får aldrig läcka till kunden innan dess.
  let unlockCode: string | null = null;
  if (booking.status === "CONFIRMED") {
    const cart = await db.cart.findUnique({
      where: { id: booking.cartId },
      select: { unlockCode: true },
    });
    unlockCode = cart?.unlockCode ?? null;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{booking.cart.name}</CardTitle>
            <BookingStatusBadge status={booking.status} />
          </div>
          <CardDescription>
            {booking.cart.model} · Referens {booking.paymentReference}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Start</span>
            <span>{formatDateTime(booking.startTime)}</span>
            <span className="text-muted-foreground">Slut</span>
            <span>{formatDateTime(booking.endTime)}</span>
            <span className="text-muted-foreground">Pris</span>
            <span>{formatSEK(booking.priceAmount)}</span>
          </div>

          {booking.status === "AWAITING_PAYMENT" && (
            <>
              <Alert variant="info">
                <AlertTitle>Betala med Swish för att bekräfta bokningen</AlertTitle>
                <AlertDescription>
                  <ol className="mt-2 list-decimal space-y-1 pl-4">
                    <li>
                      Öppna Swish och betala{" "}
                      <strong>{formatSEK(booking.priceAmount)}</strong> till{" "}
                      <strong>{settings.swishPhone}</strong>.
                    </li>
                    <li>
                      Skriv <strong>{booking.paymentReference}</strong> i meddelandet.
                    </li>
                    <li>
                      Klart! Vi bekräftar betalningen manuellt – därefter visas din
                      upplåsningskod här.
                    </li>
                  </ol>
                </AlertDescription>
              </Alert>
              {booking.holdExpiresAt && (
                <p className="text-sm text-muted-foreground">
                  Tiden hålls reserverad till kl. {formatTime(booking.holdExpiresAt)}. Uppdatera
                  sidan efter att du betalat.
                </p>
              )}
              <form action={cancelOwnBookingAction}>
                <input type="hidden" name="bookingId" value={booking.id} />
                <Button type="submit" variant="outline" className="w-full">
                  Avboka
                </Button>
              </form>
            </>
          )}

          {booking.status === "CONFIRMED" && unlockCode && (
            <Alert variant="success">
              <AlertTitle>Betald – här är din upplåsningskod</AlertTitle>
              <AlertDescription>
                <p className="my-3 text-center font-mono text-4xl font-bold tracking-widest">
                  {unlockCode}
                </p>
                <p>
                  Koden öppnar nyckelskåpet på <strong>{booking.cart.name}</strong>. Ta nyckeln,
                  kör försiktigt och lämna tillbaka nyckeln i skåpet när passet är slut.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {booking.status === "EXPIRED" && (
            <Alert variant="destructive">
              <AlertTitle>Bokningen har gått ut</AlertTitle>
              <AlertDescription>
                Vi hann inte se någon betalning innan reservationen släpptes. Har du betalat?
                Kontakta oss så löser vi det – annars går det bra att{" "}
                <Link href="/" className="underline">
                  boka på nytt
                </Link>
                .
              </AlertDescription>
            </Alert>
          )}

          {booking.status === "COMPLETED" && (
            <p className="text-sm text-muted-foreground">
              Passet är avslutat. Tack för att du hyrde av oss!
            </p>
          )}

          {booking.status === "CANCELLED" && (
            <p className="text-sm text-muted-foreground">Bokningen är avbokad.</p>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="ghost" size="sm">
        <Link href="/bokningar">← Mina bokningar</Link>
      </Button>
    </div>
  );
}
