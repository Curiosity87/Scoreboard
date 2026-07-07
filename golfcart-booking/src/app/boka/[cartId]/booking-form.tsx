"use client";

import { useActionState } from "react";
import { createBookingAction } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BookingForm({
  cartId,
  defaultStart,
  minStart,
}: {
  cartId: string;
  defaultStart: string;
  minStart: string;
}) {
  const [state, formAction, pending] = useActionState(createBookingAction, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="cartId" value={cartId} />
      <div className="space-y-2">
        <Label htmlFor="startTime">Starttid</Label>
        <Input
          id="startTime"
          name="startTime"
          type="datetime-local"
          defaultValue={defaultStart}
          min={minStart}
          required
        />
      </div>
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Bokar…" : "Boka och visa Swish-instruktioner"}
      </Button>
    </form>
  );
}
