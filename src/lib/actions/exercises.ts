"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, assertOwnerOrAdmin } from "@/lib/auth/session";
import {
  exerciseFormSchema,
  parseTagsInput,
  type ExerciseFormInput,
} from "@/lib/validations/exercise";
import { getOrCreateTagIds } from "@/lib/db/queries/tags";
import {
  insertExercise,
  updateExerciseById,
  deleteExerciseById,
  getExerciseAuthorId,
  duplicateExercise as duplicateExerciseQuery,
} from "@/lib/db/queries/exercises";

export type ExerciseActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof ExerciseFormInput, string>>;
} | undefined;

function parseFormData(formData: FormData) {
  return exerciseFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    objective: formData.get("objective"),
    categoryId: formData.get("categoryId"),
    ageStage: formData.get("ageStage"),
    level: formData.get("level"),
    numPlayers: formData.get("numPlayers"),
    durationMinutes: formData.get("durationMinutes"),
    spaceRequired: formData.get("spaceRequired"),
    material: formData.get("material"),
    intensity: formData.get("intensity"),
    numBalls: formData.get("numBalls"),
    instructions: formData.get("instructions"),
    keyPoints: formData.get("keyPoints"),
    commonMistakes: formData.get("commonMistakes"),
    variants: formData.get("variants"),
    progressions: formData.get("progressions"),
    regressions: formData.get("regressions"),
    videoUrl: formData.get("videoUrl"),
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  });
}

export async function createExerciseAction(
  _prevState: ExerciseActionState,
  formData: FormData,
): Promise<ExerciseActionState> {
  const user = await requireUser();
  const parsed = parseFormData(formData);

  if (!parsed.success) {
    return {
      error: "Revisa els camps marcats.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const { tags: tagsRaw, ...data } = parsed.data;
  const tagIds = await getOrCreateTagIds(parseTagsInput(tagsRaw));

  const created = await insertExercise({ ...data, authorId: user.id }, tagIds);

  revalidatePath("/");
  redirect(`/exercises/${created.id}`);
}

export async function updateExerciseAction(
  exerciseId: string,
  _prevState: ExerciseActionState,
  formData: FormData,
): Promise<ExerciseActionState> {
  const user = await requireUser();

  const authorId = await getExerciseAuthorId(exerciseId);
  if (!authorId) {
    return { error: "Aquest exercici ja no existeix." };
  }
  assertOwnerOrAdmin(user, authorId);

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      error: "Revisa els camps marcats.",
      fieldErrors: flattenFieldErrors(parsed.error),
    };
  }

  const { tags: tagsRaw, ...data } = parsed.data;
  const tagIds = await getOrCreateTagIds(parseTagsInput(tagsRaw));

  await updateExerciseById(exerciseId, data, tagIds);

  revalidatePath("/");
  revalidatePath(`/exercises/${exerciseId}`);
  redirect(`/exercises/${exerciseId}`);
}

export async function deleteExerciseAction(exerciseId: string) {
  const user = await requireUser();

  const authorId = await getExerciseAuthorId(exerciseId);
  if (!authorId) return;
  assertOwnerOrAdmin(user, authorId);

  await deleteExerciseById(exerciseId);

  revalidatePath("/");
  redirect("/");
}

export async function duplicateExerciseAction(exerciseId: string) {
  const user = await requireUser();

  const created = await duplicateExerciseQuery(exerciseId, user.id);

  revalidatePath("/");
  redirect(`/exercises/${created.id}`);
}

function flattenFieldErrors(
  error: import("zod").ZodError<ExerciseFormInput>,
): Partial<Record<keyof ExerciseFormInput, string>> {
  const result: Partial<Record<keyof ExerciseFormInput, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ExerciseFormInput | undefined;
    if (key && !result[key]) result[key] = issue.message;
  }
  return result;
}
