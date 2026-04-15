/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela gestão de segurança e identidade,
 * lidando com o processo de login (E-mail/CPF), validação criptográfica de senhas
 * e emissão de tokens JWT para autorização.
 * @rota server\src\src\service\Service_Autenticacao.ts
 */

import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

console.log(
  '[LOG-FLUXO] Inicializando PrismaClient no ServiceAuth com configuração de datasourceUrl.',
);
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL as string,
});

const JWT_SECRET =
  process.env.JWT_SECRET || 'sua-chave-secreta';

export class ServiceAuth {
  /**
   * Realiza a autenticação do usuário validando as credenciais (E-mail ou CPF).
   * @param {object} data - Objeto contendo identificador e senha.
   * @param {string} data.identificador - E-mail ou CPF do usuário.
   * @param {string} data.senha - Senha em texto plano.
   * @returns {Promise<any>} - Retorna o token JWT e dados básicos do usuário autenticado.
   * @throws {Error} - Lança erro caso o usuário não exista ou a senha seja inválida.
   */
  static async login(data: {
    identificador: string;
    senha: string;
  }) {
    console.log(
      `[LOG-FLUXO] Iniciando método login para o identificador: ${data.identificador}`,
    );

    try {
      console.log(
        '[LOG-FLUXO] Detectando padrão do identificador (Regex/@).',
      );
      const isEmail = data.identificador.includes('@');
      console.log(
        `[LOG-FLUXO] Tipo de identificador detectado: ${
          isEmail ? 'E-mail' : 'CPF'
        }.`,
      );

      console.log(
        `[LOG-FLUXO] Consultando entidade 'usuarios' no banco de dados para o valor: ${data.identificador}`,
      );

      // Chamada assíncrona ao Prisma mantendo a estrutura original
      const user = await prisma.usuarios.findUnique({
        where: isEmail
          ? { email: data.identificador }
          : { cpf: data.identificador },
      });

      // Ramificação condicional: Verificação de existência
      if (!user) {
        console.error(
          `[ERRO-FLUXO] Falha no Login: Usuário com identificador '${data.identificador}' não foi localizado na base de dados.`,
        );
        throw new Error('Usuário não encontrado');
      }

      console.log(
        `[LOG-FLUXO] Usuário ID ${user.id} localizado. Tipo: ${user.tipo}. Iniciando verificação de integridade da senha.`,
      );

      console.log(
        '[LOG-FLUXO] Comparando hash da senha armazenada com a senha fornecida via bcrypt.compare.',
      );

      // Comparação criptográfica mantendo o nome da variável issenhaValid
      const issenhaValid = await compare(
        data.senha,
        user.senha,
      );

      // Ramificação condicional: Validação de senha
      if (!issenhaValid) {
        console.error(
          `[ERRO-FLUXO] Falha no Login: Senha divergente fornecida para o usuário ID: ${user.id}.`,
        );
        throw new Error('Senha inválida');
      }

      console.log(
        `[LOG-FLUXO] Credenciais validadas com êxito para o usuário: ${user.nome} (ID: ${user.id}).`,
      );

      console.log(
        `[LOG-FLUXO] Iniciando assinatura do token JWT (Expiração: 2h) com os claims de identidade.`,
      );

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

      console.log(
        `[LOG-FLUXO] Autenticação concluída com sucesso. Token gerado para o perfil do tipo: ${user.tipo}.`,
      );

      // Retorno do payload final para o controller
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
      console.error(
        `[ERRO-FLUXO] Falha crítica no fluxo de login para o identificador ${
          data.identificador
        }. Detalhes: ${error.message || error}`,
      );
      throw error;
    }
  }

  /**
   * Registra a intenção de troca de senha no sistema.
   * @returns {Promise<void>}
   */
  static async pedido_troca_senha() {
    console.log(
      '[LOG-FLUXO] Iniciando execução do método pedido_troca_senha.',
    );
    try {
      // Nota: Log de stub para futura implementação de lógica de tokens de redefinição
      console.log(
        '[LOG-FLUXO] Pedido de troca de senha processado como stub (Aguardando implementação lógica).',
      );
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao processar pedido de troca de senha: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Efetiva a alteração definitiva da senha na base de dados.
   * @returns {Promise<void>}
   */
  static async trocar_senha() {
    console.log(
      '[LOG-FLUXO] Iniciando execução do método trocar_senha.',
    );
    try {
      // Nota: Log de stub para futura implementação da alteração física via Prisma
      console.log(
        '[LOG-FLUXO] Troca de senha concluída como stub (Sucesso simulado).',
      );
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha na efetivação da troca de senha: ${error.message}`,
      );
      throw error;
    }
  }
}

export default ServiceAuth;
