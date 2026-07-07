import { db } from "@/lib/db";
import { refreshBookingStatuses } from "@/lib/booking";
import { requireAdmin } from "@/lib/session";
import { formatDateTime, formatSEK, toDatetimeLocalValue } from "@/lib/format";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminCancelBookingAction, markPaidAction } from "../actions";
import { ManualBookingForm } from "./manual-booking-form";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ fel?: string }>;
}) {
  await requireAdmin();
  await refreshBookingStatuses();
  const { fel } = await searchParams;

  const [bookings, users, carts] = await Promise.all([
    db.booking.findMany({
      orderBy: { startTime: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        cart: { select: { name: true } },
      },
    }),
    db.user.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    db.cart.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const suggested = new Date(Math.ceil(Date.now() / 3_600_000) * 3_600_000);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bokningar</h1>

      {fel && (
        <Alert variant="destructive">
          <AlertDescription>{fel}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ny manuell bokning</CardTitle>
          <CardDescription>
            T.ex. för en kund som betalar på plats. Bokningen hamnar i betalkön och markeras
            som betald där.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManualBookingForm users={users} carts={carts} defaultStart={toDatetimeLocalValue(suggested)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alla bokningar (senaste 100)</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Inga bokningar ännu.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referens</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Bil</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Slut</TableHead>
                  <TableHead>Pris</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono">{b.paymentReference}</TableCell>
                    <TableCell>
                      <div>{b.user.name}</div>
                      <div className="text-xs text-muted-foreground">{b.user.email}</div>
                    </TableCell>
                    <TableCell>{b.cart.name}</TableCell>
                    <TableCell>{formatDateTime(b.startTime)}</TableCell>
                    <TableCell>{formatDateTime(b.endTime)}</TableCell>
                    <TableCell>{formatSEK(b.priceAmount)}</TableCell>
                    <TableCell>
                      <BookingStatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(b.status === "AWAITING_PAYMENT" || b.status === "EXPIRED") && (
                          <form action={markPaidAction}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <Button type="submit" size="sm" variant="secondary">
                              Markera betald
                            </Button>
                          </form>
                        )}
                        {(b.status === "AWAITING_PAYMENT" || b.status === "CONFIRMED") && (
                          <form action={adminCancelBookingAction}>
                            <input type="hidden" name="bookingId" value={b.id} />
                            <Button type="submit" size="sm" variant="outline">
                              Avboka
                            </Button>
                          </form>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
