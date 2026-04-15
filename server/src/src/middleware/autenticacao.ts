/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Middleware de segurança responsável por interceptar requisições a rotas protegidas,
 * validar a presença e integridade de tokens JWT e autorizar o acesso aos recursos do sistema.
 * @rota server\src\src\middleware\autenticacao.ts
 */

import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

/**
 * Chave secreta para validação de tokens, recuperada das variáveis de ambiente.
 */
const JWT_SECRET =
  process.env.JWT_SECRET || 'sua-chave-secreta';

/**
 * Intercepta a requisição para verificar a validade do token de autenticação no cabeçalho.
 * @param {Request} req - Objeto de requisição do Express.
 * @param {Response} res - Objeto de resposta do Express.
 * @param {NextFunction} next - Função de callback para transição de middleware.
 * @returns {void | Response} - Retorna 401 se não autorizado ou prossegue para o próximo handler.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(
    `[LOG-FLUXO] authMiddleware: Iniciando verificação de autorização para a rota: ${req.originalUrl}`,
  );

  const authHeader = req.headers.authorization;

  // Ramificação condicional: Verificação de presença do Header
  if (!authHeader) {
    console.warn(
      `[LOG-FLUXO] Bloqueio de Acesso: Cabeçalho 'authorization' não encontrado na requisição vinda de ${req.ip}.`,
    );
    return res
      .status(401)
      .json({ error: 'Token não fornecido' });
  }

  console.log(
    '[LOG-FLUXO] Cabeçalho de autorização detectado. Extraindo token Bearer.',
  );

  // Extração do token mantendo nomenclatura original
  const [, token] = authHeader.split(' ');

  try {
    console.log(
      '[LOG-FLUXO] Solicitando validação criptográfica do token via jsonwebtoken (verify).',
    );

    // Operação de validação
    const decoded = verify(token, JWT_SECRET);

    /**
     * Injeta os dados decodificados (payload do JWT) no objeto de requisição para uso posterior.
     * Mantendo o cast 'as any' conforme padrão original.
     */
    (req as any).user = decoded;

    console.log(
      `[LOG-FLUXO] Autorização bem-sucedida. Usuário autenticado vinculado à requisição. Prosseguindo fluxo.`,
    );

    // Prossegue para o próximo middleware/controller
    return next();
  } catch (error: any) {
    console.error(
      `[ERRO-FLUXO] Falha na validação do token JWT: ${
        error.message ||
        'Token inválido ou assinatura corrompida'
      }. Rejeitando acesso.`,
    );

    return res
      .status(401)
      .json({ error: 'Token inválido ou expirado' });
  }
}
