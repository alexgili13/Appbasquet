import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">Pàgina no trobada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        L&apos;adreça a la qual has intentat accedir no existeix.
      </p>
      <Link href="/" className="text-accent underline">
        Torna a l&apos;inici
      </Link>
    </main>
  );
}
