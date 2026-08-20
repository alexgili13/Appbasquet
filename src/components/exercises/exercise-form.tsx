"use client";

import { useActionState, useState, cloneElement, isValidElement } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PhotoUploader } from "@/components/media/photo-uploader";
import {
  AGE_STAGE_OPTIONS,
  LEVEL_OPTIONS,
  INTENSITY_OPTIONS,
} from "@/lib/constants";
import type { ExerciseActionState } from "@/lib/actions/exercises";
import type { Category } from "@/lib/db/schema";
import type { ExerciseDetail } from "@/lib/db/queries/exercises";
import type { PendingPhotoInput } from "@/lib/validations/media";

type Action = (
  state: ExerciseActionState,
  formData: FormData,
) => Promise<ExerciseActionState>;

export function ExerciseForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: Action;
  categories: Category[];
  initial?: ExerciseDetail;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState<
    ExerciseActionState,
    FormData
  >(action, undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhotoInput | null>(null);

  const fieldErrors = state?.fieldErrors ?? {};
  const initialTags = initial?.exerciseTags.map((et) => et.tag.name).join(", ") ?? "";


  return (
    <form action={formAction} className="space-y-8 pb-24">
      {state?.error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      {/* Informació principal */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Informació principal
        </h2>

        <Field name="name" label="Nom de l'exercici" error={fieldErrors.name} required>
          <Input defaultValue={initial?.name} required minLength={3} maxLength={150} />
        </Field>

        <Field name="categoryId" label="Categoria" error={fieldErrors.categoryId} required>
          <Select defaultValue={initial?.categoryId ?? ""} required>
            <option value="" disabled>
              Selecciona una categoria
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field name="objective" label="Objectiu" error={fieldErrors.objective} required>
          <Textarea
            defaultValue={initial?.objective}
            required
            minLength={5}
            placeholder="Què treballa aquest exercici?"
          />
        </Field>

        <Field name="description" label="Descripció / explicació" error={fieldErrors.description} required>
          <Textarea
            defaultValue={initial?.description}
            required
            minLength={10}
            rows={5}
            placeholder="Com es fa l'exercici, pas a pas"
          />
        </Field>

        <Field name="tags" label="Etiquetes" error={fieldErrors.tags}>
          <Input
            defaultValue={initialTags}
            placeholder="tir, exterior, jump shot (separades per comes)"
          />
        </Field>

        {!initial && (
          <div className="space-y-1.5">
            <Label>Fotografia (opcional)</Label>
            <PhotoUploader onUploaded={setPendingPhoto} />
            {pendingPhoto && (
              <>
                <input type="hidden" name="photoBlobUrl" value={pendingPhoto.blobUrl} />
                <input type="hidden" name="photoBlobPathname" value={pendingPhoto.blobPathname} />
                {pendingPhoto.width !== undefined && (
                  <input type="hidden" name="photoWidth" value={pendingPhoto.width} />
                )}
                {pendingPhoto.height !== undefined && (
                  <input type="hidden" name="photoHeight" value={pendingPhoto.height} />
                )}
                {pendingPhoto.sizeBytes !== undefined && (
                  <input type="hidden" name="photoSizeBytes" value={pendingPhoto.sizeBytes} />
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* Informació avançada / opcional */}
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          aria-controls="advanced-fields"
          className="text-sm font-semibold uppercase tracking-wide text-accent"
        >
          {showAdvanced ? "Amagar" : "Afegir"} informació avançada (opcional)
        </button>

        {showAdvanced && (
          <div id="advanced-fields" className="space-y-4 rounded-lg border border-border bg-secondary/40 p-4">
            <div className="grid grid-cols-2 gap-4">
              <Field name="ageStage" label="Edat / etapa" error={fieldErrors.ageStage}>
                <Select defaultValue={initial?.ageStage ?? ""}>
                  <option value="">—</option>
                  {AGE_STAGE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field name="level" label="Nivell" error={fieldErrors.level}>
                <Select defaultValue={initial?.level ?? ""}>
                  <option value="">—</option>
                  {LEVEL_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field name="numPlayers" label="Nombre de jugadors" error={fieldErrors.numPlayers}>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  defaultValue={initial?.numPlayers ?? ""}
                />
              </Field>

              <Field name="durationMinutes" label="Durada (minuts)" error={fieldErrors.durationMinutes}>
                <Input
                  type="number"
                  min={1}
                  max={240}
                  defaultValue={initial?.durationMinutes ?? ""}
                />
              </Field>

              <Field name="intensity" label="Intensitat" error={fieldErrors.intensity}>
                <Select defaultValue={initial?.intensity ?? ""}>
                  <option value="">—</option>
                  {INTENSITY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field name="numBalls" label="Nombre de pilotes" error={fieldErrors.numBalls}>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  defaultValue={initial?.numBalls ?? ""}
                />
              </Field>
            </div>

            <Field name="spaceRequired" label="Espai necessari" error={fieldErrors.spaceRequired}>
              <Input defaultValue={initial?.spaceRequired ?? ""} />
            </Field>

            <Field name="material" label="Material" error={fieldErrors.material}>
              <Textarea defaultValue={initial?.material ?? ""} />
            </Field>

            <Field name="instructions" label="Consignes" error={fieldErrors.instructions}>
              <Textarea defaultValue={initial?.instructions ?? ""} />
            </Field>

            <Field name="keyPoints" label="Punts clau de l'entrenador" error={fieldErrors.keyPoints}>
              <Textarea defaultValue={initial?.keyPoints ?? ""} />
            </Field>

            <Field name="commonMistakes" label="Errors habituals" error={fieldErrors.commonMistakes}>
              <Textarea defaultValue={initial?.commonMistakes ?? ""} />
            </Field>

            <Field name="variants" label="Variants" error={fieldErrors.variants}>
              <Textarea defaultValue={initial?.variants ?? ""} />
            </Field>

            <Field name="progressions" label="Progressions" error={fieldErrors.progressions}>
              <Textarea defaultValue={initial?.progressions ?? ""} />
            </Field>

            <Field name="regressions" label="Regressions" error={fieldErrors.regressions}>
              <Textarea defaultValue={initial?.regressions ?? ""} />
            </Field>

            <Field name="videoUrl" label="Vídeo o URL externa" error={fieldErrors.videoUrl}>
              <Input
                type="url"
                placeholder="https://..."
                defaultValue={initial?.videoUrl ?? ""}
              />
            </Field>

            <Field name="notes" label="Notes" error={fieldErrors.notes}>
              <Textarea defaultValue={initial?.notes ?? ""} />
            </Field>
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Desant..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

/** Camp de formulari accessible: enllaça la Label amb el control via
 *  id/htmlFor i afegeix aria-invalid/aria-describedby quan hi ha error. */
function Field({
  name,
  label,
  error,
  required,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const errorId = `${name}-error`;
  const control = isValidElement<{ id?: string; name?: string }>(children)
    ? cloneElement(children, {
        id: name,
        name,
        "aria-invalid": Boolean(error) || undefined,
        "aria-describedby": error ? errorId : undefined,
      } as Record<string, unknown>)
    : children;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>
        {label}
        {required && (
          <span className="text-accent" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </Label>
      {control}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
