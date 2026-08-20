import Link from "next/link";
import { listExercises } from "@/lib/db/queries/exercises";
import { listCategories } from "@/lib/db/queries/categories";
import { listCoaches } from "@/lib/db/queries/users";
import { exerciseFiltersSchema, firstParam } from "@/lib/validations/exercise-filters";
import { ExerciseCard } from "@/components/exercises/exercise-card";
import { ExerciseFilters } from "@/components/exercises/exercise-filters";
import { Button } from "@/components/ui/button";

type RawSearchParams = Record<string, string | string[] | undefined>;

export default async function RepositoryPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const rawParams = await searchParams;

  const parsed = exerciseFiltersSchema.safeParse({
    q: firstParam(rawParams.q),
    categoryId: firstParam(rawParams.categoryId),
    ageStage: firstParam(rawParams.ageStage),
    level: firstParam(rawParams.level),
    intensity: firstParam(rawParams.intensity),
    authorId: firstParam(rawParams.authorId),
    maxPlayers: firstParam(rawParams.maxPlayers),
    maxDuration: firstParam(rawParams.maxDuration),
    material: firstParam(rawParams.material),
    sort: firstParam(rawParams.sort),
  });

  // Si algun paràmetre no és vàlid (p.ex. un uuid manipulat a mà a la URL),
  // simplement l'ignorem en lloc de trencar la pàgina.
  const filters = parsed.success ? parsed.data : {};
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  const [exercises, categories, coaches] = await Promise.all([
    listExercises(filters),
    listCategories(),
    listCoaches(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Repositori d&apos;exercicis</h1>
        <p className="text-sm text-muted-foreground">
          Troba ràpidament exercicis per preparar el teu entrenament.
        </p>
      </div>

      <ExerciseFilters
        filters={filters}
        categories={categories}
        coaches={coaches}
        hasActiveFilters={hasActiveFilters}
      />

      {exercises.length === 0 ? (
        <EmptyState hasActiveFilters={hasActiveFilters} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {exercises.length} exercici{exercises.length !== 1 && "s"} trobat
            {exercises.length !== 1 && "s"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Cap exercici coincideix amb la cerca
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Prova de canviar o eliminar algun filtre.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Neteja els filtres</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
      <h2 className="text-lg font-semibold text-foreground">Encara no hi ha exercicis</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Crea el primer exercici del repositori del club per començar a
        compartir coneixement entre entrenadors.
      </p>
      <Button asChild>
        <Link href="/exercises/new">Crea el primer exercici</Link>
      </Button>
    </div>
  );
}
