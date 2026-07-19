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

  // Bloqueia mutações administrativas vindas de outra origem antes de consultar sessão.
  if (exigeProtecaoCsrf(pathname, request.method) && !origemPermitida(request)) {
    return bloquearOrigemInvalida();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessao = await validarTokenAdmin(token);

  if (isRotaPublica(pathname)) {
    // Evita que uma sessão ativa volte para a tela de login e reduza clareza operacional.
    if (sessao && pathname === "/login") {
      return aplicarHeadersSeguranca(NextResponse.redirect(new URL("/dashboard", request.url)));
    }

    return aplicarHeadersSeguranca(NextResponse.next());
  }

  if (!sessao) {
    // APIs devem responder JSON; páginas podem redirecionar para preservar a UX do painel.
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
