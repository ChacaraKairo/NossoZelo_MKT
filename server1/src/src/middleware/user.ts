import { Request, Response, NextFunction } from 'express';
import { validarCreateUsuarioDto } from '../validator/create/Validator_User'; // ajuste o caminho

export function validarUsuario(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { valid, erros } = validarCreateUsuarioDto(
    req.body,
  );

  if (!valid) {
    return res.status(400).json({
      mensagem: 'Erro de validação',
      erros,
    });
  }

  next();
}
