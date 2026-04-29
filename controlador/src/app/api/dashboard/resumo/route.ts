import { NextResponse } from "next/server";
import { exigirAdminApi } from "@/lib/auth";
import { respostaErro } from "@/lib/http";
import { obterResumoDashboard } from "@/lib/queries";

export async function GET() {
  const { response } = await exigirAdminApi();
  if (response) return response;

  try {
    return NextResponse.json(await obterResumoDashboard());
  } catch (error) {
    return respostaErro(error);
  }
}
