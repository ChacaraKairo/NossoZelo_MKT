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
const MAX_TENTATIVAS = 10;

function chaveRateLimit(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "ip_desconhecido";
  return `admin_login:${ip}`;
}

function bloquearPorRateLimit(request: Request) {
  const agora = Date.now();
  const chave = chaveRateLimit(request);
  const atual = tentativas.get(chave);

  if (!atual || atual.resetEm <= agora) {
    tentativas.set(chave, { total: 1, resetEm: agora + JANELA_MS });
    return null;
  }

  if (atual.total >= MAX_TENTATIVAS) {
    const retryAfter = Math.ceil((atual.resetEm - agora) / 1000);
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  atual.total += 1;
  tentativas.set(chave, atual);
  return null;
}

export async function POST(request: Request) {
  try {
    const rateLimitResponse = bloquearPorRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const input = LoginSchema.parse(await request.json());
    const admin = await autenticarAdmin(input.login, input.senha);

    if (!admin) {
      return NextResponse.json({ error: "Credenciais invalidas ou usuario sem permissao admin." }, { status: 403 });
    }

    const token = await gerarTokenAdmin(admin);
    const response = NextResponse.json({ message: "Login realizado com sucesso.", admin });
    aplicarCookieSessao(response, token);
    return response;
  } catch (error) {
    return respostaErro(error, "Nao foi possivel autenticar.", 400);
  }
}
