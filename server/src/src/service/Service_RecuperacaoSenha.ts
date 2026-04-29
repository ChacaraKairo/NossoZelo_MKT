import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import EmailService from './Service_Email';

const TEMPO_EXPIRACAO_MINUTOS = 30;
export const MENSAGEM_RECUPERACAO_GENERICA =
  'Se este e-mail estiver cadastrado, enviaremos instrucoes para redefinir sua senha.';

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

function mascararEmail(email: string) {
  const [nome = '', dominio = ''] = String(email).split('@');
  if (!dominio) return 'email_invalido';

  const inicio = nome.slice(0, 2);
  return `${inicio}${'*'.repeat(Math.max(3, nome.length - 2))}@${dominio}`;
}

function validarSenhaForte(novaSenha: string) {
  return (
    novaSenha.length >= 8 &&
    novaSenha.length <= 72 &&
    /[a-z]/.test(novaSenha) &&
    /[A-Z]/.test(novaSenha) &&
    /\d/.test(novaSenha) &&
    /[^A-Za-z0-9]/.test(novaSenha)
  );
}

function dataExpiracao() {
  const data = new Date();
  data.setMinutes(data.getMinutes() + TEMPO_EXPIRACAO_MINUTOS);
  return data;
}

function frontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

function htmlRecuperacaoSenha(nome: string, link: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h1 style="color: #0f766e; font-size: 22px;">Redefinicao de senha - NossoZelo</h1>
      <p>Ola, ${nome}. Recebemos uma solicitacao para redefinir sua senha.</p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background: #0f766e; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Redefinir senha
        </a>
      </p>
      <p>Se o botao nao funcionar, acesse este link:</p>
      <p style="word-break: break-all;"><a href="${link}">${link}</a></p>
      <p style="color: #64748b; font-size: 13px;">
        Este link expira em ${TEMPO_EXPIRACAO_MINUTOS} minutos. Se voce nao solicitou esta alteracao, ignore este e-mail.
      </p>
    </div>
  `;
}

export class ServiceRecuperacaoSenha {
  static gerarToken() {
    return randomBytes(32).toString('hex');
  }

  static async enviarEmailRecuperacao(email: string) {
    const emailNormalizado = String(email || '').trim().toLowerCase();

    if (!emailNormalizado) {
      throw erroNegocio('O campo e-mail e obrigatorio.', 400);
    }

    const emailMascarado = mascararEmail(emailNormalizado);
    logger.info('RecuperacaoSenha: solicitacao recebida', {
      email: emailMascarado,
    });

    const usuario = await prisma.usuarios.findUnique({
      where: { email: emailNormalizado },
      select: { id: true, nome: true, email: true },
    });

    if (!usuario) {
      logger.info('RecuperacaoSenha: e-mail nao encontrado', {
        email: emailMascarado,
      });
      return { message: MENSAGEM_RECUPERACAO_GENERICA };
    }

    await prisma.recuperacao_senhas.updateMany({
      where: { usuario_id: usuario.id, usado: false },
      data: { usado: true },
    });

    const token = this.gerarToken();
    await prisma.recuperacao_senhas.create({
      data: {
        usuario_id: usuario.id,
        token,
        expiracao: dataExpiracao(),
        usado: false,
      },
    });

    const link = `${frontendUrl()}/redefinir-senha?token=${encodeURIComponent(
      token,
    )}`;

    const emailService = new EmailService();
    await emailService.send(
      usuario.email,
      'Redefinicao de senha - NossoZelo',
      htmlRecuperacaoSenha(usuario.nome, link),
    );

    logger.info('RecuperacaoSenha: e-mail enviado', {
      usuarioId: usuario.id,
      email: emailMascarado,
    });

    return { message: MENSAGEM_RECUPERACAO_GENERICA };
  }

  static async validarTokenRecuperacao(token: string) {
    const tokenNormalizado = String(token || '').trim();
    if (!tokenNormalizado) {
      throw erroNegocio('Token de recuperacao ausente.', 400);
    }

    const recuperacao = await prisma.recuperacao_senhas.findFirst({
      where: { token: tokenNormalizado },
      select: {
        id: true,
        expiracao: true,
        usado: true,
      },
    });

    if (!recuperacao) {
      throw erroNegocio('Token de recuperacao invalido.', 400);
    }

    if (recuperacao.usado) {
      throw erroNegocio('Token de recuperacao ja utilizado.', 409);
    }

    if (recuperacao.expiracao < new Date()) {
      await prisma.recuperacao_senhas.update({
        where: { id: recuperacao.id },
        data: { usado: true },
      });
      throw erroNegocio('Token de recuperacao expirado.', 410);
    }

    return { valido: true };
  }

  static async redefinirSenha(token: string, novaSenha: string) {
    const tokenNormalizado = String(token || '').trim();

    if (!tokenNormalizado) {
      throw erroNegocio('Token de recuperacao ausente.', 400);
    }

    if (!novaSenha || !validarSenhaForte(novaSenha)) {
      throw erroNegocio(
        'A nova senha deve ter 8 a 72 caracteres, com letra maiuscula, minuscula, numero e caractere especial.',
        400,
      );
    }

    const recuperacao = await prisma.recuperacao_senhas.findFirst({
      where: { token: tokenNormalizado },
      select: {
        id: true,
        usuario_id: true,
        expiracao: true,
        usado: true,
      },
    });

    if (!recuperacao) {
      throw erroNegocio('Token de recuperacao invalido.', 400);
    }

    if (recuperacao.usado) {
      throw erroNegocio('Token de recuperacao ja utilizado.', 409);
    }

    if (recuperacao.expiracao < new Date()) {
      await prisma.recuperacao_senhas.update({
        where: { id: recuperacao.id },
        data: { usado: true },
      });
      throw erroNegocio('Token de recuperacao expirado.', 410);
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);

    await prisma.$transaction([
      prisma.usuarios.update({
        where: { id: recuperacao.usuario_id },
        data: { senha: senhaCriptografada },
      }),
      prisma.recuperacao_senhas.update({
        where: { id: recuperacao.id },
        data: { usado: true },
      }),
      prisma.recuperacao_senhas.updateMany({
        where: {
          usuario_id: recuperacao.usuario_id,
          id: { not: recuperacao.id },
          usado: false,
        },
        data: { usado: true },
      }),
    ]);

    logger.info('RecuperacaoSenha: senha redefinida', {
      usuarioId: recuperacao.usuario_id,
    });

    return { message: 'Senha redefinida com sucesso.' };
  }
}

export default ServiceRecuperacaoSenha;
