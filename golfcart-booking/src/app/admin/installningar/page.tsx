import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Inställningar</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bokning & betalning</CardTitle>
          <CardDescription>
            Ändringar gäller nya bokningar. Redan skapade bokningar behåller sitt pris.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm
            defaults={{
              swishPhone: settings.swishPhone,
              priceKr: settings.priceAmount / 100,
              slotMinutes: settings.slotMinutes,
              holdMinutes: settings.holdMinutes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
