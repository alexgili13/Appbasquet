"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUserAction, type AdminActionState } from "@/lib/actions/admin";

export function UserForm() {
  const [state, formAction, isPending] = useActionState<AdminActionState, FormData>(
    createUserAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" required minLength={2} maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contrasenya provisional</Label>
          <Input id="password" name="password" type="text" required minLength={8} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">Rol</Label>
          <Select id="role" name="role" defaultValue="coach">
            <option value="coach">Entrenador</option>
            <option value="admin">Administrador</option>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Comparteix aquesta contrasenya amb l&apos;entrenador; podrà iniciar
        sessió i és recomanable que la canviï.
      </p>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-accent" role="status">
          {state.success}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creant..." : "Crea l'usuari"}
      </Button>
    </form>
  );
}
