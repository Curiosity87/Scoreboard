import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartForm } from "./cart-form";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "warning" | "muted" }> = {
  ACTIVE: { label: "I drift", variant: "success" },
  MAINTENANCE: { label: "Under service", variant: "warning" },
  RETIRED: { label: "Ur drift", variant: "muted" },
};

export default async function AdminCartsPage() {
  await requireAdmin();
  const carts = await db.cart.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Bilar</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lägg till bil</CardTitle>
          <CardDescription>Låskoden är koden till bilens nyckelskåp.</CardDescription>
        </CardHeader>
        <CardContent>
          <CartForm submitLabel="Lägg till" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Befintliga bilar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {carts.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">Inga bilar upplagda ännu.</p>
          )}
          {carts.map((cart, i) => {
            const status = STATUS_LABEL[cart.status];
            return (
              <div key={cart.id} className="space-y-3">
                {i > 0 && <Separator />}
                <div className="flex items-center gap-2 pt-2">
                  <span className="font-medium">{cart.name}</span>
                  <span className="text-sm text-muted-foreground">{cart.model}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <CartForm cart={cart} submitLabel="Spara" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
