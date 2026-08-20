import "server-only";
import { and, asc, desc, eq, ilike, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  exercises,
  exerciseTags,
  categories,
  users,
  tags,
  mediaAssets,
  type NewExercise,
} from "@/lib/db/schema";
import type { ExerciseFiltersInput } from "@/lib/validations/exercise-filters";

/** Llistat del repositori amb cerca de text, filtres combinables i ordenació. */
export async function listExercises(filters: ExerciseFiltersInput = {}, limit = 60) {
  const conditions: (SQL | undefined)[] = [];

  if (filters.q) {
    const tagPattern = `%${filters.q}%`;
    conditions.push(
      or(
        sql`${exercises.searchVector} @@ plainto_tsquery('simple', ${filters.q})`,
        inArray(
          exercises.id,
          db
            .select({ id: exerciseTags.exerciseId })
            .from(exerciseTags)
            .innerJoin(tags, eq(exerciseTags.tagId, tags.id))
            .where(ilike(tags.name, tagPattern)),
        ),
      ),
    );
  }

  if (filters.categoryId) conditions.push(eq(exercises.categoryId, filters.categoryId));
  if (filters.ageStage) conditions.push(eq(exercises.ageStage, filters.ageStage));
  if (filters.level) conditions.push(eq(exercises.level, filters.level));
  if (filters.intensity) conditions.push(eq(exercises.intensity, filters.intensity));
  if (filters.authorId) conditions.push(eq(exercises.authorId, filters.authorId));

  // Exercicis sense el camp especificat es consideren "flexibles" i sempre hi surten.
  if (filters.maxPlayers) {
    conditions.push(
      or(isNull(exercises.numPlayers), lte(exercises.numPlayers, filters.maxPlayers)),
    );
  }
  if (filters.maxDuration) {
    conditions.push(
      or(isNull(exercises.durationMinutes), lte(exercises.durationMinutes, filters.maxDuration)),
    );
  }

  if (filters.material) {
    conditions.push(ilike(exercises.material, `%${filters.material}%`));
  }

  const orderBy = (() => {
    switch (filters.sort) {
      case "oldest":
        return asc(exercises.createdAt);
      case "name_asc":
        return asc(exercises.name);
      case "name_desc":
        return desc(exercises.name);
      case "recent":
      default:
        return desc(exercises.createdAt);
    }
  })();

  const validConditions = conditions.filter((c): c is SQL => c !== undefined);

  return db
    .select({
      id: exercises.id,
      name: exercises.name,
      objective: exercises.objective,
      durationMinutes: exercises.durationMinutes,
      numPlayers: exercises.numPlayers,
      createdAt: exercises.createdAt,
      categoryName: categories.name,
      authorName: users.name,
      thumbnailUrl: sql<string | null>`(
        select ${mediaAssets.blobUrl} from ${mediaAssets}
        where ${mediaAssets.exerciseId} = ${exercises.id}
        order by ${mediaAssets.createdAt} asc
        limit 1
      )`,
    })
    .from(exercises)
    .innerJoin(categories, eq(exercises.categoryId, categories.id))
    .innerJoin(users, eq(exercises.authorId, users.id))
    .where(validConditions.length > 0 ? and(...validConditions) : undefined)
    .orderBy(orderBy)
    .limit(limit);
}

export type ExerciseListItem = Awaited<ReturnType<typeof listExercises>>[number];

/** Detall complet d'un exercici amb categoria, autor, tags i media. */
export async function getExerciseDetail(id: string) {
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, id),
    with: {
      category: true,
      author: { columns: { id: true, name: true } },
      exerciseTags: { with: { tag: true } },
      media: true,
    },
  });

  return exercise ?? null;
}

export type ExerciseDetail = NonNullable<
  Awaited<ReturnType<typeof getExerciseDetail>>
>;

export async function insertExercise(
  data: Omit<NewExercise, "id" | "createdAt" | "updatedAt">,
  tagIds: string[],
) {
  const [created] = await db.insert(exercises).values(data).returning();
  if (!created) throw new Error("No s'ha pogut crear l'exercici");

  if (tagIds.length > 0) {
    await db
      .insert(exerciseTags)
      .values(tagIds.map((tagId) => ({ exerciseId: created.id, tagId })));
  }

  return created;
}

export async function updateExerciseById(
  id: string,
  data: Partial<Omit<NewExercise, "id" | "authorId" | "createdAt">>,
  tagIds: string[],
) {
  const [updated] = await db
    .update(exercises)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(exercises.id, id))
    .returning();

  if (!updated) throw new Error("Exercici no trobat");

  // Reemplacem el conjunt d'etiquetes sencer (senzill i suficient per l'MVP)
  await db.delete(exerciseTags).where(eq(exerciseTags.exerciseId, id));
  if (tagIds.length > 0) {
    await db
      .insert(exerciseTags)
      .values(tagIds.map((tagId) => ({ exerciseId: id, tagId })));
  }

  return updated;
}

export async function deleteExerciseById(id: string) {
  await db.delete(exercises).where(eq(exercises.id, id));
}

/** Retorna l'autor d'un exercici, per comprovacions d'autorització. */
export async function getExerciseAuthorId(id: string): Promise<string | null> {
  const [row] = await db
    .select({ authorId: exercises.authorId })
    .from(exercises)
    .where(eq(exercises.id, id))
    .limit(1);
  return row?.authorId ?? null;
}

/** Duplica un exercici (dades + etiquetes, sense media) per al nou autor. */
export async function duplicateExercise(sourceId: string, newAuthorId: string) {
  const source = await getExerciseDetail(sourceId);
  if (!source) throw new Error("Exercici original no trobat");

  const created = await insertExercise(
    {
      name: `${source.name} (còpia)`,
      description: source.description,
      objective: source.objective,
      categoryId: source.categoryId,
      authorId: newAuthorId,
      ageStage: source.ageStage,
      level: source.level,
      numPlayers: source.numPlayers,
      durationMinutes: source.durationMinutes,
      spaceRequired: source.spaceRequired,
      material: source.material,
      intensity: source.intensity,
      numBalls: source.numBalls,
      instructions: source.instructions,
      keyPoints: source.keyPoints,
      commonMistakes: source.commonMistakes,
      variants: source.variants,
      progressions: source.progressions,
      regressions: source.regressions,
      videoUrl: source.videoUrl,
      notes: source.notes,
    },
    source.exerciseTags.map((et) => et.tagId),
  );

  return created;
}

export async function listAllTags() {
  return db.select().from(tags);
}

export async function listMediaForExercise(exerciseId: string) {
  return db.select().from(mediaAssets).where(eq(mediaAssets.exerciseId, exerciseId));
}
