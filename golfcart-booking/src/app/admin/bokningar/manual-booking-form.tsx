"use client";

import { useActionState } from "react";
import { adminCreateBookingAction } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function ManualBookingForm({
  users,
  carts,
  defaultStart,
}: {
  users: { id: string; name: string; email: string }[];
  carts: { id: string; name: string }[];
  defaultStart: string;
}) {
  const [state, formAction, pending] = useActionState(adminCreateBookingAction, {});

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-4 sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="userId">Kund</Label>
        <Select id="userId" name="userId" required defaultValue="">
          <option value="" disabled>
            Välj kund…
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cartId">Bil</Label>
        <Select id="cartId" name="cartId" required defaultValue="">
          <option value="" disabled>
            Välj bil…
          </option>
          {carts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="startTime">Starttid</Label>
        <Input id="startTime" name="startTime" type="datetime-local" defaultValue={defaultStart} required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Skapar…" : "Skapa bokning"}
      </Button>
      {state.error && (
        <Alert variant="destructive" className="sm:col-span-4">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state.ok && (
        <Alert variant="success" className="sm:col-span-4">
          <AlertDescription>
            Bokningen skapades (väntar på betalning). Markera den som betald i kön när kunden
            betalat.
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
