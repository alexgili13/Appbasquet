"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <div>
        <h2 className="text-lg font-semibold text-foreground">S&apos;ha produït un error</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          No hem pogut completar l&apos;acció. Torna-ho a provar; si el
          problema persisteix, avisa l&apos;administrador del club.
        </p>
      </div>
      <Button onClick={reset}>Torna-ho a provar</Button>
    </div>
  );
}
