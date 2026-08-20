import { listCategories } from "@/lib/db/queries/categories";
import { ExerciseForm } from "@/components/exercises/exercise-form";
import { createExerciseAction } from "@/lib/actions/exercises";

export default async function NewExercisePage() {
  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Nou exercici</h1>
        <p className="text-sm text-muted-foreground">
          Omple la informació principal; la resta és opcional.
        </p>
      </div>

      <ExerciseForm
        action={createExerciseAction}
        categories={categories}
        submitLabel="Crea l'exercici"
      />
    </div>
  );
}
