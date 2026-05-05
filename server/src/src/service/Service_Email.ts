/**
 * Versao de demonstracao: envio de e-mails desativado nesta branch.
 *
 * A branch teste_no_email precisa rodar no Render sem depender de SMTP.
 * Mantemos a mesma interface para preservar os fluxos da aplicacao.
 */

import logger from '../lib/logger';

export class EmailService {
  async send(to: string, subject: string, _html: string): Promise<void> {
    logger.info('EmailService: envio simulado na branch teste_no_email', {
      to,
      subject,
    });
  }
}

export default EmailService;
