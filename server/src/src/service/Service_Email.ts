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
  const secure =
    process.env.EMAIL_SECURE === 'true' ||
    (process.env.EMAIL_SECURE !== 'false' && port === 465);

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
    secure,
  };
}

function mensagemErroOriginal(error: unknown) {
  return error instanceof Error ? error.message : 'Falha desconhecida no SMTP.';
}

function isFalhaConexao(error: unknown) {
  const mensagem = mensagemErroOriginal(error).toLowerCase();
  return (
    mensagem.includes('timeout') ||
    mensagem.includes('connection') ||
    mensagem.includes('etimedout') ||
    mensagem.includes('econnrefused')
  );
}

function normalizarErroEmail(
  error: unknown,
  contexto: { host: string; port: number },
) {
  const mensagem =
    error instanceof Error ? error.message : 'Falha desconhecida no SMTP.';
  const falhaConexao = isFalhaConexao(error);

  if (!falhaConexao) return error;

  const erro = new Error(
    `Servico de e-mail indisponivel no momento. Falha ao conectar em ${contexto.host}:${contexto.port}. Detalhe: ${mensagem}`,
  ) as Error & { status?: number; cause?: unknown };
  erro.status = 503;
  erro.cause = error;
  return erro;
}

function criarTransporter(config: ReturnType<typeof obterConfigEmail>) {
  return nodemailer.createTransport({
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

export class EmailService {
  private transporter: Transporter;
  private config: ReturnType<typeof obterConfigEmail>;

  constructor() {
    this.config = obterConfigEmail();
    this.transporter = criarTransporter(this.config);
  }

  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const message = {
        from:
          process.env.EMAIL_FROM ||
          `"Nosso Zelo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    try {
      await this.transporter.sendMail(message);
    } catch (error) {
      const deveTentarSslGmail =
        isFalhaConexao(error) &&
        this.config.host === 'smtp.gmail.com' &&
        this.config.port === 587;

      if (deveTentarSslGmail) {
        const fallbackConfig = {
          ...this.config,
          port: 465,
          secure: true,
        };

        try {
          await criarTransporter(fallbackConfig).sendMail(message);
          return;
        } catch (fallbackError) {
          throw normalizarErroEmail(fallbackError, {
            host: fallbackConfig.host,
            port: fallbackConfig.port,
          });
        }
      }

      throw normalizarErroEmail(error, {
        host: this.config.host,
        port: this.config.port,
      });
    }
  }
}

export default EmailService;
