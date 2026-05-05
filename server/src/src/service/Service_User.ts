/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela orquestração de operações de negócio relacionadas ao usuário,
 * incluindo criação com perfis específicos, geolocalização, integração de e-mail e persistência de dados.
 * @rota server\src\src\service\Service_User.ts
 */

import ServiceCrud from './Service_Crud';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { GeolocalizacaoService } from './Service_Localizacao';
import { STATUS_CADASTRO_USUARIO } from '../constants/financeiro';
import { senhaForte } from '../validator/create/Validator_User';
import prisma from '../lib/prisma';
import { UsuarioAutenticado } from '../types/auth';

type CadastroError = Error & { status?: number };

function criarErroCadastro(
  mensagem: string,
  status = 400,
): CadastroError {
  const erro = new Error(mensagem) as CadastroError;
  erro.status = status;
  return erro;
}

function removerSenha(usuario: Record<string, any>) {
  const { senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

function numeroDecimalOpcional(valor: unknown) {
  if (valor === undefined || valor === null || valor === '') {
    return undefined;
  }
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : undefined;
}

function anosExperiencia(valor: unknown) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0
    ? numero
    : 0;
}

function montarDadosProfissionais(dados: any = {}) {
  return {
    bio: dados.bio || '',
    anos_experiencia: anosExperiencia(dados.experiencia),
    valor_hora: numeroDecimalOpcional(dados.valorHora),
    valor_diaria: numeroDecimalOpcional(dados.valorDiaria),
    disponibilidade: dados.disponibilidade || null,
    especialidades: dados.especialidades || null,
    documentos: dados.documentos || null,
  };
}

function ehTipoPrestador(tipo?: string) {
  return ['cuidador', 'enfermeiro', 'acompanhante'].includes(tipo || '');
}

function sanitizarAtualizacaoUsuario(
  usuario: Record<string, any>,
  ator?: UsuarioAutenticado,
) {
  const dados = { ...usuario };
  delete dados.senha;

  if (ator?.tipo !== 'admin') {
    delete dados.tipo;
    delete dados.status_cadastro;
    delete dados.email_confirmado;
    delete dados.cpf;
  }

  return dados;
}

function statusCadastroInicial(tipo?: string) {
  if (ehTipoPrestador(tipo)) {
    return STATUS_CADASTRO_USUARIO.pendente_pagamento;
  }

  return STATUS_CADASTRO_USUARIO.ativo;
}

class ServiceUser {
  /**
   * Cria um usuário completo, incluindo geolocalização, perfil específico e envio de e-mail.
   * Implementa lógica de rollback em caso de falha.
   * * @param {any} data - Objeto contendo dados do usuário e perfis específicos (enfermeiro, cuidador, acompanhante, admin).
   * @returns {Promise<any>} - Retorna o objeto do usuário criado e perfis associados.
   * @throws {Error} - Lança erro em caso de falha na validação, persistência ou violação de constraints.
   */
  static async criarUsuarioComTipo(data: any) {    const {
      usuario,
      enfermeiro,
      cuidador,
      acompanhante,
      admin,
    } = data;
    const emailConfirmadoInicial = true;
    const criacaoAdminAutorizada = data.criacaoAdminAutorizada === true;

    let id = '';

    try {
      // Geração de identificador único
      id = nanoid(20);  const senhaCriptografada = await bcrypt.hash(
        usuario.senha,
        10,
      );      let dataNascimentoObj: Date | undefined;
      if (usuario.data_nascimento) {        dataNascimentoObj = new Date(
          usuario.data_nascimento,
        );

        if (isNaN(dataNascimentoObj.getTime())) {          throw criarErroCadastro('data_nascimento invalida');
        }      }

      if (usuario.tipo === 'admin' && !criacaoAdminAutorizada) {
        throw criarErroCadastro(
          'Cadastro de administrador nao permitido por este fluxo.',
          403,
        );
      }

      // 1. CRIAÇÃO DO USUÁRIO BASE
      const usuarioData = {
        ...usuario,
        id,
        senha: senhaCriptografada,
        email_confirmado: emailConfirmadoInicial,
        status_cadastro: ehTipoPrestador(usuario.tipo)
          ? STATUS_CADASTRO_USUARIO.pendente_pagamento
          : usuario.status_cadastro || statusCadastroInicial(usuario.tipo),
        data_nascimento: dataNascimentoObj,
      };      await ServiceCrud.create('usuarios', usuarioData);      // 2. GEOLOCALIZAÇÃO (Resiliente a falhas)
      try {        const geolocalizacao =
          await GeolocalizacaoService.buscarCoordenadasPorCep(
            usuario.cep,
          );        await ServiceCrud.create('localizacoes', {
          usuario_id: id,
          latitude: geolocalizacao.latitude,
          longitude: geolocalizacao.longitude,
        });      } catch (geoError: any) {      }      if (usuario.tipo === 'enfermeiro') {
        const docCoren =
          enfermeiro?.coren ||
          enfermeiro?.documento_professional;        if (!docCoren) {          throw criarErroCadastro(
            'COREN/Registro obrigatório para enfermeiros.',
          );
        }

        await ServiceCrud.create('enfermeiros', {
          ...montarDadosProfissionais(enfermeiro),
          usuario_id: id,
          coren: docCoren,
          especialidade:
            enfermeiro?.especialidade ||
            enfermeiro?.especialidades ||
            null,
        });      } else if (usuario.tipo === 'cuidador') {        await ServiceCrud.create('cuidadores', {
          ...montarDadosProfissionais(cuidador),
          usuario_id: id,
          documento_profissional:
            cuidador?.documento_profissional ||
            cuidador?.documento_professional ||
            null,
        });      } else if (usuario.tipo === 'acompanhante') {        await ServiceCrud.create('acompanhantes', {
          ...montarDadosProfissionais(acompanhante),
          usuario_id: id,
        });      } else if (usuario.tipo === 'admin') {        await ServiceCrud.create('admins', {
          usuario_id: id,
          ...admin,
        });      } else if (usuario.tipo !== 'cliente') {        throw criarErroCadastro(
          `Tipo de usuário inválido: ${usuario.tipo}`,
        );
      } else {      }

      const avisoConfirmacaoEmail: string | null = null;
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw criarErroCadastro(
          'Configuracao de seguranca ausente para gerar token temporario de upload.',
          500,
        );
      }

      const uploadToken = sign(
        {
          id,
          tipo: usuario.tipo,
          purpose: 'cadastro_upload',
        },
        jwtSecret,
        { expiresIn: '30m' },
      );

      return {
        data: removerSenha(usuarioData),
        uploadToken,
        enfermeiro,
        cuidador,
        acompanhante,
        admin,
        aviso_confirmacao_email: avisoConfirmacaoEmail,
      };
    } catch (error: any) {      // 5. TRADUÇÃO DE ERROS DO PRISMA / DB
      let mensagemAmigavel =
        'Não foi possível criar o usuário.';

      let statusAmigavel = error.status || 500;

      if (error.code === 'P2002') {
        statusAmigavel = 409;
        const alvo = error.meta?.target;        if (alvo && alvo.includes('email')) {
          mensagemAmigavel =
            'Este e-mail já está cadastrado no sistema.';
        } else if (alvo && alvo.includes('cpf')) {
          mensagemAmigavel =
            'Este CPF já está cadastrado no sistema.';
        } else {
          mensagemAmigavel =
            'Já existe um cadastro com estes dados únicos.';
        }
      } else {
        mensagemAmigavel =
          error.message || 'Erro interno no servidor.';
      }

      // Lógica de Rollback Manual para garantir consistência em caso de erro no meio do processo
      if (id) {        try {
          await ServiceCrud.delete('usuarios', id);        } catch (rollbackError: any) {
          if (rollbackError.code !== 'P2025') {          } else {          }
        }
      }

      throw criarErroCadastro(mensagemAmigavel, statusAmigavel);
    }
  }

  /**
   * Stub para o método de validação de e-mail.
   * Atualmente apenas registra a intenção de execução.
   * * @returns {Promise<void>}
   */
  static async validarEmail() {  }

  /**
   * Busca um perfil de usuário completo, agregando dados da tabela base e tabelas de perfil satélites.
   * * @param {string} id - UUID/NanoID do usuário.
   * @returns {Promise<any>} - Objeto com dados básicos e perfil detalhado enriquecido.
   * @throws {Error} - Lança erro caso usuário não seja localizado.
   */
  static async buscarUsuarioCompleto(id: string) {    try {      const usuarioBase = await ServiceCrud.findById(
        'usuarios',
        id,
      );

      if (!usuarioBase) {        throw new Error('Usuário não encontrado.');
      }      let dadosExtras = null;

      // Verificação condicional de tabelas satélites baseada no tipo
      if (usuarioBase.tipo === 'enfermeiro') {        dadosExtras = await ServiceCrud.findFirst(
          'enfermeiros',
          { usuario_id: id },
        );
      } else if (usuarioBase.tipo === 'cuidador') {        dadosExtras = await ServiceCrud.findFirst(
          'cuidadores',
          { usuario_id: id },
        );
      } else if (usuarioBase.tipo === 'acompanhante') {        dadosExtras = await ServiceCrud.findFirst(
          'acompanhantes',
          { usuario_id: id },
        );
      }      // LGPD: Remoção de dados sensíveis antes de retornar ao controller
      const { senha, ...usuarioSemSenha } = usuarioBase;      return {
        ...usuarioSemSenha,
        perfil: dadosExtras,
      };
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Atualiza os dados de um usuário e seu respectivo perfil satélite.
   * * @param {string} id - Identificador do usuário.
   * @param {any} data - Objeto contendo chaves 'usuario' e/ou 'perfil' para atualização.
   * @returns {Promise<any>} - Retorna o perfil completo e atualizado.
   */
  static async atualizarUsuario(
    id: string,
    data: any,
    ator?: UsuarioAutenticado,
  ) {    try {
      const { usuario, perfil } = data;

      // Proteção de segurança: Senhas devem ser tratadas pelo método especializado atualizarSenha
      const usuarioSeguro = usuario
        ? sanitizarAtualizacaoUsuario(usuario, ator)
        : null;

      if (usuarioSeguro && Object.keys(usuarioSeguro).length > 0) {        await ServiceCrud.update('usuarios', id, usuarioSeguro);      }      const usuarioAtual = await ServiceCrud.findById(
        'usuarios',
        id,
      );
      const tipo = usuarioAtual.tipo;

      if (perfil) {
        let tabelaExtra = '';
        if (tipo === 'enfermeiro')
          tabelaExtra = 'enfermeiros';
        else if (tipo === 'cuidador')
          tabelaExtra = 'cuidadores';
        else if (tipo === 'acompanhante')
          tabelaExtra = 'acompanhantes';

        if (tabelaExtra) {          const registroExtra = await ServiceCrud.findFirst(
            tabelaExtra,
            { usuario_id: id },
          );

          if (registroExtra) {            await ServiceCrud.update(
              tabelaExtra,
              id,
              perfil,
            );          } else {          }
        }
      }      return this.buscarUsuarioCompleto(id);
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Atualiza a senha de um usuário após aplicar hash criptográfico.
   * * @param {string} id - Identificador do usuário.
   * @param {string} novaSenha - Senha em texto plano.
   * @returns {Promise<any>} - Objeto do banco com resultado da atualização.
   * @throws {Error} - Lança erro caso a senha seja inválida.
   */
  static async atualizarSenha(
    id: string,
    novaSenha: string,
    senhaAtual?: string,
    exigirSenhaAtual = true,
  ) {    try {
      if (exigirSenhaAtual) {
        if (!senhaAtual) {
          throw new Error('Senha atual e obrigatoria.');
        }

        const usuario = await prisma.usuarios.findUnique({
          where: { id },
          select: { senha: true },
        });

        if (!usuario) {
          throw new Error('Usuario nao encontrado.');
        }

        const senhaAtualValida = await bcrypt.compare(
          senhaAtual,
          usuario.senha,
        );

        if (!senhaAtualValida) {
          throw new Error('Senha atual invalida.');
        }
      }

      if (!senhaForte(novaSenha)) {        throw new Error(
          'Senha deve ter 8 a 72 caracteres, com letra maiuscula, minuscula, numero e caractere especial.',
        );
      }      const senhaCriptografada = await bcrypt.hash(
        novaSenha,
        10,
      );      const result = await ServiceCrud.update(
        'usuarios',
        id,
        { senha: senhaCriptografada },
      );      return result;
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Deleta um usuário e propaga a exclusão para dados dependentes (Cascade).
   * * @param {string} id - Identificador do usuário.
   * @returns {Promise<any>} - Resultado da operação de deleção.
   */
  static async deletarUsuario(id: string) {    try {      const result = await ServiceCrud.delete(
        'usuarios',
        id,
      );      return result;
    } catch (error: any) {      throw error;
    }
  }
}

export default ServiceUser;
