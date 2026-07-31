import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { decidirDocumento } from "@/lib/documentos";
import { respostaErro } from "@/lib/http";

type Params = { params: Promise<{ id: string }> };

async function motivoDaRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    return typeof body?.motivo === "string" ? body.motivo : "";
  }
  const formData = await request.formData();
  return String(formData.get("motivo") || "");
}

export async function POST(request: Request, { params }: Params) {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const { id } = await params;
    await decidirDocumento({
      documentoId: Number(id),
      adminId: admin.id,
      decisao: "recusado",
      motivo: await motivoDaRequest(request)
    });

    const accept = request.headers.get("accept") || "";
    if (accept.includes("text/html")) return NextResponse.redirect(new URL("/documentos", request.url));
    return NextResponse.json({ message: "Documento recusado." });
  } catch (error) {
    return respostaErro(error);
  }
}
