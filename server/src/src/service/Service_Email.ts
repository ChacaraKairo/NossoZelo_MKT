/**
 * @author Kairo Chacara
 * @version 1.0
 * @date 14/04/2026
 * @description Servico responsavel pelo envio de e-mails via SMTP.
 * @rota server\src\src\service\Service_Email.ts
 */

import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

function obterConfigEmail() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    const error = new Error(
      'Servico de e-mail nao configurado. Verifique EMAIL_HOST, EMAIL_USER e EMAIL_PASS.',
    ) as Error & { status?: number };
    error.status = 503;
    throw error;
  }

  return {
    host,
    port,
    user,
    pass,
    secure: port === 465,
  };
}

function normalizarErroEmail(error: unknown) {
  const mensagem =
    error instanceof Error ? error.message : 'Falha desconhecida no SMTP.';
  const falhaConexao =
    mensagem.toLowerCase().includes('timeout') ||
    mensagem.toLowerCase().includes('connection') ||
    mensagem.toLowerCase().includes('etimedout') ||
    mensagem.toLowerCase().includes('econnrefused');

  if (!falhaConexao) return error;

  const erro = new Error(
    'Servico de e-mail indisponivel no momento. Verifique EMAIL_HOST, EMAIL_PORT, EMAIL_USER e EMAIL_PASS.',
  ) as Error & { status?: number; cause?: unknown };
  erro.status = 503;
  erro.cause = error;
  return erro;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    const config = obterConfigEmail();

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      requireTLS: !config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          `"Nosso Zelo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw normalizarErroEmail(error);
    }
  }
}

export default EmailService;
