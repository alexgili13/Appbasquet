import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 15 permet executar el middleware en runtime Node.js. auth.ts
// importa bcryptjs i Drizzle, que funcionen bé a Node però no estan
// garantits a Edge — forcem Node per evitar sorpreses de compatibilitat.
export const runtime = "nodejs";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  const isAuthRoute = pathname.startsWith("/login");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

// Exclou rutes internes de Next, l'endpoint d'Auth.js i assets estàtics
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
