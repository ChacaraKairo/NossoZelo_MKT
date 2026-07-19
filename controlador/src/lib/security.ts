import { NextRequest, NextResponse } from "next/server";

const METODOS_MUTAVEIS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const ROTAS_PUBLICAS = ["/login", "/api/auth/login", "/api/webhooks/asaas"];
const ROTAS_SEM_CSRF = ["/api/webhooks/asaas", "/api/assinaturas/sincronizar"];

function normalizarOrigem(valor?: string | null) {
  if (!valor) return null;

  try {
    return new URL(valor).origin;
  } catch {
    return null;
  }
}

function origensConfiguradas(request: NextRequest) {
  const origens = new Set<string>([request.nextUrl.origin]);
  const origemControlador = normalizarOrigem(process.env.CONTROLADOR_PUBLIC_URL);
  const origemVercel = process.env.VERCEL_URL
    ? normalizarOrigem(`https://${process.env.VERCEL_URL}`)
    : null;

  if (origemControlador) origens.add(origemControlador);
  if (origemVercel) origens.add(origemVercel);

  for (const item of (process.env.ADMIN_ALLOWED_ORIGINS || "").split(",")) {
    const origem = normalizarOrigem(item.trim());
    if (origem) origens.add(origem);
  }

  return origens;
}

export function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  );
}

export function isRotaPublica(pathname: string) {
  return ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export function exigeProtecaoCsrf(pathname: string, method: string) {
  if (!METODOS_MUTAVEIS.has(method.toUpperCase())) return false;
  return !ROTAS_SEM_CSRF.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export function origemPermitida(request: NextRequest) {
  const origem = normalizarOrigem(request.headers.get("origin"));
  const referer = normalizarOrigem(request.headers.get("referer"));
  const permitidas = origensConfiguradas(request);

  if (origem) return permitidas.has(origem);
  if (referer) return permitidas.has(referer);

  return process.env.NODE_ENV !== "production";
}

export function aplicarHeadersSeguranca(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "same-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'; base-uri 'self'; form-action 'self'");

  return response;
}

export function bloquearOrigemInvalida() {
  return aplicarHeadersSeguranca(
    NextResponse.json({ error: "Origem da requisicao nao permitida." }, { status: 403 })
  );
}
