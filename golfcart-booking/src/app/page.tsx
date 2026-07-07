import Link from "next/link";
import { auth } from "@/auth";
import { getCartsWithAvailability } from "@/lib/booking";
import { getSettings } from "@/lib/settings";
import { formatSEK, formatTime, formatDate, TIME_ZONE } from "@/lib/format";
import { formatInTimeZone } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [carts, settings, session] = await Promise.all([
    getCartsWithAvailability(),
    getSettings(),
    auth(),
  ]);
  const hours = settings.slotMinutes / 60;
  const now = new Date();
  const todayStr = formatInTimeZone(now, TIME_ZONE, "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Våra golfbilar</h1>
        <p className="text-muted-foreground">
          Hyr en Yamaha Drive2 i {Number.isInteger(hours) ? hours : hours.toFixed(1)} timmar för{" "}
          {formatSEK(settings.priceAmount)}. Betala med Swish – du får en kod som låser upp
          nyckelskåpet på bilen.
        </p>
      </div>

      {carts.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Inga bilar är upplagda ännu.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {carts.map((cart) => {
          const inService = cart.status === "MAINTENANCE";
          const availableAgain = cart.availableAgainAt;
          const availableToday =
            availableAgain && formatInTimeZone(availableAgain, TIME_ZONE, "yyyy-MM-dd") === todayStr;
          return (
            <Card key={cart.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cart.name}</CardTitle>
                  {inService ? (
                    <Badge variant="muted">Under service</Badge>
                  ) : cart.rentedNow ? (
                    <Badge variant="warning">Uthyrd</Badge>
                  ) : (
                    <Badge variant="success">Ledig</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{cart.model}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-end gap-3">
                {cart.rentedNow && availableAgain && (
                  <p className="text-sm text-muted-foreground">
                    Tillgänglig igen{" "}
                    {availableToday
                      ? `ca ${formatTime(availableAgain)}`
                      : `${formatDate(availableAgain)} ca ${formatTime(availableAgain)}`}
                  </p>
                )}
                {!inService && (
                  <Button asChild className="w-full">
                    <Link href={session?.user ? `/boka/${cart.id}` : `/login?callbackUrl=/boka/${cart.id}`}>
                      Boka
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
