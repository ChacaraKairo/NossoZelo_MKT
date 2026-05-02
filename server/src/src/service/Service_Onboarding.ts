import type { usuarios_status_cadastro } from '@prisma/client';
import { TIPOS_PRESTADOR } from '../constants/dominio';
import { STATUS_ASSINATURA, STATUS_CADASTRO_USUARIO } from '../constants/financeiro';
import prisma from '../lib/prisma';

export type EtapaOnboardingPrestador =
  | 'confirmar_email'
  | 'completar_perfil'
  | 'escolher_plano'
  | 'pagar_assinatura'
  | 'aguardando_confirmacao_pagamento'
  | 'ativo'
  | 'inadimplente'
  | 'bloqueado';

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

function textoPreenchido(valor?: string | null) {
  return Boolean(String(valor || '').trim());
}

function dadosCuidadorCompletos(dados?: {
  bio?: string | null;
  disponibilidade?: string | null;
  especialidades?: string | null;
} | null) {
  return Boolean(
    dados &&
      textoPreenchido(dados.bio) &&
      textoPreenchido(dados.disponibilidade) &&
      textoPreenchido(dados.especialidades),
  );
}

function dadosAcompanhanteCompletos(dados?: {
  bio?: string | null;
  disponibilidade?: string | null;
  especialidades?: string | null;
} | null) {
  return dadosCuidadorCompletos(dados);
}

function dadosEnfermeiroCompletos(dados?: {
  bio?: string | null;
  disponibilidade?: string | null;
  especialidades?: string | null;
  coren?: string | null;
} | null) {
  return Boolean(dadosCuidadorCompletos(dados) && textoPreenchido(dados?.coren));
}

function proximaAcaoPorEtapa(etapa: EtapaOnboardingPrestador) {
  const mensagens: Record<EtapaOnboardingPrestador, string> = {
    confirmar_email: 'Confirme seu e-mail para continuar a ativacao do perfil profissional.',
    completar_perfil: 'Complete seus dados profissionais obrigatorios.',
    escolher_plano: 'Escolha um plano para ativar seu perfil profissional.',
    pagar_assinatura: 'Gere e conclua o pagamento da assinatura pelo Asaas.',
    aguardando_confirmacao_pagamento:
      'Aguarde a confirmacao automatica do pagamento pelo Asaas.',
    ativo: 'Perfil profissional ativo.',
    inadimplente: 'Regularize sua assinatura para voltar a aparecer nas buscas.',
    bloqueado: 'Entre em contato com o suporte ou regularize a pendencia indicada.',
  };

  return mensagens[etapa];
}

export class ServiceOnboarding {
  static ehPrestador(tipo?: string | null) {
    return TIPOS_PRESTADOR.includes(tipo as any);
  }

  static async obterStatus(usuarioId: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      include: {
        cuidadores: true,
        enfermeiros: true,
        acompanhantes: true,
        assinaturas: {
          orderBy: [{ criado_em: 'desc' }, { id: 'desc' }],
          take: 1,
        },
      },
    });

    if (!usuario) {
      throw erroNegocio('Usuario nao encontrado.', 404);
    }

    const isPrestador = this.ehPrestador(usuario.tipo);
    const assinaturaAtual = usuario.assinaturas[0] || null;
    const assinaturaStatus = assinaturaAtual?.status || null;
    const possuiAssinatura = Boolean(assinaturaAtual);
    const possuiDadosProfissionais =
      usuario.tipo === 'cuidador'
        ? dadosCuidadorCompletos(usuario.cuidadores)
        : usuario.tipo === 'enfermeiro'
          ? dadosEnfermeiroCompletos(usuario.enfermeiros)
          : usuario.tipo === 'acompanhante'
            ? dadosAcompanhanteCompletos(usuario.acompanhantes)
            : true;

    let etapaAtual: EtapaOnboardingPrestador = 'ativo';

    if (!isPrestador) {
      etapaAtual = usuario.email_confirmado ? 'ativo' : 'confirmar_email';
    } else if (!usuario.email_confirmado) {
      etapaAtual = 'confirmar_email';
    } else if (!possuiDadosProfissionais) {
      etapaAtual = 'completar_perfil';
    } else if (!assinaturaAtual) {
      etapaAtual = 'escolher_plano';
    } else if (assinaturaStatus === STATUS_ASSINATURA.aguardando_confirmacao) {
      etapaAtual = 'aguardando_confirmacao_pagamento';
    } else if (assinaturaStatus === STATUS_ASSINATURA.ativa && usuario.status_cadastro === STATUS_CADASTRO_USUARIO.ativo) {
      etapaAtual = 'ativo';
    } else if (usuario.status_cadastro === STATUS_CADASTRO_USUARIO.bloqueado || assinaturaStatus === STATUS_ASSINATURA.bloqueada) {
      etapaAtual = 'bloqueado';
    } else if (
      assinaturaStatus === STATUS_ASSINATURA.atrasada ||
      assinaturaStatus === STATUS_ASSINATURA.falhou ||
      assinaturaStatus === STATUS_ASSINATURA.expirada ||
      assinaturaStatus === STATUS_ASSINATURA.cancelada ||
      usuario.status_cadastro === STATUS_CADASTRO_USUARIO.inadimplente
    ) {
      etapaAtual = 'inadimplente';
    } else {
      etapaAtual = 'pagar_assinatura';
    }

    const perfilProfissionalAtivo = Boolean(
      isPrestador &&
        usuario.email_confirmado &&
        usuario.status_cadastro === STATUS_CADASTRO_USUARIO.ativo &&
        assinaturaStatus === STATUS_ASSINATURA.ativa,
    );

    return {
      tipoUsuario: usuario.tipo,
      isPrestador,
      emailConfirmado: usuario.email_confirmado,
      possuiDadosProfissionais,
      possuiAssinatura,
      assinaturaStatus,
      assinatura: assinaturaAtual,
      statusCadastro: usuario.status_cadastro as usuarios_status_cadastro,
      etapaAtual,
      perfilProfissionalAtivo: isPrestador ? perfilProfissionalAtivo : usuario.email_confirmado,
      podeAparecerNaBusca: perfilProfissionalAtivo,
      podeReceberPedidos: perfilProfissionalAtivo,
      proximaAcao: proximaAcaoPorEtapa(etapaAtual),
    };
  }

  static async validarPodeIniciarAssinatura(usuarioId: string) {
    const status = await this.obterStatus(usuarioId);

    if (!status.isPrestador) {
      throw erroNegocio('Apenas prestadores podem iniciar assinatura.', 403);
    }

    if (!status.emailConfirmado) {
      throw erroNegocio('Confirme seu e-mail para continuar a ativacao do perfil profissional.', 403);
    }

    if (!status.possuiDadosProfissionais) {
      throw erroNegocio('Complete seus dados profissionais antes de escolher um plano.', 403);
    }

    if (status.assinaturaStatus === STATUS_ASSINATURA.ativa) {
      throw erroNegocio('Sua assinatura ja esta ativa.', 409);
    }

    return status;
  }
}

export default ServiceOnboarding;
