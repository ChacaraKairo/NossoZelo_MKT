import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function respostaErro(error: unknown, fallback = "Erro inesperado.", status = 500) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Dados invalidos.", detalhes: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message || fallback }, { status });
  }

  return NextResponse.json({ error: fallback }, { status });
}
