import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Kräver inloggad användare – annars redirect till /login. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/**
 * Kräver ADMIN-roll. Anropas i VARJE admin-sida och admin-action
 * (server-side skydd, aldrig bara i UI:t).
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}
