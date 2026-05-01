import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { registrarLogAdministrativo } from "@/lib/adminLog";
import { sincronizarAssinaturasEPrestadores } from "@/lib/assinaturaMonitor";
import { respostaErro } from "@/lib/http";

function cronAutorizado(request: Request) {
  const segredo = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  return Boolean(segredo) && authHeader === `Bearer ${segredo}`;
}

export async function POST() {
  const { admin, response } = await exigirAdminApi();
  if (response) return response;

  try {
    const resultado = await sincronizarAssinaturasEPrestadores();
    await registrarLogAdministrativo({ adminId: admin.id, tabela: "assinaturas" });

    return NextResponse.json({
      message: "Assinaturas e prestadores sincronizados.",
      resultado
    });
  } catch (error) {
    return respostaErro(error);
  }
}

export async function GET(request: Request) {
  if (!cronAutorizado(request)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  try {
    const resultado = await sincronizarAssinaturasEPrestadores();
    return NextResponse.json({
      message: "Sincronizacao automatica concluida.",
      resultado
    });
  } catch (error) {
    return respostaErro(error);
  }
}
