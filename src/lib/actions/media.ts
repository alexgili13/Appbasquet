"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";
import { requireUser, assertOwnerOrAdmin } from "@/lib/auth/session";
import { attachMediaSchema } from "@/lib/validations/media";
import { getExerciseAuthorId } from "@/lib/db/queries/exercises";

export type AttachMediaState = { error?: string } | undefined;

/** Crida's directament des d'un Client Component un cop l'upload a Blob ha
 *  acabat — desa només la referència (URL, mides, etc.) a la base de dades. */
export async function attachMediaAction(input: unknown): Promise<AttachMediaState> {
  const user = await requireUser();

  const parsed = attachMediaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dades de la imatge no vàlides." };
  }

  const authorId = await getExerciseAuthorId(parsed.data.exerciseId);
  if (!authorId) {
    return { error: "Aquest exercici ja no existeix." };
  }
  assertOwnerOrAdmin(user, authorId);

  await db.insert(mediaAssets).values(parsed.data);

  revalidatePath(`/exercises/${parsed.data.exerciseId}`);
  revalidatePath(`/exercises/${parsed.data.exerciseId}/edit`);

  return undefined;
}

export async function deleteMediaAction(mediaId: string, exerciseId: string) {
  const user = await requireUser();

  const authorId = await getExerciseAuthorId(exerciseId);
  if (!authorId) return;
  assertOwnerOrAdmin(user, authorId);

  const [media] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, mediaId))
    .limit(1);

  if (!media || media.exerciseId !== exerciseId) return;

  try {
    await del(media.blobUrl);
  } catch {
    // Si el blob ja no existeix a l'storage, igualment netegem la fila.
  }

  await db.delete(mediaAssets).where(eq(mediaAssets.id, mediaId));

  revalidatePath(`/exercises/${exerciseId}`);
  revalidatePath(`/exercises/${exerciseId}/edit`);
}
