"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { categories, users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { createUserSchema } from "@/lib/validations/user";

export type AdminActionState = { error?: string; success?: string } | undefined;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategoryAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const name = (formData.get("name") as string | null)?.trim();
  if (!name || name.length < 2) {
    return { error: "Introdueix un nom de categoria vàlid." };
  }

  try {
    await db.insert(categories).values({ name, slug: slugify(name) });
  } catch {
    return { error: "Ja existeix una categoria amb aquest nom." };
  }

  revalidatePath("/admin/categories");
  return { success: "Categoria creada." };
}

/** Retorna un error si l'eliminació falla (p. ex. hi ha exercicis que en depenen). */
export async function deleteCategoryAction(categoryId: string): Promise<AdminActionState> {
  await requireAdmin();

  try {
    await db.delete(categories).where(eq(categories.id, categoryId));
  } catch {
    return {
      error: "No es pot eliminar: hi ha exercicis que fan servir aquesta categoria.",
    };
  }

  revalidatePath("/admin/categories");
  return undefined;
}

export async function createUserAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dades no vàlides." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    await db.insert(users).values({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    });
  } catch {
    return { error: "Ja existeix un usuari amb aquest email." };
  }

  revalidatePath("/admin/users");
  return { success: "Usuari creat." };
}
