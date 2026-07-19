import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, validarTokenAdmin } from "@/lib/sessionToken";
import {
  aplicarHeadersSeguranca,
  bloquearOrigemInvalida,
  exigeProtecaoCsrf,
  isAsset,
  isRotaPublica,
  origemPermitida
} from "@/lib/security";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isAsset(pathname)) return aplicarHeadersSeguranca(NextResponse.next());

  if (exigeProtecaoCsrf(pathname, request.method) && !origemPermitida(request)) {
    return bloquearOrigemInvalida();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessao = await validarTokenAdmin(token);

  if (isRotaPublica(pathname)) {
    if (sessao && pathname === "/login") {
      return aplicarHeadersSeguranca(NextResponse.redirect(new URL("/dashboard", request.url)));
    }

    return aplicarHeadersSeguranca(NextResponse.next());
  }

  if (!sessao) {
    if (pathname.startsWith("/api/")) {
      return aplicarHeadersSeguranca(
        NextResponse.json({ error: "Nao autorizado." }, { status: 401 })
      );
    }

    return aplicarHeadersSeguranca(NextResponse.redirect(new URL("/login", request.url)));
  }

  return aplicarHeadersSeguranca(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
