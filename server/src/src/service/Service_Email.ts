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

export class EmailService {
  private transporter: Transporter;

  constructor() {
    const config = obterConfigEmail();

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
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
    await this.transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"Nosso Zelo" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}

export default EmailService;
