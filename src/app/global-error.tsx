"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ca">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-xl font-semibold">S&apos;ha produït un error inesperat</h1>
          <p className="max-w-sm text-sm text-gray-600">
            Torna-ho a provar. Si el problema continua, contacta amb
            l&apos;administrador del club.
          </p>
          <button
            onClick={reset}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            Torna-ho a provar
          </button>
        </div>
      </body>
    </html>
  );
}
