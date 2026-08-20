export default function ExerciseFormLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-busy="true" aria-label="Carregant el formulari">
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-md bg-secondary" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-secondary" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
            <div className="h-11 w-full animate-pulse rounded-md bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}
