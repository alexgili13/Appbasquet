import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  AGE_STAGE_OPTIONS,
  LEVEL_OPTIONS,
  INTENSITY_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/constants";
import type { Category } from "@/lib/db/schema";
import type { ExerciseFiltersInput } from "@/lib/validations/exercise-filters";

export function ExerciseFilters({
  filters,
  categories,
  coaches,
  hasActiveFilters,
}: {
  filters: ExerciseFiltersInput;
  categories: Category[];
  coaches: { id: string; name: string }[];
  hasActiveFilters: boolean;
}) {
  return (
    <form method="GET" action="/" className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Cerca per nom, descripció, objectiu, consignes o etiquetes..."
          className="pl-9"
        />
      </div>

      <details className="group rounded-lg border border-border" open={hasActiveFilters}>
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">
          Filtres i ordenació
          {hasActiveFilters && <span className="ml-2 text-accent">· actius</span>}
        </summary>

        <div className="grid grid-cols-1 gap-3 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <FilterField label="Categoria">
            <Select name="categoryId" defaultValue={filters.categoryId ?? ""}>
              <option value="">Totes</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FilterField>

          <FilterField label="Edat / etapa">
            <Select name="ageStage" defaultValue={filters.ageStage ?? ""}>
              <option value="">Totes</option>
              {AGE_STAGE_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FilterField>

          <FilterField label="Nivell">
            <Select name="level" defaultValue={filters.level ?? ""}>
              <option value="">Tots</option>
              {LEVEL_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FilterField>

          <FilterField label="Intensitat">
            <Select name="intensity" defaultValue={filters.intensity ?? ""}>
              <option value="">Totes</option>
              {INTENSITY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FilterField>

          <FilterField label="Autor">
            <Select name="authorId" defaultValue={filters.authorId ?? ""}>
              <option value="">Tots</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FilterField>

          <FilterField label="Màxim de jugadors disponibles">
            <Input
              name="maxPlayers"
              type="number"
              min={1}
              max={99}
              defaultValue={filters.maxPlayers ?? ""}
              placeholder="p. ex. 10"
            />
          </FilterField>

          <FilterField label="Durada màxima (min)">
            <Input
              name="maxDuration"
              type="number"
              min={1}
              max={240}
              defaultValue={filters.maxDuration ?? ""}
              placeholder="p. ex. 20"
            />
          </FilterField>

          <FilterField label="Material">
            <Input
              name="material"
              defaultValue={filters.material ?? ""}
              placeholder="p. ex. cons"
            />
          </FilterField>

          <FilterField label="Ordena per">
            <Select name="sort" defaultValue={filters.sort ?? "recent"}>
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FilterField>
        </div>

        <div className="flex justify-end gap-2 border-t border-border p-4">
          {hasActiveFilters && (
            <Button asChild variant="ghost" size="sm">
              <Link href="/">
                <X className="h-4 w-4" />
                Neteja els filtres
              </Link>
            </Button>
          )}
          <Button type="submit" size="sm">
            Aplica
          </Button>
        </div>
      </details>
    </form>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="block font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
