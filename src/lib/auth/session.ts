import "server-only";
import { auth } from "@/auth";
import type { Session } from "next-auth";

export class UnauthorizedError extends Error {
  constructor(message = "No has iniciat sessió.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "No tens permisos per fer aquesta acció.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Retorna l'usuari autenticat o llança UnauthorizedError. Fes-la servir a
 *  l'inici de cada Server Action que requereixi sessió. */
export async function requireUser(): Promise<Session["user"]> {
  const session = await auth();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session.user;
}

/** Igual que requireUser, però exigeix rol admin. */
export async function requireAdmin(): Promise<Session["user"]> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new ForbiddenError();
  }
  return user;
}

/** Comprova que l'usuari és l'autor del recurs o admin. */
export function assertOwnerOrAdmin(
  user: Session["user"],
  resourceAuthorId: string,
) {
  if (user.role === "admin") return;
  if (user.id !== resourceAuthorId) {
    throw new ForbiddenError("Només pots modificar els teus propis exercicis.");
  }
}
