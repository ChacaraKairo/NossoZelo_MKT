import { randomBytes } from 'crypto';
import prisma from '../lib/prisma';
import { TIPOS_PRESTADOR } from '../constants/dominio';
import logger from '../lib/logger';
import ServiceAssinatura, {
  DadosPagamentoAssinatura,
  MetodoPagamentoAssinatura,
} from './Service_Assinatura';
import EmailService from './Service_Email';

const HORAS_EXPIRACAO_CONFIRMACAO = 24;
const COOLDOWN_REENVIO_MS = 60 * 1000;

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

function erroServicoEmail(error: unknown) {
  if (
    error instanceof Error &&
    typeof (error as Error & { status?: number }).status === 'number'
  ) {
    return error;
  }

  const mensagem =
    error instanceof Error ? error.message : 'Falha desconhecida no SMTP.';
  const falhaConexao =
    mensagem.toLowerCase().includes('timeout') ||
    mensagem.toLowerCase().includes('connection') ||
    mensagem.toLowerCase().includes('etimedout') ||
    mensagem.toLowerCase().includes('econnrefused');

  if (falhaConexao) {
    return erroNegocio(
      'Servico de e-mail indisponivel no momento. Verifique a configuracao SMTP e tente novamente.',
      503,
    );
  }

  return error;
}

function frontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

function linkConfirmacaoEmail(token: string, tipo?: string) {
  const ehPrestador = TIPOS_PRESTADOR.includes(tipo as any);
  const caminho = ehPrestador ? '/cadastro-prestador' : '/confirmar-email';
  const parametro = ehPrestador ? 'confirmar_email' : 'token';

  return `${frontendUrl()}${caminho}?${parametro}=${encodeURIComponent(token)}`;
}

function adicionarHoras(data: Date, horas: number) {
  const novaData = new Date(data);
  novaData.setHours(novaData.getHours() + horas);
  return novaData;
}

