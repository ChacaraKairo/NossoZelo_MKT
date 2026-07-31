import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { obterDocumento } from "@/lib/documentos";
import { respostaErro } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    const documento = await obterDocumento(Number(id));
    if (!documento) return NextResponse.json({ error: "Documento nao encontrado." }, { status: 404 });
    return NextResponse.json({ documento });
  } catch (error) {
    return respostaErro(error);
  }
}
