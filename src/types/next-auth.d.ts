import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

export type UserRole = "coach" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

// L'import de JWT més amunt és necessari perquè aquesta augmentació es
// fusioni correctament amb el tipus intern d'Auth.js — sense importar-lo
// explícitament, `next-auth/jwt` es tracta com un mòdul "buit" nou en lloc
// d'ampliar-ne la interfície existent, i camps com token.id acaben com a
// `unknown` a la resta del projecte (problema conegut a la beta d'Auth.js v5).
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
