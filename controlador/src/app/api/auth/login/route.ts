import { NextResponse } from "next/server";
import { z } from "zod";
import { aplicarCookieSessao, autenticarAdmin, gerarTokenAdmin } from "@/lib/auth";
import { respostaErro } from "@/lib/http";

const LoginSchema = z.object({
  login: z.string().min(3),
  senha: z.string().min(1)
});

const tentativas = new Map<string, { total: number; resetEm: number }>();
const JANELA_MS = 15 * 60 * 1000;
const MAX_TENTATIVAS = 5;

function chaveRateLimit(request: Request, login?: string) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "ip_desconhecido";
  const identificador = login?.trim().toLowerCase().slice(0, 120) || "sem_login";
  return `admin_login:${ip}:${identificador}`;
}

function bloquearPorRateLimit(request: Request, login?: string) {
  const agora = Date.now();
  const chave = chaveRateLimit(request, login);
  const atual = tentativas.get(chave);

  if (!atual || atual.resetEm <= agora) {
    return null;
  }

  if (atual.total >= MAX_TENTATIVAS) {
    const retryAfter = Math.ceil((atual.resetEm - agora) / 1000);
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  return null;
}

function registrarFalhaLogin(request: Request, login?: string) {
  const agora = Date.now();
  const chave = chaveRateLimit(request, login);
  const atual = tentativas.get(chave);

  if (!atual || atual.resetEm <= agora) {
    tentativas.set(chave, { total: 1, resetEm: agora + JANELA_MS });
    return;
  }

  atual.total += 1;
  tentativas.set(chave, atual);
}

function limparFalhasLogin(request: Request, login?: string) {
  tentativas.delete(chaveRateLimit(request, login));
}

export async function POST(request: Request) {
  try {
    const input = LoginSchema.parse(await request.json());
    const rateLimitResponse = bloquearPorRateLimit(request, input.login);
    if (rateLimitResponse) return rateLimitResponse;

    const admin = await autenticarAdmin(input.login, input.senha);

    if (!admin) {
      registrarFalhaLogin(request, input.login);
      return NextResponse.json({ error: "Credenciais invalidas." }, { status: 403 });
    }

    limparFalhasLogin(request, input.login);
    const token = await gerarTokenAdmin(admin);
    const response = NextResponse.json({ message: "Login realizado com sucesso.", admin });
    aplicarCookieSessao(response, token);
    return response;
  } catch (error) {
    return respostaErro(error, "Nao foi possivel autenticar.", 400);
  }
}
