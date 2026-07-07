import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Golfbilsuthyrning",
  description: "Boka och hyr Yamaha Drive2 golfbilar",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="sv">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
            <Link href="/" className="font-semibold tracking-tight">
              🏌️ Golfbilar
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Bilar</Link>
              </Button>
              {user && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/bokningar">Mina bokningar</Link>
                </Button>
              )}
              {user?.role === "ADMIN" && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              {user ? (
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <Button type="submit" variant="outline" size="sm">
                    Logga ut
                  </Button>
                </form>
              ) : (
                <Button asChild size="sm">
                  <Link href="/login">Logga in</Link>
                </Button>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
