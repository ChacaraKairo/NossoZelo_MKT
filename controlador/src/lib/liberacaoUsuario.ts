import type { Prisma } from "@prisma/client";
import { tiposPrestador } from "@/lib/queries";

export async function liberarUsuarioOperacional(tx: Prisma.TransactionClient, usuarioId: string) {
  const usuario = await tx.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, tipo: true }
  });

  if (!usuario) return null;
  const ehPrestador = tiposPrestador.includes(usuario.tipo as (typeof tiposPrestador)[number]);
  const assinaturaAtual = ehPrestador
    ? await tx.assinaturas.findFirst({
        where: { prestador_id: usuario.id },
        orderBy: [{ criado_em: "desc" }, { id: "desc" }]
      })
    : null;
  const agora = new Date();
  const proximoVencimento = new Date(agora);
  proximoVencimento.setDate(proximoVencimento.getDate() + 30);
  const toleranciaAte = new Date(proximoVencimento);
  toleranciaAte.setDate(toleranciaAte.getDate() + 15);

  const usuarioAtualizado = await tx.usuarios.update({
    where: { id: usuario.id },
    data: {
      email_confirmado: true,
      status_cadastro: ehPrestador && !assinaturaAtual ? "pendente_pagamento" : "ativo"
    },
    select: {
      id: true,
      tipo: true,
      status_cadastro: true,
      email_confirmado: true
    }
  });

  if (!ehPrestador) {
    return { usuario: usuarioAtualizado, assinatura: null };
  }

  if (!assinaturaAtual) {
    return { usuario: usuarioAtualizado, assinatura: null };
  }

  const assinaturaAtualizada = await tx.assinaturas.update({
    where: { id: assinaturaAtual.id },
    data: {
      status: "ativa",
      gateway_status: "liberacao_manual_admin",
      data_ultimo_pagamento: assinaturaAtual.data_ultimo_pagamento || agora,
      data_proximo_vencimento:
        assinaturaAtual.data_proximo_vencimento || proximoVencimento,
      periodo_tolerancia_ate:
        assinaturaAtual.periodo_tolerancia_ate || toleranciaAte,
      confirmacao_expira_em: null,
      cancelada_em: null
    }
  });

  await tx.eventos_assinatura.create({
    data: {
      assinatura_id: assinaturaAtualizada.id,
      prestador_id: assinaturaAtualizada.prestador_id,
      plano_id: assinaturaAtualizada.plano_id,
      tipo: "liberacao_manual_admin",
      origem: "admin",
      gateway: assinaturaAtualizada.gateway,
      gateway_payment_id: assinaturaAtualizada.gateway_payment_id,
      gateway_subscription_id: assinaturaAtualizada.gateway_subscription_id,
      status_anterior: assinaturaAtual.status,
      status_novo: assinaturaAtualizada.status,
      processado_em: agora,
      payload_resumo: {
        motivo: "liberacao_manual_pelo_controlador"
      }
    }
  });

  return { usuario: usuarioAtualizado, assinatura: assinaturaAtualizada };
}
