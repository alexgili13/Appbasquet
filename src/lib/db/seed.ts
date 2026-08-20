import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, categories } from "./schema";

const BASE_CATEGORIES = [
  "Tir",
  "Bot",
  "Passada",
  "Finalitzacions",
  "1x1",
  "2x2",
  "3x3",
  "Tàctica individual",
  "Tàctica col·lectiva",
  "Defensa",
  "Rebot",
  "Transició",
  "Contraatac",
  "Escalfament",
  "Condicionament físic",
  "Situacions especials",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@club.cat";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "canvia-aquesta-contrasenya";

  console.log("Creant usuari administrador...");
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await db
    .insert(users)
    .values({
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      role: "admin",
    })
    .onConflictDoNothing({ target: users.email });

  console.log("Creant categories base...");
  for (const name of BASE_CATEGORIES) {
    await db
      .insert(categories)
      .values({ name, slug: slugify(name) })
      .onConflictDoNothing({ target: categories.slug });
  }

  console.log("\nSeed completat.");
  console.log(`  Admin:      ${adminEmail}`);
  console.log(`  Contrasenya: ${adminPassword}`);
  console.log("  ⚠️  Canvia la contrasenya després del primer login.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error executant el seed:", error);
    process.exit(1);
  });
