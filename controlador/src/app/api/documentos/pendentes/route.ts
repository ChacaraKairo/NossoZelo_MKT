import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { listarDocumentosPendentes } from "@/lib/documentos";
import { respostaErro } from "@/lib/http";

export async function GET() {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const documentos = await listarDocumentosPendentes();
    return NextResponse.json({ documentos });
  } catch (error) {
    return respostaErro(error);
  }
}
