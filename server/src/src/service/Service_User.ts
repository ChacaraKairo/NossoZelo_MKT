/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pela orquestração de operações de negócio relacionadas ao usuário,
 * incluindo criação com perfis específicos, geolocalização, integração de e-mail e persistência de dados.
 * @rota server\src\src\service\Service_User.ts
 */

import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { EmailService } from './Service_Email';
import { GeolocalizacaoService } from './Service_Localizacao';
import ServiceConfirmacaoEmail from './Service_ConfirmacaoEmail';
import { STATUS_CADASTRO_USUARIO } from '../constants/financeiro';
import { TIPOS_PRESTADOR } from '../constants/dominio';
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

const PERFIS_PRESTADOR: Record<string, string> = {
  cuidador: 'cuidadores',
  enfermeiro: 'enfermeiros',
  acompanhante: 'acompanhantes',
  baba: 'babas',
  diarista: 'diaristas',
  motorista_assistencial: 'motoristas_assistenciais',
};

function ehTipoPrestador(tipo?: string) {
  return TIPOS_PRESTADOR.includes(tipo as any);
}

function normalizarPlaca(valor: unknown) {
  return String(valor || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function placaValida(placa: string) {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa);
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

const TERMOS_VERSAO = '2026-05-mvp';
const PRIVACIDADE_VERSAO = '2026-05-mvp';
const COOKIES_VERSAO = '2026-05-mvp';

function validouAceiteLegal(data: any) {
  return (
    data?.aceitouTermos === true ||
    data?.aceitou_termos === true ||
    data?.usuario?.aceitouTermos === true ||
    data?.usuario?.aceitou_termos === true
  );
}

async function criarRegistroInterno(entity: string, data: object) {
  return (prisma as any)[entity].create({ data });
}

function perfilPrestadorDelegate(tipo: string) {
  const tabela = PERFIS_PRESTADOR[tipo];
  return tabela ? (prisma as any)[tabela] : null;
}

class ServiceUser {
  /**
   * Cria um usuário completo, incluindo geolocalização, perfil específico e envio de e-mail.
   * Implementa lógica de rollback em caso de falha.
   * * @param {any} data - Objeto contendo dados do usuário e perfis específicos (enfermeiro, cuidador, acompanhante, baba, diarista, motorista_assistencial, admin).
   * @returns {Promise<any>} - Retorna o objeto do usuário criado e perfis associados.
   * @throws {Error} - Lança erro em caso de falha na validação, persistência ou violação de constraints.
   */
  static async criarUsuarioComTipo(data: any) {    const {
      usuario,
      enfermeiro,
      cuidador,
      acompanhante,
      baba,
      diarista,
      motorista_assistencial,
      admin,
    } = data;
    const emailConfirmadoInicial = data.emailConfirmadoInicial === true;
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

      if (!criacaoAdminAutorizada && !validouAceiteLegal(data)) {
        throw criarErroCadastro(
          'Voce precisa aceitar os Termos de Uso e a Politica de Privacidade para criar sua conta.',
          400,
        );
      }

      const dataAceiteLegal = new Date();

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
        termos_aceitos_em: dataAceiteLegal,
        termos_versao: TERMOS_VERSAO,
        privacidade_aceita_em: dataAceiteLegal,
        privacidade_versao: PRIVACIDADE_VERSAO,
        cookies_aceitos_em:
          data.aceitouCookies === true || data.aceitou_cookies === true
            ? dataAceiteLegal
            : null,
        cookies_versao:
          data.aceitouCookies === true || data.aceitou_cookies === true
            ? COOKIES_VERSAO
            : null,
      };      await criarRegistroInterno('usuarios', usuarioData);      // 2. GEOLOCALIZAÇÃO (Resiliente a falhas)
      try {        const geolocalizacao =
          await GeolocalizacaoService.buscarCoordenadasPorCep(
            usuario.cep,
          );        await criarRegistroInterno('localizacoes', {
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

        await criarRegistroInterno('enfermeiros', {
          ...montarDadosProfissionais(enfermeiro),
          usuario_id: id,
          coren: docCoren,
          especialidade:
            enfermeiro?.especialidade ||
            enfermeiro?.especialidades ||
            null,
        });      } else if (usuario.tipo === 'cuidador') {        await criarRegistroInterno('cuidadores', {
          ...montarDadosProfissionais(cuidador),
          usuario_id: id,
          documento_profissional:
            cuidador?.documento_profissional ||
            cuidador?.documento_professional ||
            null,
        });      } else if (usuario.tipo === 'acompanhante') {        await criarRegistroInterno('acompanhantes', {
          ...montarDadosProfissionais(acompanhante),
          usuario_id: id,
        });      } else if (usuario.tipo === 'baba') {        await criarRegistroInterno('babas', {
          ...montarDadosProfissionais(baba),
          usuario_id: id,
        });      } else if (usuario.tipo === 'diarista') {        await criarRegistroInterno('diaristas', {
          ...montarDadosProfissionais(diarista),
          usuario_id: id,
        });      } else if (usuario.tipo === 'motorista_assistencial') {
        const placa = normalizarPlaca(motorista_assistencial?.placa);
        if (!placaValida(placa)) {
          throw criarErroCadastro(
            'Placa obrigatoria para motorista assistencial. Use o formato ABC1234 ou ABC1D23.',
          );
        }

        await criarRegistroInterno('motoristas_assistenciais', {
          ...montarDadosProfissionais(motorista_assistencial),
          usuario_id: id,
          placa,
        });      } else if (usuario.tipo === 'admin') {        await criarRegistroInterno('admins', {
          usuario_id: id,
          ...admin,
        });      } else if (usuario.tipo !== 'cliente') {        throw criarErroCadastro(
          `Tipo de usuário inválido: ${usuario.tipo}`,
        );
      } else {      }

      // 4. ENVIO DE E-MAIL (Background)
      let avisoConfirmacaoEmail: string | null = null;
      try {
        if (!usuarioData.email_confirmado) {
          await ServiceConfirmacaoEmail.enviarEmailConfirmacao(id);
        } else {
          const emailService = new EmailService();
          const templatePath = path.join(
            __dirname,
            '../../HTML/emails/cadastro.html',
          );

          if (fs.existsSync(templatePath)) {
            let html = fs.readFileSync(templatePath, 'utf-8');

            html = html
              .replace('{{nome}}', usuario.nome)
              .replace(
                '{{link}}',
                'https://devmarkt.com.br/login',
              );

            emailService
              .send(
                usuario.email,
                'Bem-vindo ao Nosso Zelo!',
                html,
              )
              .catch((err) =>
                {},
              );
          }
        }
      } catch (emailErr: any) {        avisoConfirmacaoEmail =
          'Conta criada, mas nao foi possivel enviar o e-mail de confirmacao. Voce pode reenviar pelo perfil.';
      }      const jwtSecret = process.env.JWT_SECRET;
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
        baba,
        diarista,
        motorista_assistencial,
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
          await prisma.usuarios.delete({ where: { id } });        } catch (rollbackError: any) {
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
  static async buscarUsuarioCompleto(id: string) {    try {      const usuarioBase = await prisma.usuarios.findUnique({
        where: { id },
      });

      if (!usuarioBase) {        throw new Error('Usuário não encontrado.');
      }      let dadosExtras = null;

      // Verificação condicional de tabelas satélites baseada no tipo
      const perfilDelegate = perfilPrestadorDelegate(usuarioBase.tipo);
      if (perfilDelegate) {        dadosExtras = await perfilDelegate.findUnique({
          where: { usuario_id: id },
        });
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

      if (usuarioSeguro && Object.keys(usuarioSeguro).length > 0) {        await prisma.usuarios.update({
          where: { id },
          data: usuarioSeguro,
        });      }      const usuarioAtual = await prisma.usuarios.findUnique({
        where: { id },
      });

      if (!usuarioAtual) {
        throw new Error('Usuário não encontrado.');
      }

      const tipo = usuarioAtual.tipo;

      if (perfil) {
        const perfilDelegate = perfilPrestadorDelegate(tipo);

        if (perfilDelegate) {          const registroExtra = await perfilDelegate.findUnique({
            where: { usuario_id: id },
          });

          if (registroExtra) {            await perfilDelegate.update({
              where: { usuario_id: id },
              data: perfil,
            });          } else {            await perfilDelegate.create({
              data: {
                usuario_id: id,
                ...perfil,
              },
            });          }
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
      );      const result = await prisma.usuarios.update({
        where: { id },
        data: { senha: senhaCriptografada },
      });      return result;
    } catch (error: any) {      throw error;
    }
  }

  /**
   * Deleta um usuário e propaga a exclusão para dados dependentes (Cascade).
   * * @param {string} id - Identificador do usuário.
   * @returns {Promise<any>} - Resultado da operação de deleção.
   */
  static async deletarUsuario(id: string) {    try {      const result = await prisma.usuarios.delete({
        where: { id },
      });      return result;
    } catch (error: any) {      throw error;
    }
  }
}

export default ServiceUser;
