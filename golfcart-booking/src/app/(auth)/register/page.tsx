"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "../actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, {});

  return (
    <Card className="mx-auto mt-8 w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Skapa konto</CardTitle>
        <CardDescription>
          Med ett konto kan du boka golfbilar och se din upplåsningskod.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn</Label>
            <Input id="name" name="name" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-postadress</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobilnummer (för upplåsningskod via SMS)</Label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+46701234567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Lösenord (minst 8 tecken)</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
          </div>
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Skapar konto…" : "Skapa konto"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Har du redan ett konto?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Logga in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
