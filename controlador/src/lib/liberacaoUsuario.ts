import type { Prisma } from "@prisma/client";
import { tiposPrestador } from "@/lib/queries";

function adicionarDias(data: Date, dias: number) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

async function obterPlanoPadrao(tx: Prisma.TransactionClient) {
  const plano = await tx.planos.findFirst({ orderBy: { id: "asc" } });
  if (plano) return plano;

  return tx.planos.create({
    data: {
      nome: "Assinatura Profissional Mensal",
      valor: 0.01,
      beneficios: "Plano para ativacao administrativa de prestadores."
    }
  });
}

export async function liberarUsuarioOperacional(tx: Prisma.TransactionClient, usuarioId: string) {
  const usuario = await tx.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, tipo: true }
  });

  if (!usuario) return null;

  const usuarioAtualizado = await tx.usuarios.update({
    where: { id: usuario.id },
    data: {
      email_confirmado: true,
      status_cadastro: "ativo"
    },
    select: {
      id: true,
      tipo: true,
      status_cadastro: true,
      email_confirmado: true
    }
  });

  if (!tiposPrestador.includes(usuario.tipo as (typeof tiposPrestador)[number])) {
    return { usuario: usuarioAtualizado, assinatura: null };
  }

  const [plano, assinaturaAtual] = await Promise.all([
    obterPlanoPadrao(tx),
    tx.assinaturas.findFirst({
      where: { prestador_id: usuario.id },
      orderBy: [{ criado_em: "desc" }, { id: "desc" }]
    })
  ]);
  const agora = new Date();
  const proximoVencimento = adicionarDias(agora, 30);
  const dadosAssinatura = {
    plano_id: assinaturaAtual?.plano_id ?? plano.id,
    status: "ativa" as const,
    gateway: assinaturaAtual?.gateway ?? "asaas",
    gateway_status: "manual_liberada_admin",
    data_ultimo_pagamento: agora,
    data_proximo_vencimento: proximoVencimento,
    periodo_tolerancia_ate: adicionarDias(proximoVencimento, 15),
    confirmacao_expira_em: null,
    cancelada_em: null
  };

  const assinatura = assinaturaAtual
    ? await tx.assinaturas.update({
        where: { id: assinaturaAtual.id },
        data: dadosAssinatura
      })
    : await tx.assinaturas.create({
        data: {
          prestador_id: usuario.id,
          ...dadosAssinatura
        }
      });

  return { usuario: usuarioAtualizado, assinatura };
}
