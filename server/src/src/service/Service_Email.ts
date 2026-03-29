// src/services/EmailService.ts
import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: `"Nosso Zelo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(
        '📧 E-mail enviado com sucesso:',
        info.messageId,
      );
    } catch (error) {
      console.error('❌ Erro ao enviar e-mail:', error);
      throw error;
    }
  }
}
