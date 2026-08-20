import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExerciseListItem } from "@/lib/db/queries/exercises";

export function ExerciseCard({ exercise }: { exercise: ExerciseListItem }) {
  return (
    <Link href={`/exercises/${exercise.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="relative flex h-32 items-center justify-center bg-secondary text-muted-foreground">
          {exercise.thumbnailUrl ? (
            <Image
              src={exercise.thumbnailUrl}
              alt={exercise.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="text-xs">Sense imatge</span>
          )}
        </div>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold leading-snug text-foreground">
              {exercise.name}
            </h3>
            <Badge variant="accent" className="shrink-0">
              {exercise.categoryName}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{exercise.objective}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
            {exercise.durationMinutes && <span>{exercise.durationMinutes} min</span>}
            {exercise.numPlayers && <span>{exercise.numPlayers} jugadors</span>}
            <span className="ml-auto">{exercise.authorName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
