"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável por gerenciar o fluxo de recuperação de credenciais,
 * lidando com a validação de identidade, geração de tokens JWT e comunicação via SMTP.
 * @rota server\src\src\service\Service_Rec_Senha.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRecuperacaoSenhaDefault = exports.ServiceRecuperacaoSenha = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
console.log('[LOG-FLUXO] Inicializando instância do PrismaClient para o ServiceRecuperacaoSenha.');
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';
const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
class ServiceRecuperacaoSenha {
    /**
     * Envia um e-mail de recuperação de senha com link contendo token JWT.
     * @param {string} email - Endereço de e-mail do usuário solicitante.
     * @returns {Promise<{ mensagem: string }>} - Objeto de resposta confirmando o envio.
     * @throws {Error} - Lança erro se o usuário não for encontrado ou se houver falha no transporte SMTP.
     */
    static async enviarEmailRecuperacao(email) {
        console.log(`[LOG-FLUXO] Iniciando enviarEmailRecuperacao para o e-mail alvo: ${email}`);
        try {
            console.log(`[LOG-FLUXO] Consultando base de dados para verificar existência da conta: ${email}`);
            // Busca no banco via Prisma mantendo a nomenclatura original
            // Operação assíncrona: Início da consulta
            const usuario = await prisma.usuarios.findUnique({
                where: { email },
            });
            // Operação assíncrona: Fim da consulta
            // Ramificação condicional: Verificação de existência do usuário
            if (!usuario) {
                console.error(`[ERRO-FLUXO] Falha na recuperação: E-mail ${email} não foi encontrado na tabela 'usuarios'.`);
                throw new Error('Usuário com este e-mail não encontrado');
            }
            console.log(`[LOG-FLUXO] Usuário identificado: ${usuario.nome} (ID: ${usuario.id}). Iniciando geração de token JWT de segurança.`);
            // Geração do token com payload de identificação (Expira em 15 minutos para segurança)
            const token = (0, jsonwebtoken_1.sign)({ id: usuario.id }, JWT_SECRET, {
                expiresIn: '15m',
            });
            const linkRecuperacao = `${BASE_URL}/redefinir-senha?token=${token}`;
            console.log(`[LOG-FLUXO] Link de redefinição construído com sucesso para o usuário ${usuario.id}.`);
            const htmlPath = path_1.default.join(__dirname, '../../HTML/emails/recuperar_senha.html');
            console.log(`[LOG-FLUXO] Verificando existência física do template de e-mail em: ${htmlPath}`);
            // Ramificação condicional: Verificação de infraestrutura de arquivos
            if (!fs_1.default.existsSync(htmlPath)) {
                console.error(`[ERRO-FLUXO] Falha estrutural: Arquivo de template ausente em: ${htmlPath}`);
                throw new Error('Template de e-mail de recuperação ausente.');
            }
            console.log('[LOG-FLUXO] Lendo conteúdo do template HTML para processamento.');
            let html = fs_1.default.readFileSync(htmlPath, 'utf8');
            console.log('[LOG-FLUXO] Injetando variáveis dinâmicas (nome e link) no corpo do HTML.');
            html = html.replace('{{nome}}', usuario.nome);
            html = html.replace('{{link}}', linkRecuperacao);
            console.log(`[LOG-FLUXO] Configurando transportador Nodemailer (Host: smtp.gmail.com). Usuário SMTP: ${process.env.EMAIL_USER}`);
            const transporter = nodemailer_1.default.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            console.log(`[LOG-FLUXO] Iniciando tentativa de disparo de e-mail para ${email} via servidor SMTP.`);
            // Operação assíncrona: Envio de e-mail
            await transporter.sendMail({
                from: `"Suporte NossoZelo" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Recuperação de Senha - NossoZelo',
                html,
            });
            console.log(`[LOG-FLUXO] Sucesso: Disparo de e-mail concluído para ${email}. Operação finalizada com êxito.`);
            return {
                mensagem: 'E-mail de recuperação enviado com sucesso',
            };
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Exceção capturada no fluxo de recuperação para ${email}: ${error.message || error}.`);
            // Re-lançamento da exceção para tratamento no controller
            throw error;
        }
    }
}
exports.ServiceRecuperacaoSenha = ServiceRecuperacaoSenha;
class ServiceRecuperacaoSenhaDefault extends ServiceRecuperacaoSenha {
}
exports.ServiceRecuperacaoSenhaDefault = ServiceRecuperacaoSenhaDefault;
exports.default = ServiceRecuperacaoSenha;
