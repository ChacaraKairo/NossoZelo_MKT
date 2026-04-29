import { NextRequest, NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { listarUsuarios } from "@/lib/queries";
import { mascararDocumento, mascararEmail, mascararTelefone } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const data = await listarUsuarios(request.nextUrl.searchParams);
    return NextResponse.json({
      ...data,
      usuarios: data.usuarios.map((usuario) => ({
        ...usuario,
        email: mascararEmail(usuario.email),
        cpf: mascararDocumento(usuario.cpf),
        telefone: mascararTelefone(usuario.telefone)
      }))
    });
  } catch (error) {
    return respostaErro(error);
  }
}
