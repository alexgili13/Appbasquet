import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { getExerciseDetail } from "@/lib/db/queries/exercises";
import { requireUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteExerciseButton } from "@/components/exercises/delete-exercise-button";
import { DuplicateExerciseButton } from "@/components/exercises/duplicate-exercise-button";
import { MediaGallery } from "@/components/media/media-gallery";
import { AGE_STAGE_LABELS, LEVEL_LABELS, INTENSITY_LABELS } from "@/lib/constants";

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exercise, user] = await Promise.all([getExerciseDetail(id), requireUser()]);

  if (!exercise) notFound();

  const canEdit = user.role === "admin" || user.id === exercise.authorId;

  const quickFacts = [
    exercise.ageStage && AGE_STAGE_LABELS[exercise.ageStage],
    exercise.level && LEVEL_LABELS[exercise.level],
    exercise.numPlayers && `${exercise.numPlayers} jugadors`,
    exercise.durationMinutes && `${exercise.durationMinutes} min`,
    exercise.intensity && `Intensitat ${INTENSITY_LABELS[exercise.intensity].toLowerCase()}`,
    exercise.numBalls !== null && exercise.numBalls !== undefined && `${exercise.numBalls} pilotes`,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Tornar al repositori
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="accent">{exercise.category.name}</Badge>
            {exercise.exerciseTags.map((et) => (
              <Badge key={et.tagId} variant="outline">
                {et.tag.name}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-semibold text-foreground">{exercise.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Creat per {exercise.author.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <DuplicateExerciseButton exerciseId={exercise.id} />
          {canEdit && (
            <>
              <Button asChild size="sm">
                <Link href={`/exercises/${exercise.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <DeleteExerciseButton exerciseId={exercise.id} />
            </>
          )}
        </div>
      </div>

      {/* Imatge / dibuix */}
      {exercise.media.length > 0 ? (
        <MediaGallery media={exercise.media} exerciseId={exercise.id} />
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-secondary text-sm text-muted-foreground">
          Sense representació visual encara
        </div>
      )}

      {quickFacts.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg bg-secondary/60 p-4">
          {quickFacts.map((fact) => (
            <span
              key={fact}
              className="rounded-full bg-background px-3 py-1 text-sm text-foreground shadow-sm"
            >
              {fact}
            </span>
          ))}
        </div>
      )}

      <Section title="Objectiu" text={exercise.objective} />
      <Section title="Explicació" text={exercise.description} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Espai necessari" text={exercise.spaceRequired} />
        <Section title="Material" text={exercise.material} />
      </div>

      <Section title="Consignes" text={exercise.instructions} />
      <Section title="Punts clau de l'entrenador" text={exercise.keyPoints} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Variants" text={exercise.variants} />
        <Section title="Progressions" text={exercise.progressions} />
      </div>
      <Section title="Regressions" text={exercise.regressions} />
      <Section title="Errors habituals" text={exercise.commonMistakes} />

      {exercise.videoUrl && (
        <Section
          title="Vídeo"
          text={exercise.videoUrl}
          isLink
        />
      )}

      <Section title="Notes" text={exercise.notes} />
    </div>
  );
}

function Section({
  title,
  text,
  isLink,
}: {
  title: string;
  text: string | null;
  isLink?: boolean;
}) {
  if (!text) return null;

  return (
    <section>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {isLink ? (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-accent underline"
        >
          {text}
        </a>
      ) : (
        <p className="whitespace-pre-line text-foreground">{text}</p>
      )}
    </section>
  );
}
