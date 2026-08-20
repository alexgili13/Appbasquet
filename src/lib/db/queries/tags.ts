import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { tags } from "@/lib/db/schema";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Retorna els ids dels tags donats per nom, creant els que no existeixin. */
export async function getOrCreateTagIds(names: string[]): Promise<string[]> {
  if (names.length === 0) return [];

  const existing = await db.select().from(tags).where(inArray(tags.name, names));
  const existingNames = new Set(existing.map((t) => t.name));
  const missing = names.filter((n) => !existingNames.has(n));

  let created: { id: string; name: string }[] = [];
  if (missing.length > 0) {
    created = await db
      .insert(tags)
      .values(missing.map((name) => ({ name, slug: slugify(name) })))
      .onConflictDoNothing({ target: tags.slug })
      .returning({ id: tags.id, name: tags.name });

    // Si algun conflicte va fer que no es retornés (ja existia amb un altre
    // nom equivalent per slug), recarreguem per assegurar que no en falta cap.
    if (created.length < missing.length) {
      const reload = await db.select().from(tags).where(inArray(tags.name, missing));
      created = reload;
    }
  }

  return [...existing, ...created].map((t) => t.id);
}
