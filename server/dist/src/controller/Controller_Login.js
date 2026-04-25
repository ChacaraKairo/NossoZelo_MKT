"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller responsável por gerenciar as requisições HTTP de autenticação,
 * mediando o acesso ao sistema através da validação de credenciais e emissão de tokens.
 * @rota server\src\src\controller\Controller_Login.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const Service_Autenticacao_1 = require("../service/Service_Autenticacao");
class AuthController {
    /**
     * Endpoint para realizar o login do usuário.
     * Valida a presença de credenciais e delega a verificação lógica ao ServiceAuth.
     * @param {Request} req - Objeto de requisição contendo identificador (E-mail/CPF) e senha no body.
     * @param {Response} res - Objeto de resposta HTTP.
     * @returns {Promise<Response>} - Retorna os dados do usuário e o token JWT ou erro de autenticação.
     */
    static async login(req, res) {
        console.log(`[LOG-FLUXO] Iniciando processo de login no AuthController.`);
        try {
            const { identificador, senha } = req.body;
            // Ramificação condicional: Validação de presença de dados obrigatórios (Fail Fast)
            if (!identificador || !senha) {
                console.error(`[ERRO-FLUXO] Falha na requisição de login: Identificador ou senha não fornecidos no payload.`);
                return res.status(400).json({
                    error: 'Identificador e senha são obrigatórios.',
                });
            }
            console.log(`[LOG-FLUXO] Credenciais recebidas para o identificador: ${identificador}. Solicitando validação ao ServiceAuth.`);
            // Operação assíncrona: Chamada ao serviço de autenticação
            console.log(`[LOG-FLUXO] Invocando ServiceAuth.login...`);
            const result = await Service_Autenticacao_1.ServiceAuth.login({
                identificador,
                senha,
            });
            console.log(`[LOG-FLUXO] Autenticação bem-sucedida para: ${identificador}. Preparando resposta HTTP 200.`);
            // Retorno de sucesso com os dados da sessão
            return res.status(200).json(result);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha na tentativa de login: ${error.message || error}. Retornando status 401.`);
            // Em controllers de autenticação, erros de negócio costumam resultar em 401 (Unauthorized)
            return res.status(401).json({ error: error.message });
        }
    }
}
exports.AuthController = AuthController;
exports.default = AuthController;
