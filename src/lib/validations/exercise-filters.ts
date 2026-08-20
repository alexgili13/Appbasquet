import { z } from "zod";
import { AGE_STAGES, LEVELS, INTENSITIES } from "@/lib/constants";

const emptyToUndefined = (val: unknown) => (val === "" || val == null ? undefined : val);

export const exerciseFiltersSchema = z.object({
  q: z.preprocess(emptyToUndefined, z.string().trim().max(200).optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  ageStage: z.preprocess(emptyToUndefined, z.enum(AGE_STAGES).optional()),
  level: z.preprocess(emptyToUndefined, z.enum(LEVELS).optional()),
  intensity: z.preprocess(emptyToUndefined, z.enum(INTENSITIES).optional()),
  authorId: z.preprocess(emptyToUndefined, z.string().uuid().optional()),
  maxPlayers: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().max(99).optional(),
  ),
  maxDuration: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().max(240).optional(),
  ),
  material: z.preprocess(emptyToUndefined, z.string().trim().max(150).optional()),
  sort: z.preprocess(
    emptyToUndefined,
    z.enum(["recent", "oldest", "name_asc", "name_desc"]).optional(),
  ),
});

export type ExerciseFiltersInput = z.infer<typeof exerciseFiltersSchema>;

/** Normalitza un valor de searchParams (string | string[] | undefined) al primer valor. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
