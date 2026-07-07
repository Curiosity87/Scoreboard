"use server";

import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export interface AuthFormState {
  error?: string;
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: String(formData.get("callbackUrl") || "/"),
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Fel e-postadress eller lösenord." };
    }
    // signIn avslutar med en intern redirect som måste släppas igenom.
    throw e;
  }
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, phone, password } = parsed.data;

  try {
    await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash: await bcrypt.hash(password, 12),
        role: "CUSTOMER",
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Det finns redan ett konto med den e-postadressen." };
    }
    throw e;
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Kontot skapades men inloggningen misslyckades. Logga in manuellt." };
    }
    throw e;
  }
}
