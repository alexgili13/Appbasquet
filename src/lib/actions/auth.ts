"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { loginSchema } from "@/lib/validations/auth";

export type LoginActionState = {
  error?: string;
} | undefined;

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Introdueix un email i contrasenya vàlids." };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email o contrasenya incorrectes." };
    }
    // NextAuth llança un error especial per fer el redirect intern;
    // cal deixar-lo passar perquè funcioni la navegació.
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
