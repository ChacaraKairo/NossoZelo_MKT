/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Middleware de interceptação responsável por validar a integridade dos dados de entrada (DTO)
 * antes que a requisição chegue à camada de controle, garantindo que apenas payloads válidos sejam processados.
 * @rota server\src\src\middleware\user.ts
 */

import { Request, Response, NextFunction } from 'express';
import { validarCreateUsuarioDto } from '../validator/create/Validator_User';

/**
 * Realiza a validação do corpo da requisição utilizando o DTO de criação de usuário.
 * @param {Request} req - Objeto de requisição do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função de callback para transição de middleware.
 * @returns {void | Response} - Retorna 400 se inválido ou prossegue para o próximo handler.
 */
export function validarUsuario(
  req: Request,
  res: Response,
  next: NextFunction,
) {  try {    // Execução da validação lógica mantendo nomes de variáveis originais
    const { valid, erros } = validarCreateUsuarioDto(
      req.body,
    );

    // Ramificação condicional: Verificação de integridade (Fail Fast)
    if (!valid) {  return res.status(400).json({
        error: 'Erro de validacao',
        message: 'Erro de validacao',
        mensagem: 'Erro de validação',
        erros,
      });
    }    // Prossegue para o próximo middleware/controller
    next();
  } catch (error: any) {    return res.status(500).json({
      error: 'Erro interno no processo de validacao.',
      message: 'Erro interno no processo de validacao.',
      mensagem: 'Erro interno no processo de validação.',
      detalhes: error.message,
    });
  }
}
