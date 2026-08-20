import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
      <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          No hem trobat el que buscaves
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Potser l&apos;exercici s&apos;ha eliminat o l&apos;enllaç no és correcte.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Torna al repositori</Link>
      </Button>
    </div>
  );
}
