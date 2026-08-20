/**
 * Verifica que les variables d'entorn necessàries per a producció existeixen
 * abans de continuar amb el build. Útil com a pas manual previ al deploy, o
 * afegit com a "Build Command" a Vercel: `node scripts/verify-env.mjs && next build`.
 */
const REQUIRED = ["DATABASE_URL", "AUTH_SECRET", "BLOB_READ_WRITE_TOKEN"];

const missing = REQUIRED.filter((key) => !process.env[key] || process.env[key].trim() === "");

if (missing.length > 0) {
  console.error("\n❌ Falten variables d'entorn obligatòries:\n");
  for (const key of missing) console.error(`   - ${key}`);
  console.error(
    "\nConfigura-les a .env (local) o a la configuració del projecte a Vercel abans de continuar.\n",
  );
  process.exit(1);
}

console.log("✅ Totes les variables d'entorn obligatòries estan definides.");
