"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Middleware de interceptação responsável por validar a integridade dos dados de entrada (DTO)
 * antes que a requisição chegue à camada de controle, garantindo que apenas payloads válidos sejam processados.
 * @rota server\src\src\middleware\user.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarUsuario = validarUsuario;
const Validator_User_1 = require("../validator/create/Validator_User");
/**
 * Realiza a validação do corpo da requisição utilizando o DTO de criação de usuário.
 * @param {Request} req - Objeto de requisição do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função de callback para transição de middleware.
 * @returns {void | Response} - Retorna 400 se inválido ou prossegue para o próximo handler.
 */
function validarUsuario(req, res, next) {
    console.log(`[LOG-FLUXO] Middleware validarUsuario: Iniciando interceptação de payload para o identificador: ${req.body?.usuario?.email || req.body?.email || 'N/A'}`);
    try {
        console.log('[LOG-FLUXO] Invocando validarCreateUsuarioDto para análise lógica dos campos.');
        // Execução da validação lógica mantendo nomes de variáveis originais
        const { valid, erros } = (0, Validator_User_1.validarCreateUsuarioDto)(req.body);
        // Ramificação condicional: Verificação de integridade (Fail Fast)
        if (!valid) {
            console.warn(`[LOG-FLUXO] Bloqueio em Middleware: O payload enviado contém ${Object.keys(erros).length} inconsistência(s).`);
            console.error(`[ERRO-FLUXO] Detalhes da rejeição no middleware: ${JSON.stringify(erros)}`);
            return res.status(400).json({
                mensagem: 'Erro de validação',
                erros,
            });
        }
        console.log('[LOG-FLUXO] Validação bem-sucedida. Liberando requisição para a camada de Controller.');
        // Prossegue para o próximo middleware/controller
        next();
    }
    catch (error) {
        console.error(`[ERRO-FLUXO] Exceção inesperada durante a interceptação de validação: ${error.message || error}`);
        return res.status(500).json({
            mensagem: 'Erro interno no processo de validação.',
            detalhes: error.message,
        });
    }
}
