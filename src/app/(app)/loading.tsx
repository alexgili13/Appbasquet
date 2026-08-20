export default function RepositoryLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Carregant el repositori d'exercicis">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded-md bg-secondary" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-secondary" />
      </div>

      <div className="h-11 w-full animate-pulse rounded-md bg-secondary" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            <div className="h-32 animate-pulse bg-secondary" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-full animate-pulse rounded bg-secondary" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
