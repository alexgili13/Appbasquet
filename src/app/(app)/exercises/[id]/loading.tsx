export default function ExerciseDetailLoading() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-6"
      aria-busy="true"
      aria-label="Carregant l'exercici"
    >
      <div className="h-8 w-40 animate-pulse rounded-md bg-secondary" />
      <div className="space-y-3">
        <div className="h-6 w-24 animate-pulse rounded-full bg-secondary" />
        <div className="h-9 w-2/3 animate-pulse rounded-md bg-secondary" />
      </div>
      <div className="h-48 animate-pulse rounded-lg bg-secondary" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-full animate-pulse rounded bg-secondary" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-secondary" />
      </div>
    </div>
  );
}
