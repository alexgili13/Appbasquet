import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listCategories } from "@/lib/db/queries/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";

export default async function AdminCategoriesPage() {
  const session = await auth();
  // El middleware ja bloqueja /admin/* a no-admins; això és defensa en
  // profunditat per si mai s'hi arriba d'una altra manera.
  if (session?.user.role !== "admin") redirect("/");

  const categories = await listCategories();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona les categories disponibles per classificar exercicis.
        </p>
      </div>

      <CategoryForm />

      <ul className="divide-y divide-border rounded-lg border border-border">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-foreground">{c.name}</span>
            <DeleteCategoryButton categoryId={c.id} categoryName={c.name} />
          </li>
        ))}
        {categories.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Encara no hi ha cap categoria.
          </li>
        )}
      </ul>
    </div>
  );
}
