import { NextRequest, NextResponse } from "next/server";
import { processarWebhookAsaasControlador } from "@/lib/asaasWebhook";

function statusErro(error: unknown) {
  const status = typeof (error as { status?: unknown })?.status === "number"
    ? (error as { status: number }).status
    : 500;

  return status;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const resultado = await processarWebhookAsaasControlador({
      token: request.headers.get("asaas-access-token"),
      payload
    });

    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    const status = statusErro(error);
    const message = error instanceof Error ? error.message : "Erro ao processar webhook Asaas.";

    return NextResponse.json({ error: message }, { status });
  }
}
