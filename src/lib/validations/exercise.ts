import { z } from "zod";
import { AGE_STAGES, LEVELS, INTENSITIES } from "@/lib/constants";

const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndefined, z.enum(values as unknown as [T[number], ...T[number][]]).optional());

const optionalInt = (max: number) =>
  z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().max(max).optional(),
  );

const optionalText = (max?: number) =>
  z.preprocess(
    emptyToUndefined,
    max ? z.string().trim().max(max).optional() : z.string().trim().optional(),
  );

export const exerciseFormSchema = z.object({
  // Obligatoris
  name: z.string().trim().min(3, "El nom ha de tenir almenys 3 caràcters").max(150),
  description: z.string().trim().min(10, "Descriu l'exercici amb una mica més de detall"),
  objective: z.string().trim().min(5, "Indica l'objectiu de l'exercici"),
  categoryId: z.string().uuid("Selecciona una categoria"),

  // Opcionals
  ageStage: optionalEnum(AGE_STAGES),
  level: optionalEnum(LEVELS),
  numPlayers: optionalInt(99),
  durationMinutes: optionalInt(240),
  spaceRequired: optionalText(150),
  material: optionalText(),
  intensity: optionalEnum(INTENSITIES),
  numBalls: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().nonnegative().max(50).optional(),
  ),
  instructions: optionalText(),
  keyPoints: optionalText(),
  commonMistakes: optionalText(),
  variants: optionalText(),
  progressions: optionalText(),
  regressions: optionalText(),
  videoUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url("Introdueix una URL vàlida").max(500).optional(),
  ),
  notes: optionalText(),

  // Etiquetes separades per comes, p.ex. "tir, exterior, jump shot"
  tags: optionalText(500),
});

export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>;

export function parseTagsInput(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 60),
    ),
  );
}
