import { NextResponse } from "next/server";
import { limparCookieSessao } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Sessao encerrada." });
  limparCookieSessao(response);
  return response;
}
