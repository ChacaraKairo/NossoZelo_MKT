"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela gestão de comunicações via e-mail,
 * configurando o transporte SMTP e garantindo o disparo de mensagens formatadas em HTML.
 * @rota server\src\src\service\Service_Email.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
console.log('[LOG-FLUXO] Carregando variáveis de ambiente (dotenv) para o EmailService.');
dotenv_1.default.config();
class EmailService {
    transporter;
    /**
     * Construtor da classe. Inicializa o transporte SMTP utilizando variáveis de ambiente.
     */
    constructor() {
        console.log(`[LOG-FLUXO] Inicializando construtor do EmailService. Host: ${process.env.EMAIL_HOST}, Porta: ${process.env.EMAIL_PORT}`);
        // Inicialização do transportador mantendo a nomenclatura original
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log('[LOG-FLUXO] Configuração do transporte SMTP do Nodemailer concluída com sucesso.');
    }
    /**
     * Envia um e-mail formatado em HTML para o destinatário especificado.
     * @param {string} to - Endereço de e-mail do destinatário.
     * @param {string} subject - Assunto da mensagem.
     * @param {string} html - Conteúdo da mensagem em formato HTML.
     * @returns {Promise<void>} - Retorno vazio em caso de sucesso.
     * @throws {Error} - Lança erro caso ocorra falha na comunicação SMTP ou autenticação.
     */
    async send(to, subject, html) {
        console.log(`[LOG-FLUXO] Iniciando execução do método send. Destinatário: ${to}, Assunto: ${subject}`);
        try {
            console.log(`[LOG-FLUXO] Preparando metadados de envio. Remetente configurado: ${process.env.EMAIL_USER}`);
            // Execução da chamada assíncrona ao servidor de e-mail
            console.log(`[LOG-FLUXO] Invocando transporte assíncrono para tentativa de disparo para: ${to}`);
            const info = await this.transporter.sendMail({
                from: `"Nosso Zelo" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
            });
            console.log(`[LOG-FLUXO] 📧 E-mail despachado com sucesso para ${to}. Identificador único (MessageID): ${info.messageId}`);
            // Retorno final de sucesso da operação
            return;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha crítica no disparo de e-mail para ${to}: Ocorreu uma interrupção na comunicação SMTP. Detalhes: ${error.message || error}`);
            // Re-lançamento da exceção para tratamento de erro de negócio na camada superior
            throw error;
        }
    }
}
exports.EmailService = EmailService;
exports.default = EmailService;
