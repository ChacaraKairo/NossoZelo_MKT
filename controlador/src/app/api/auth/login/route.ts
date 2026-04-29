import { NextResponse } from "next/server";
import { z } from "zod";
import { aplicarCookieSessao, autenticarAdmin, gerarTokenAdmin } from "@/lib/auth";
import { respostaErro } from "@/lib/http";

const LoginSchema = z.object({
  login: z.string().min(3),
  senha: z.string().min(1)
});

export async function POST(request: Request) {
  try {
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
