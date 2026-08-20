import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

if (!session?.user) {
  redirect("/login");
}

const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Vés al contingut principal
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link href="/" className="font-semibold text-foreground">
            Repositori d&apos;Exercicis
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="accent">
              <Link href="/exercises/new">
                <PlusCircle className="h-4 w-4" />
                Nou exercici
              </Link>
            </Button>

            {user.role === "admin" && (
              <>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/admin/categories">Categories</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/admin/users">Usuaris</Link>
                </Button>
              </>
            )}

            <form action={logoutAction}>
              <Button type="submit" size="sm" variant="ghost">
                Surt
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main id="main-content" className="container py-6">{children}</main>
    </div>
  );
}
