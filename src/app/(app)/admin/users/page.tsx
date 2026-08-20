import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listAllUsers } from "@/lib/db/queries/users";
import { UserForm } from "@/components/admin/user-form";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user.role !== "admin") redirect("/");

  const allUsers = await listAllUsers();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Usuaris</h1>
        <p className="text-sm text-muted-foreground">
          Crea comptes per als entrenadors del club — no hi ha registre públic.
        </p>
      </div>

      <UserForm />

      <ul className="divide-y divide-border rounded-lg border border-border">
        {allUsers.map((u) => (
          <li key={u.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-foreground">{u.name}</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
            </div>
            <Badge variant={u.role === "admin" ? "accent" : "secondary"}>
              {u.role === "admin" ? "Administrador" : "Entrenador"}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}
