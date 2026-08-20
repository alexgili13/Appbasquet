# Repositori d'Exercicis — Club de Bàsquet

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui · Drizzle ORM ·
Neon PostgreSQL · Auth.js · Vercel Blob · Fabric.js

## Setup local

1. **Instal·la dependències**

   ```bash
   npm install
   ```

2. **Crea una base de dades a [Neon](https://neon.tech)** i copia la
   connection string.

3. **Variables d'entorn**

   ```bash
   cp .env.example .env
   ```

   Omple `DATABASE_URL`. Genera `AUTH_SECRET` amb:

   ```bash
   npx auth secret
   ```

4. **Aplica el schema a la base de dades**

   ```bash
   npm run db:generate   # genera els fitxers de migració a partir del schema
   npm run db:migrate    # els aplica a Neon
   ```

5. **Seed inicial** (crea un usuari admin i les categories base)

   ```bash
   npm run db:seed
   ```

   Per defecte crea `admin@club.cat` / `canvia-aquesta-contrasenya`.
   Personalitza-ho amb `SEED_ADMIN_EMAIL` i `SEED_ADMIN_PASSWORD` a `.env`
   abans d'executar-lo, i **canvia la contrasenya després del primer
   login** (la gestió d'usuaris des de l'admin arriba a la Fase 4).

6. **Vercel Blob** (per a fotos i dibuixos, Fase 6): crea un Blob store
   des del dashboard de Vercel i copia el token a `BLOB_READ_WRITE_TOKEN`.
   En local, si el projecte està linkat amb `vercel link`, pots fer
   `vercel env pull` per baixar-lo automàticament.

7. **Engega el servidor de desenvolupament**

   ```bash
   npm run dev
   ```

## Desplegament a producció (Vercel + Neon)

### 1. Base de dades (Neon)

1. Crea un projecte a [neon.tech](https://neon.tech) (regió propera a on
   desplegaràs a Vercel, per minimitzar latència).
2. Copia la **pooled connection string** (la que inclou `-pooler` al host)
   — és la que cal fer servir des d'un entorn serverless com Vercel.
3. Aplica el schema **abans o just després del primer deploy**, des del teu
   ordinador, apuntant a la BD de producció:

   ```bash
   DATABASE_URL="<connection-string-de-producció>" npm run db:generate
   DATABASE_URL="<connection-string-de-producció>" npm run db:migrate
   DATABASE_URL="<connection-string-de-producció>" npm run db:seed
   ```

   **Decisió important**: les migracions **no** s'executen automàticament
   dins del build de Vercel (`npm run build`). Fer-ho seria còmode, però és
   arriscat per dos motius: (1) cada *preview deployment* d'una branca
   correria migracions contra la mateixa BD si comparteix `DATABASE_URL`, i
   (2) builds concurrents podrien disparar la migració dues vegades a la
   vegada. Per l'escala d'aquest projecte, aplicar-les manualment (o des
   d'un pas de CI separat, no implementat en aquest MVP) és més segur.

### 2. Emmagatzematge (Vercel Blob)

1. Al dashboard del projecte a Vercel: **Storage → Create → Blob**.
2. Un cop creat, Vercel afegeix `BLOB_READ_WRITE_TOKEN` automàticament als
   Environment Variables del projecte — no cal copiar-lo a mà si el store
   es crea des del mateix projecte.

### 3. Variables d'entorn a Vercel

Al dashboard del projecte → **Settings → Environment Variables**, configura
com a mínim per a l'entorn de producció:

| Variable | Origen |
|---|---|
| `DATABASE_URL` | Connection string pooled de Neon |
| `AUTH_SECRET` | Genera amb `npx auth secret` |
| `BLOB_READ_WRITE_TOKEN` | Automàtic en crear el Blob store al projecte |
| `NEXTAUTH_URL` | URL de producció (p. ex. `https://exercicis.elteuclub.cat`) |

`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` només calen localment quan
executes `npm run db:seed` contra producció — no cal desar-les a Vercel.

### 4. Primer desplegament

1. Puja el repositori a GitHub (o GitLab/Bitbucket).
2. **Import Project** a Vercel — detecta Next.js automàticament, no calen
   configuracions addicionals de build.
3. Desplega. Un cop el domini és actiu, aplica les migracions i el seed
   contra la BD de producció (pas 1) si encara no ho has fet.
4. Verifica manualment els criteris d'acceptació (secció següent).

### 5. Comprovació ràpida abans de cada desplegament

```bash
npm run typecheck
npm run lint
npm run verify-env   # comprova que no falta cap variable d'entorn (usa .env local)
npm run build
```

## Criteris d'acceptació — estat

Contra la llista de la secció 23 del brief original:

- [x] Login, repositori, cerca, filtres, detall, creació, edició, eliminació — implementats i revisats al codi
- [x] Pujar fotografia i crear/guardar un dibuix — implementats (Fase 6)
- [x] Gestió de categories i usuaris per l'admin — `/admin/categories` (crear/eliminar) i `/admin/users` (crear, amb rol)
- [x] Fitxers no emmagatzemats a PostgreSQL — a Vercel Blob, només referències a la BD
- [x] Responsive i mobile-first — Tailwind amb breakpoints, formularis pensats per mòbil
- [x] Autorització per rol i propietat — verificada a totes les Server Actions, no només al frontend
- [ ] **Verificat contra Neon/Vercel reals** — tot el codi s'ha escrit sense accés a xarxa en aquest entorn; cal el primer `npm install` + `npm run typecheck` + prova manual per confirmar-ho al 100%

## Estructura

```
src/
  app/
    (auth)/login/          rutes públiques d'autenticació
    (app)/                 rutes protegides (repositori, exercicis, admin)
  components/
    exercises/              cards, formularis, filtres
    drawing/                editor de dibuix (Fabric.js)
    ui/                     components shadcn/ui
  lib/
    db/                     schema Drizzle, connexió, migracions
    auth/                   configuració Auth.js
    validations/            schemas Zod
    actions/                Server Actions (mutacions)
  types/
```

## Estat actual

- [x] Fase 1 — Anàlisi i arquitectura
- [x] Fase 2 — Setup (Next.js, TypeScript, Tailwind, shadcn, Drizzle, Neon)
- [x] Fase 3 — Base de dades + Auth (Auth.js, rols, middleware, seed)
- [x] Fase 4 — CRUD d'exercicis (crear, editar, eliminar, detall, duplicar)
- [x] Fase 5 — Cerca (text + tags), filtres combinables i ordenació
- [x] Fase 6 — Media: fotografies (Vercel Blob) + dibuix digital (Fabric.js)
- [x] Fase 7 — Poliment (loading/error/404, accessibilitat, seguretat, contrast)
- [x] Fase 8 — Deployment (checklist Neon + Vercel Blob + env vars + migracions)

## Poliment (Fase 7)

- **Loading states**: `loading.tsx` per repositori, detall i formularis (skeletons)
- **Error boundaries**: `error.tsx` dins de l'app (amb reintent), `global-error.tsx`
  arrel, `not-found.tsx` propi (manté la navegació visible) i un 404 arrel genèric
- **Accessibilitat**: labels enllaçats amb `htmlFor`/`id` a tots els formularis,
  `aria-label` als botons només-icona, `aria-invalid`/`aria-describedby` als
  camps amb error, skip-link al contingut principal, contrast de l'accent
  ajustat per complir WCAG AA en text
- **Seguretat**: capçaleres HTTP bàsiques (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`), `robots: noindex` (eina interna),
  middleware forçat a runtime Node.js per evitar incompatibilitats amb
  bcryptjs/Drizzle a Edge
- **Performance**: index GIN/btree ja definits des de la Fase 2; llistat
  limitat a 60 resultats (sense paginació — suficient per l'MVP, revisar si
  el repositori creix molt)
