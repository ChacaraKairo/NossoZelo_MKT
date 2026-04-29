import { NextRequest, NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { listarPrestadores } from "@/lib/queries";
import { mascararDocumento, mascararEmail, mascararTelefone } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const data = await listarPrestadores(request.nextUrl.searchParams);
    return NextResponse.json({
      ...data,
      prestadores: data.prestadores.map((prestador) => ({
        ...prestador,
        email: mascararEmail(prestador.email),
        cpf: mascararDocumento(prestador.cpf),
        telefone: mascararTelefone(prestador.telefone)
      }))
    });
  } catch (error) {
    return respostaErro(error);
  }
}
