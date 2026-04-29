import type { logs_acao_acao } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type RegistrarLogInput = {
  adminId: string;
  tabela: string;
  acao?: logs_acao_acao;
};

export async function registrarLogAdministrativo({
  adminId,
  tabela,
  acao = "UPDATE"
}: RegistrarLogInput) {
  try {
    await prisma.logs_acao.create({
      data: {
        usuario_id: adminId,
        tabela_afetada: tabela,
        acao
      }
    });
  } catch {
    // O log administrativo nao deve impedir a acao principal.
  }
}
