import { notFound, redirect } from "next/navigation";
import { getExerciseDetail } from "@/lib/db/queries/exercises";
import { listCategories } from "@/lib/db/queries/categories";
import { requireUser } from "@/lib/auth/session";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { MediaManager } from "@/components/exercises/media-manager";
import { updateExerciseAction } from "@/lib/actions/exercises";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exercise, categories, user] = await Promise.all([
    getExerciseDetail(id),
    listCategories(),
    requireUser(),
  ]);

  if (!exercise) notFound();

  const canEdit = user.role === "admin" || user.id === exercise.authorId;
  if (!canEdit) redirect(`/exercises/${id}`);

  const boundAction = updateExerciseAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Edita l&apos;exercici</h1>
        <p className="text-sm text-muted-foreground">{exercise.name}</p>
      </div>

      <ExerciseForm
        action={boundAction}
        categories={categories}
        initial={exercise}
        submitLabel="Desa els canvis"
      />

      <section className="space-y-3 border-t border-border pt-8">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Fotografies i dibuix
          </h2>
          <p className="text-sm text-muted-foreground">
            Afegeix una representació visual de l&apos;exercici.
          </p>
        </div>
        <MediaManager exerciseId={exercise.id} media={exercise.media} />
      </section>
    </div>
  );
}
