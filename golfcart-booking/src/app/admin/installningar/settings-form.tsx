"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({
  defaults,
}: {
  defaults: { swishPhone: string; priceKr: number; slotMinutes: number; holdMinutes: number };
}) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, {});

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="swishPhone">Swish-nummer (dit kunderna betalar)</Label>
        <Input id="swishPhone" name="swishPhone" defaultValue={defaults.swishPhone} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="priceKr">Pris per pass (kr)</Label>
        <Input id="priceKr" name="priceKr" type="number" min={0} step="1" defaultValue={defaults.priceKr} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slotMinutes">Passlängd (minuter)</Label>
        <Input id="slotMinutes" name="slotMinutes" type="number" min={30} step="15" defaultValue={defaults.slotMinutes} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="holdMinutes">Reservationstid för obetald bokning (minuter)</Label>
        <Input id="holdMinutes" name="holdMinutes" type="number" min={5} step="5" defaultValue={defaults.holdMinutes} required />
      </div>
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.ok && (
        <Alert variant="success">
          <AlertDescription>Inställningarna är sparade.</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Sparar…" : "Spara inställningar"}
      </Button>
    </form>
  );
}
