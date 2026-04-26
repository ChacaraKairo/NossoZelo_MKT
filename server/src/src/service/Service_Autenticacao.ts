import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

const TEMPO_SESSAO_LOGIN = '7d';

function obterJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET nao configurado. Login indisponivel ate o ambiente ser corrigido.',
    );
  }

  return jwtSecret;
}

function mascararIdentificador(identificador: string) {
  if (identificador.includes('@')) {
    return identificador.replace(/^(.{2}).*(@.*)$/, '$1***$2');
  }

  return `***${identificador.replace(/\D/g, '').slice(-4)}`;
}

export class ServiceAuth {
  static async login(data: {
    identificador: string;
    senha: string;
  }) {
    const identificador = String(data.identificador || '').trim();
    const identificadorLog = mascararIdentificador(identificador);
    const isEmail = identificador.includes('@');

    logger.info('AuthService: iniciando login', {
      identificador: identificadorLog,
      tipoIdentificador: isEmail ? 'email' : 'cpf',
    });

    try {
      const user = await prisma.usuarios.findUnique({
        where: isEmail ? { email: identificador } : { cpf: identificador },
        select: {
          id: true,
          nome: true,
          email: true,
          tipo: true,
          senha: true,
        },
      });

      if (!user) {
        logger.warn('AuthService: usuário não encontrado', {
          identificador: identificadorLog,
        });
        throw new Error('Usuário ou senha inválidos.');
      }

      const senhaValida = await compare(data.senha, user.senha);

      if (!senhaValida) {
        logger.warn('AuthService: senha inválida', {
          usuarioId: user.id,
          tipo: user.tipo,
        });
        throw new Error('Usuário ou senha inválidos.');
      }

      const token = sign(
        {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
        },
        obterJwtSecret(),
        { expiresIn: TEMPO_SESSAO_LOGIN },
      );

      logger.info('AuthService: login concluído', {
        usuarioId: user.id,
        tipo: user.tipo,
        expiraEm: TEMPO_SESSAO_LOGIN,
      });

      return {
        token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo,
        },
      };
    } catch (error: any) {
      logger.warn('AuthService: falha no login', {
        identificador: identificadorLog,
        erro: error?.message || 'Erro desconhecido',
      });
      throw error;
    }
  }
}

export default ServiceAuth;
