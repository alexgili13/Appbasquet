"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicateExerciseAction } from "@/lib/actions/exercises";

export function DuplicateExerciseButton({ exerciseId }: { exerciseId: string }) {
  return (
    <form action={duplicateExerciseAction.bind(null, exerciseId)}>
      <Button type="submit" variant="outline" size="sm">
        <Copy className="h-4 w-4" />
        Duplicar
      </Button>
    </form>
  );
}
