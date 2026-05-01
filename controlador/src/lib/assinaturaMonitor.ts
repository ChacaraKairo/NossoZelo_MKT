import type { assinaturas_status, usuarios_status_cadastro } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { statusCadastroPorAssinatura } from "@/lib/financeiro";
import { tiposPrestador } from "@/lib/queries";

type StatusCadastro = usuarios_status_cadastro;

function statusInativo(status: StatusCadastro) {
  return status !== "ativo";
}

export type ResultadoSincronizacaoAssinaturas = {
  assinaturasAtrasadas: number;
  assinaturasBloqueadas: number;
  assinaturasExpiradas: number;
  prestadoresAtivados: number;
  prestadoresInativados: number;
  prestadoresSemAlteracao: number;
  prestadoresSemAssinatura: number;
};

export async function sincronizarAssinaturasEPrestadores(): Promise<ResultadoSincronizacaoAssinaturas> {
  const agora = new Date();

  const [confirmacoesExpiradas, ativasVencidas, atrasadasComToleranciaExpirada] =
    await Promise.all([
      prisma.assinaturas.findMany({
        where: {
          status: "aguardando_confirmacao",
          confirmacao_expira_em: { lt: agora }
        },
        select: { id: true }
      }),
      prisma.assinaturas.findMany({
        where: {
          status: "ativa",
          data_proximo_vencimento: { lt: agora }
        },
        select: { id: true, periodo_tolerancia_ate: true }
      }),
      prisma.assinaturas.findMany({
        where: {
          status: "atrasada",
          periodo_tolerancia_ate: { lt: agora }
        },
        select: { id: true }
      })
    ]);

  const idsExpiradas = confirmacoesExpiradas.map((item) => item.id);
  const idsAtivasBloquear = ativasVencidas
    .filter((item) => item.periodo_tolerancia_ate && item.periodo_tolerancia_ate < agora)
    .map((item) => item.id);
  const idsAtrasadasBloquear = atrasadasComToleranciaExpirada.map((item) => item.id);
  const idsBloquear = [...new Set([...idsAtivasBloquear, ...idsAtrasadasBloquear])];
  const idsAtrasar = ativasVencidas
    .filter((item) => !idsBloquear.includes(item.id))
    .map((item) => item.id);

  await prisma.$transaction(async (tx) => {
    if (idsExpiradas.length) {
      await tx.assinaturas.updateMany({
        where: { id: { in: idsExpiradas } },
        data: {
          status: "expirada",
          gateway_status: "confirmacao_expirada"
        }
      });
    }

    if (idsAtrasar.length) {
      await tx.assinaturas.updateMany({
        where: { id: { in: idsAtrasar } },
        data: {
          status: "atrasada",
          gateway_status: "vencimento_detectado_controlador"
        }
      });
    }

    if (idsBloquear.length) {
      await tx.assinaturas.updateMany({
        where: { id: { in: idsBloquear } },
        data: {
          status: "bloqueada",
          gateway_status: "tolerancia_expirada_controlador"
        }
      });
    }
  });

  const prestadores = await prisma.usuarios.findMany({
    where: { tipo: { in: [...tiposPrestador] } },
    select: {
      id: true,
      status_cadastro: true,
      assinaturas: {
        orderBy: [{ criado_em: "desc" }, { id: "desc" }],
        take: 1,
        select: { status: true }
      }
    }
  });

  const destinoPorStatus = new Map<StatusCadastro, string[]>();
  let prestadoresAtivados = 0;
  let prestadoresInativados = 0;
  let prestadoresSemAlteracao = 0;
  let prestadoresSemAssinatura = 0;

  for (const prestador of prestadores) {
    const assinaturaAtual = prestador.assinaturas[0];
    const statusDesejado = assinaturaAtual
      ? statusCadastroPorAssinatura(assinaturaAtual.status as assinaturas_status)
      : "pendente_pagamento";

    if (!assinaturaAtual) prestadoresSemAssinatura += 1;

    if (prestador.status_cadastro === statusDesejado) {
      prestadoresSemAlteracao += 1;
      continue;
    }

    if (statusDesejado === "ativo") {
      prestadoresAtivados += 1;
    } else if (statusInativo(statusDesejado)) {
      prestadoresInativados += 1;
    }

    const ids = destinoPorStatus.get(statusDesejado) ?? [];
    ids.push(prestador.id);
    destinoPorStatus.set(statusDesejado, ids);
  }

  if (destinoPorStatus.size) {
    await prisma.$transaction(
      [...destinoPorStatus.entries()].map(([status, ids]) =>
        prisma.usuarios.updateMany({
          where: { id: { in: ids } },
          data: { status_cadastro: status }
        })
      )
    );
  }

  return {
    assinaturasAtrasadas: idsAtrasar.length,
    assinaturasBloqueadas: idsBloquear.length,
    assinaturasExpiradas: idsExpiradas.length,
    prestadoresAtivados,
    prestadoresInativados,
    prestadoresSemAlteracao,
    prestadoresSemAssinatura
  };
}
