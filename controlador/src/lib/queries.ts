import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { limitePagina, normalizarBusca, paginaAtual } from "@/lib/sanitize";

export const tiposPrestador = ["cuidador", "enfermeiro", "acompanhante"] as const;

export const usuarioAdminResumoSelect = {
  id: true,
  nome: true,
  email: true,
  telefone: true,
  cpf: true,
  tipo: true,
  status_cadastro: true,
  email_confirmado: true,
  cidade: true,
  estado: true,
  criado_em: true
} satisfies Prisma.usuariosSelect;

export async function obterResumoDashboard() {
  const [
    totalUsuarios,
    totalClientes,
    totalPrestadores,
    prestadoresAtivos,
    prestadoresPendentes,
    emailsNaoConfirmados,
    assinaturasAtivas,
    assinaturasPendentes,
    assinaturasExpiradas,
    contasBloqueadas
  ] = await Promise.all([
    prisma.usuarios.count(),
    prisma.usuarios.count({ where: { tipo: "cliente" } }),
    prisma.usuarios.count({ where: { tipo: { in: [...tiposPrestador] } } }),
    prisma.usuarios.count({
      where: {
        tipo: { in: [...tiposPrestador] },
        email_confirmado: true,
        status_cadastro: "ativo",
        assinaturas: { some: { status: "ativa" } }
      }
    }),
    prisma.usuarios.count({
      where: {
        tipo: { in: [...tiposPrestador] },
        OR: [
          { status_cadastro: { in: ["pendente_pagamento", "aguardando_confirmacao_pagamento"] } },
          { assinaturas: { some: { status: { in: ["pendente", "aguardando_confirmacao"] } } } }
        ]
      }
    }),
    prisma.usuarios.count({ where: { email_confirmado: false } }),
    prisma.assinaturas.count({ where: { status: "ativa" } }),
    prisma.assinaturas.count({ where: { status: { in: ["pendente", "aguardando_confirmacao"] } } }),
    prisma.assinaturas.count({ where: { status: "expirada" } }),
    prisma.usuarios.count({ where: { status_cadastro: "bloqueado" } })
  ]);

  return {
    totalUsuarios,
    totalClientes,
    totalPrestadores,
    prestadoresAtivos,
    prestadoresPendentes,
    emailsNaoConfirmados,
    assinaturasAtivas,
    assinaturasPendentes,
    assinaturasExpiradas,
    contasBloqueadas
  };
}

export function filtrosUsuarios(searchParams: URLSearchParams) {
  const busca = normalizarBusca(searchParams.get("busca"));
  const tipo = normalizarBusca(searchParams.get("tipo"));
  const emailConfirmado = searchParams.get("email_confirmado");
  const statusCadastro = normalizarBusca(searchParams.get("status_cadastro"));

  const where: Prisma.usuariosWhereInput = {};
  if (busca) {
    where.OR = [
      { nome: { contains: busca } },
      { email: { contains: busca } },
      { cpf: { contains: busca } }
    ];
  }
  if (tipo) where.tipo = tipo as Prisma.Enumusuarios_tipoFilter["equals"];
  if (emailConfirmado === "true") where.email_confirmado = true;
  if (emailConfirmado === "false") where.email_confirmado = false;
  if (statusCadastro) where.status_cadastro = statusCadastro as Prisma.Enumusuarios_status_cadastroFilter["equals"];

  return where;
}

export async function listarUsuarios(searchParams: URLSearchParams) {
  const page = paginaAtual(searchParams.get("page"));
  const limit = limitePagina(searchParams.get("limit"));
  const where = filtrosUsuarios(searchParams);
  const [total, usuarios] = await Promise.all([
    prisma.usuarios.count({ where }),
    prisma.usuarios.findMany({
      where,
      orderBy: { criado_em: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true,
        status_cadastro: true,
        email_confirmado: true,
        cidade: true,
        estado: true,
        criado_em: true
      }
    })
  ]);

  return { page, limit, total, usuarios };
}

export async function listarPrestadores(searchParams: URLSearchParams) {
  const page = paginaAtual(searchParams.get("page"));
  const limit = limitePagina(searchParams.get("limit"));
  const busca = normalizarBusca(searchParams.get("busca"));
  const tipo = normalizarBusca(searchParams.get("tipo"));
  const statusCadastro = normalizarBusca(searchParams.get("status_cadastro"));
  const assinaturaStatus = normalizarBusca(searchParams.get("assinatura_status"));
  const cidade = normalizarBusca(searchParams.get("cidade"));
  const estado = normalizarBusca(searchParams.get("estado"));
  const emailConfirmado = searchParams.get("email_confirmado");

  const where: Prisma.usuariosWhereInput = {
    tipo: { in: tipo && tiposPrestador.includes(tipo as (typeof tiposPrestador)[number]) ? [tipo as never] : [...tiposPrestador] }
  };

  if (busca) {
    where.OR = [{ nome: { contains: busca } }, { email: { contains: busca } }];
  }
  if (statusCadastro) where.status_cadastro = statusCadastro as Prisma.Enumusuarios_status_cadastroFilter["equals"];
  if (cidade) where.cidade = { contains: cidade };
  if (estado) where.estado = { contains: estado };
  if (emailConfirmado === "true") where.email_confirmado = true;
  if (emailConfirmado === "false") where.email_confirmado = false;
  if (assinaturaStatus) {
    where.assinaturas = { some: { status: assinaturaStatus as Prisma.Enumassinaturas_statusFilter["equals"] } };
  }

  const [total, prestadores] = await Promise.all([
    prisma.usuarios.count({ where }),
    prisma.usuarios.findMany({
      where,
      orderBy: { criado_em: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        tipo: true,
        status_cadastro: true,
        email_confirmado: true,
        cidade: true,
        estado: true,
        avaliacao_media: true,
        assinaturas: {
          orderBy: { criado_em: "desc" },
          take: 1,
          select: { id: true, status: true, gateway: true, confirmacao_expira_em: true }
        }
      }
    })
  ]);

  return { page, limit, total, prestadores };
}
