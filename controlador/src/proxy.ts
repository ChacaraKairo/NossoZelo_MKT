import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, validarTokenAdmin } from "@/lib/sessionToken";

const rotasPublicas = ["/login", "/api/auth/login", "/api/webhooks/asaas"];

function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isAsset(pathname)) return NextResponse.next();

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessao = await validarTokenAdmin(token);
  const publica = rotasPublicas.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));

  if (publica) return NextResponse.next();

  if (!sessao) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
