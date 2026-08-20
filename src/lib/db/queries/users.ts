import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function listCoaches() {
  return db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(asc(users.name));
}

/** Llistat complet per al panell d'administració d'usuaris. */
export async function listAllUsers() {
  return db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .orderBy(asc(users.name));
}
