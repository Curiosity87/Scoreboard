import Link from "next/link";
import { db } from "@/lib/db";
import { getCartsWithAvailability, refreshBookingStatuses } from "@/lib/booking";
import { requireAdmin } from "@/lib/session";
import { formatDateTime, formatSEK, formatTime } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminCancelBookingAction, markPaidAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ fel?: string }>;
}) {
  await requireAdmin();
  await refreshBookingStatuses();
  const { fel } = await searchParams;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [carts, awaiting, revenueThisMonth, confirmedUpcoming] = await Promise.all([
    getCartsWithAvailability(),
    db.booking.findMany({
      where: { status: "AWAITING_PAYMENT" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, phone: true, email: true } }, cart: { select: { name: true } } },
    }),
    db.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    db.booking.findMany({
      where: { status: "CONFIRMED", endTime: { gt: now } },
      orderBy: { startTime: "asc" },
      take: 10,
      include: { user: { select: { name: true } }, cart: { select: { name: true, unlockCode: true } } },
    }),
  ]);

  const rentedNow = carts.filter((c) => c.rentedNow).length;
  const free = carts.filter((c) => !c.rentedNow && c.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {fel && (
        <Alert variant="destructive">
          <AlertDescription>{fel}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uthyrda nu</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{rentedNow}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lediga nu</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{free}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Väntar på betalning</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{awaiting.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Intäkter denna månad</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {formatSEK(revenueThisMonth._sum.amount ?? 0)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Väntar på betalning</CardTitle>
        </CardHeader>
        <CardContent>
          {awaiting.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Inga obetalda bokningar just nu. 🎉
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referens</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Bil</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Belopp</TableHead>
                  <TableHead>Hold till</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awaiting.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono font-semibold">{b.paymentReference}</TableCell>
                    <TableCell>
                      <div>{b.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.user.phone ?? b.user.email}
                      </div>
                    </TableCell>
                    <TableCell>{b.cart.name}</TableCell>
                    <TableCell>{formatDateTime(b.startTime)}</TableCell>
                    <TableCell>{formatSEK(b.priceAmount)}</TableCell>
                    <TableCell>{b.holdExpiresAt ? formatTime(b.holdExpiresAt) : "–"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={markPaidAction}>
                          <input type="hidden" name="bookingId" value={b.id} />
                          <Button type="submit" size="sm">
                            Markera som betald
                          </Button>
                        </form>
                        <form action={adminCancelBookingAction}>
                          <input type="hidden" name="bookingId" value={b.id} />
                          <Button type="submit" size="sm" variant="outline">
                            Avboka
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bekräftade pass (pågående & kommande)</CardTitle>
        </CardHeader>
        <CardContent>
          {confirmedUpcoming.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Inga bekräftade pass framöver.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bil</TableHead>
                  <TableHead>Kund</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Slut</TableHead>
                  <TableHead>Upplåsningskod</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmedUpcoming.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      {b.cart.name}{" "}
                      {b.startTime <= now && <Badge variant="warning">Pågår</Badge>}
                    </TableCell>
                    <TableCell>{b.user.name}</TableCell>
                    <TableCell>{formatDateTime(b.startTime)}</TableCell>
                    <TableCell>{formatDateTime(b.endTime)}</TableCell>
                    <TableCell className="font-mono font-semibold">{b.cart.unlockCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/bokningar">Alla bokningar →</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
