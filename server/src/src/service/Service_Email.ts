/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela gestão de comunicações via e-mail,
 * configurando o transporte SMTP e garantindo o disparo de mensagens formatadas em HTML.
 * @rota server\src\src\service\Service_Email.ts
 */

import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';dotenv.config();

export class EmailService {
  private transporter: Transporter;

  /**
   * Construtor da classe. Inicializa o transporte SMTP utilizando variáveis de ambiente.
   */
  constructor() {    // Inicialização do transportador mantendo a nomenclatura original
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });  }

  /**
   * Envia um e-mail formatado em HTML para o destinatário especificado.
   * @param {string} to - Endereço de e-mail do destinatário.
   * @param {string} subject - Assunto da mensagem.
   * @param {string} html - Conteúdo da mensagem em formato HTML.
   * @returns {Promise<void>} - Retorno vazio em caso de sucesso.
   * @throws {Error} - Lança erro caso ocorra falha na comunicação SMTP ou autenticação.
   */
  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {    try {  const info = await this.transporter.sendMail({
        from: `"Nosso Zelo" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });      // Retorno final de sucesso da operação
      return;
    } catch (error: any) {      // Re-lançamento da exceção para tratamento de erro de negócio na camada superior
      throw error;
    }
  }
}

export default EmailService;
