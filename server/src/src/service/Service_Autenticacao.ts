import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL as string,
});

const JWT_SECRET =
  process.env.JWT_SECRET || 'sua-chave-secreta';

export class ServiceAuth {
  static async login(data: {
    identificador: string;
    senha: string;
  }) {
    const isEmail = data.identificador.includes('@');

    const user = await prisma.usuarios.findUnique({
      where: isEmail
        ? { email: data.identificador }
        : { cpf: data.identificador },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const issenhaValid = await compare(
      data.senha,
      user.senha,
    );

    if (!issenhaValid) {
      throw new Error('Senha inválida');
    }

    const token = sign(
      {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
      JWT_SECRET,
      { expiresIn: '2h' },
    );

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
      },
    };
  }
  static async pedido_troca_senha() {}
  static async trocar_senha() {}
}

export default ServiceAuth;