function htmlConfirmacao(nome: string, link: string, tipo?: string) {
  const complementoPrestador = TIPOS_PRESTADOR.includes(tipo as any)
    ? '<p>Depois da confirmacao, voce concluira o pagamento da assinatura profissional no proprio cadastro.</p>'
    : '';

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h1 style="color: #0f766e; font-size: 22px;">Confirme seu e-mail no NossoZelo</h1>
      <p>Olá, ${nome}. Confirme seu e-mail para liberar todas as funcionalidades da sua conta.</p>
      ${complementoPrestador}
      <p style="margin: 24px 0;">
        <a href="${link}" style="background: #0f766e; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Confirmar e-mail
        </a>
      </p>
      <p>Se o botão não funcionar, acesse este link:</p>
      <p style="word-break: break-all;"><a href="${link}">${link}</a></p>
      <p style="color: #64748b; font-size: 13px;">Este link expira em 24 horas.</p>
    </div>
  `;
}

async function obterPlanoCadastroPrestador() {
  const planoConfigurado = Number(process.env.ASSINATURA_PLANO_ID || 0);
  if (Number.isInteger(planoConfigurado) && planoConfigurado > 0) {
    const plano = await prisma.planos.findUnique({
      where: { id: planoConfigurado },
      select: { id: true },
    });
    if (plano) return plano.id;
  }

  const plano = await prisma.planos.findFirst({
    where: { valor: { gt: 0 } },
    orderBy: { id: 'asc' },
    select: { id: true },
  });

  if (!plano) {
    throw erroNegocio(
      'Nenhum plano com valor real cadastrado para cobrar o registro do prestador.',
      500,
    );
  }

  return plano.id;
}

function metodoPagamentoCadastro(valor?: string): MetodoPagamentoAssinatura {
  if (valor === 'credito' || valor === 'debito' || valor === 'pix') {
    return valor;
  }

  return 'pix';
}

async function iniciarPagamentoCadastroSePrestador(
  usuarioId: string,
  dadosPagamento: DadosPagamentoAssinatura,
) {
  const usuario = await prisma.usuarios.findUnique({
    where: { id: usuarioId },
    select: { id: true, tipo: true },
  });

  if (!usuario || !TIPOS_PRESTADOR.includes(usuario.tipo as any)) {
    return null;
  }

  const assinaturaAtual = await ServiceAssinatura.obterAssinaturaAtual(
    usuario.id,
  );
  if (
    assinaturaAtual &&
    ['ativa', 'aguardando_confirmacao'].includes(assinaturaAtual.status)
  ) {
    return {
      criada: false,
      assinatura: assinaturaAtual,
      message:
        assinaturaAtual.status === 'ativa'
          ? 'Assinatura ja ativa.'
          : 'Assinatura ja aguardando confirmacao de pagamento.',
    };
  }

  const planoId = await obterPlanoCadastroPrestador();
  const resultado = await ServiceAssinatura.iniciarOuRegularizarAssinatura(
    usuario.id,
    planoId,
    dadosPagamento,
  );

  return {
    criada: true,
    ...resultado,
  };
}

export class ServiceConfirmacaoEmail {
  static gerarTokenConfirmacao(_usuarioId: string) {
    return randomBytes(32).toString('hex');
  }

  static async criarConfirmacaoEmail(usuarioId: string) {
    await prisma.confirmacoes_email.updateMany({
      where: { usuario_id: usuarioId, usado: false },
      data: { usado: true },
    });

    return prisma.confirmacoes_email.create({
      data: {
        usuario_id: usuarioId,
        token: this.gerarTokenConfirmacao(usuarioId),
        expiracao: adicionarHoras(new Date(), HORAS_EXPIRACAO_CONFIRMACAO),
      },
    });
  }

  static async enviarEmailConfirmacao(usuarioId: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        email_confirmado: true,
      },
    });

    if (!usuario) throw erroNegocio('Usuario nao encontrado.', 404);

    if (usuario.email_confirmado) {
      return {
        enviado: false,
        email_confirmado: true,
        message: 'E-mail ja confirmado.',
      };
    }

    const confirmacao = await this.criarConfirmacaoEmail(usuario.id);
    const link = linkConfirmacaoEmail(confirmacao.token, usuario.tipo);

    try {
      const emailService = new EmailService();
      await emailService.send(
        usuario.email,
        'Confirme seu e-mail no NossoZelo',
        htmlConfirmacao(usuario.nome, link, usuario.tipo),
      );
      logger.info('E-mail de confirmacao enviado', {
        usuarioId: usuario.id,
        email: usuario.email,
      });
    } catch (error) {
      await prisma.confirmacoes_email.update({
        where: { id: confirmacao.id },
        data: { usado: true },
      });
      logger.error('Falha ao enviar e-mail de confirmacao', {
        usuarioId: usuario.id,
        email: usuario.email,
        error,
      });
      throw erroServicoEmail(error);
    }

    return {
      enviado: true,
      email_confirmado: false,
      expiracao: confirmacao.expiracao,
      message: 'E-mail de confirmacao enviado.',
    };
  }

  static async confirmarEmail(
    token: string,
    dadosPagamento?: DadosPagamentoAssinatura | string,
  ) {
    const tokenNormalizado = String(token || '').trim();
    if (!tokenNormalizado) {
      throw erroNegocio('Token de confirmacao ausente.', 400);
    }

    const confirmacao = await prisma.confirmacoes_email.findUnique({
      where: { token: tokenNormalizado },
      include: {
        usuarios: {
          select: { id: true, email_confirmado: true },
        },
      },
    });

    if (!confirmacao) {
      throw erroNegocio('Token de confirmacao invalido.', 404);
    }

    if (confirmacao.usado) {
      throw erroNegocio('Token de confirmacao ja utilizado.', 409);
    }

    if (confirmacao.expiracao < new Date()) {
      await prisma.confirmacoes_email.update({
        where: { id: confirmacao.id },
        data: { usado: true },
      });
      throw erroNegocio('Token de confirmacao expirado.', 410);
    }

    await prisma.$transaction([
      prisma.usuarios.update({
        where: { id: confirmacao.usuario_id },
        data: { email_confirmado: true },
      }),
      prisma.confirmacoes_email.update({
        where: { id: confirmacao.id },
        data: { usado: true },
      }),
      prisma.confirmacoes_email.updateMany({
        where: {
          usuario_id: confirmacao.usuario_id,
          id: { not: confirmacao.id },
          usado: false,
        },
        data: { usado: true },
      }),
    ]);

    let pagamentoCadastro = null;
    let avisoPagamento: string | null = null;
    const pagamentoNormalizado =
      typeof dadosPagamento === 'string'
        ? { metodoPagamento: metodoPagamentoCadastro(dadosPagamento) }
        : {
            ...dadosPagamento,
            metodoPagamento: metodoPagamentoCadastro(
              dadosPagamento?.metodoPagamento,
            ),
          };

    try {
      pagamentoCadastro = await iniciarPagamentoCadastroSePrestador(
        confirmacao.usuario_id,
        pagamentoNormalizado,
      );
    } catch (error) {
      avisoPagamento =
        error instanceof Error
          ? error.message
          : 'Nao foi possivel iniciar a cobranca do registro.';
      logger.error('Falha ao iniciar pagamento no cadastro do prestador', {
        usuarioId: confirmacao.usuario_id,
        error,
      });
    }

    return {
      email_confirmado: true,
      message: 'E-mail confirmado com sucesso.',
      pagamento_cadastro: pagamentoCadastro,
      aviso_pagamento: avisoPagamento,
    };
  }

  static async reenviarConfirmacao(usuarioId: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { id: true, email_confirmado: true },
    });

    if (!usuario) throw erroNegocio('Usuario nao encontrado.', 404);

    if (usuario.email_confirmado) {
      return {
        enviado: false,
        email_confirmado: true,
        message: 'E-mail ja confirmado.',
      };
    }

    const ultimaConfirmacao = await prisma.confirmacoes_email.findFirst({
      where: { usuario_id: usuarioId, usado: false },
      orderBy: { criado_em: 'desc' },
      select: { criado_em: true },
    });

    if (
      ultimaConfirmacao &&
      Date.now() - ultimaConfirmacao.criado_em.getTime() < COOLDOWN_REENVIO_MS
    ) {
      throw erroNegocio(
        'Aguarde um minuto antes de reenviar o e-mail de confirmacao.',
        429,
      );
    }

    return this.enviarEmailConfirmacao(usuarioId);
  }

  static async obterStatusEmail(usuarioId: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { id: true, email: true, email_confirmado: true },
    });

    if (!usuario) throw erroNegocio('Usuario nao encontrado.', 404);

    return {
      email: usuario.email,
      email_confirmado: usuario.email_confirmado,
    };
  }

  static async validarEmailConfirmado(usuarioId: string) {
    const status = await this.obterStatusEmail(usuarioId);
    return status.email_confirmado;
  }
}

export default ServiceConfirmacaoEmail;
