"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCategoryAction, type AdminActionState } from "@/lib/actions/admin";

export function CategoryForm() {
  const [state, formAction, isPending] = useActionState<AdminActionState, FormData>(
    createCategoryAction,
    undefined,
  );

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex gap-2">
        <Input name="name" placeholder="Nova categoria" required minLength={2} maxLength={80} />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creant..." : "Afegeix"}
        </Button>
      </form>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
