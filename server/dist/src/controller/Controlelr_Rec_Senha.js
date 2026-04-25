"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller responsável por gerenciar as requisições HTTP para recuperação de credenciais,
 * recebendo solicitações de redefinição e acionando o envio de e-mails de segurança via ServiceRecuperacaoSenha.
 * @rota server\src\src\controller\Controlelr_Rec_Senha.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecuperacaoSenhaController = void 0;
const Service_Rec_Senha_1 = __importDefault(require("../service/Service_Rec_Senha"));
class RecuperacaoSenhaController {
    /**
     * Endpoint para disparar o processo de recuperação de senha por e-mail.
     * @param {Request} req - Requisição contendo o campo 'email' no corpo (body).
     * @param {Response} res - Resposta HTTP 200 em caso de sucesso no disparo.
     * @returns {Promise<Response>}
     */
    static async enviarEmail(req, res) {
        const { email } = req.body;
        console.log(`[LOG-FLUXO] Iniciando enviarEmail no RecuperacaoSenhaController. Alvo: ${email}`);
        try {
            // Validação básica de entrada (Fail Fast)
            if (!email) {
                console.warn('[LOG-FLUXO] Tentativa de recuperação abortada: E-mail não fornecido no corpo da requisição.');
                return res
                    .status(400)
                    .json({ erro: 'O campo e-mail é obrigatório.' });
            }
            console.log(`[LOG-FLUXO] Solicitando geração de token e disparo de e-mail ao ServiceRecuperacaoSenha para: ${email}`);
            // Operação assíncrona: Chamada ao serviço especializado
            const resultado = await Service_Rec_Senha_1.default.enviarEmailRecuperacao(email);
            console.log(`[LOG-FLUXO] Sucesso: Fluxo de recuperação concluído para ${email}. Resposta do serviço: ${JSON.stringify(resultado)}`);
            return res.status(200).json(resultado);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha no Controller ao processar recuperação para ${email}: ${error.message || error}`);
            // Retorno de erro com status 400 (Bad Request) conforme padrão original
            return res.status(400).json({
                erro: error.message ||
                    'Erro ao enviar e-mail de recuperação',
            });
        }
    }
}
exports.RecuperacaoSenhaController = RecuperacaoSenhaController;
exports.default = RecuperacaoSenhaController;
