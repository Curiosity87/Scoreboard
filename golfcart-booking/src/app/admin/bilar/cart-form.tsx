"use client";

import { useActionState } from "react";
import { saveCartAction } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export interface CartFormValues {
  id?: string;
  name?: string;
  model?: string;
  status?: string;
  unlockCode?: string;
  note?: string | null;
}

export function CartForm({ cart, submitLabel }: { cart?: CartFormValues; submitLabel: string }) {
  const [state, formAction, pending] = useActionState(saveCartAction, {});

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-5 sm:items-end">
      {cart?.id && <input type="hidden" name="cartId" value={cart.id} />}
      <div className="space-y-2">
        <Label htmlFor={`name-${cart?.id ?? "ny"}`}>Namn</Label>
        <Input id={`name-${cart?.id ?? "ny"}`} name="name" defaultValue={cart?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`status-${cart?.id ?? "ny"}`}>Status</Label>
        <Select id={`status-${cart?.id ?? "ny"}`} name="status" defaultValue={cart?.status ?? "ACTIVE"}>
          <option value="ACTIVE">I drift</option>
          <option value="MAINTENANCE">Under service</option>
          <option value="RETIRED">Ur drift</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`unlockCode-${cart?.id ?? "ny"}`}>Låskod</Label>
        <Input
          id={`unlockCode-${cart?.id ?? "ny"}`}
          name="unlockCode"
          defaultValue={cart?.unlockCode}
          required
          className="font-mono"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`note-${cart?.id ?? "ny"}`}>Anteckning</Label>
        <Input id={`note-${cart?.id ?? "ny"}`} name="note" defaultValue={cart?.note ?? ""} />
      </div>
      <input type="hidden" name="model" value={cart?.model ?? "Yamaha Drive2"} />
      <Button type="submit" disabled={pending}>
        {pending ? "Sparar…" : submitLabel}
      </Button>
      {state.error && (
        <Alert variant="destructive" className="sm:col-span-5">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.ok && (
        <Alert variant="success" className="sm:col-span-5">
          <AlertDescription>Sparat.</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
