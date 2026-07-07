import Link from "next/link";
import { db } from "@/lib/db";
import { refreshBookingStatuses } from "@/lib/booking";
import { requireUser } from "@/lib/session";
import { formatDateTime, formatSEK } from "@/lib/format";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const user = await requireUser();
  await refreshBookingStatuses();

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    orderBy: { startTime: "desc" },
    include: { cart: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Mina bokningar</h1>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <p className="text-muted-foreground">Du har inga bokningar ännu.</p>
            <Button asChild>
              <Link href="/">Boka en golfbil</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/bokningar/${b.id}`} className="block">
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
                  <div>
                    <p className="font-medium">{b.cart.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(b.startTime)} – {formatDateTime(b.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{formatSEK(b.priceAmount)}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
