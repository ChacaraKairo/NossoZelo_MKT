import logger from '@/utils/logger';
import api, { extrairErroApi } from '@/service/api';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import {
  AtualizarPerfilPayload,
  PerfilClienteParaPrestador,
  PerfilPrestadorPublico,
  PerfilUsuario,
} from '@/types/perfil';

export type {
  AtualizarPerfilPayload,
  PerfilClienteParaPrestador,
  PerfilPrestadorPublico,
  PerfilUsuario,
} from '@/types/perfil';

const CONTEXTO = 'perfilService';

function logarErro(endpoint: string, error: unknown) {
  const { status, mensagem } = extrairErroApi(error);
  logger.error(
    CONTEXTO,
    `Falha ao buscar ${endpoint}`,
    { status, mensagem, mensagemAmigavel: extrairMensagemErro(error) },
  );
}

export const perfilService = {
  obterMeuPerfil: async (): Promise<PerfilUsuario> => {
    const endpoint = '/perfil/meu';
    try {
      logger.info(
        CONTEXTO,
        'Carregando perfil do usuário autenticado',
      );
      const response = await api.get<PerfilUsuario>(endpoint);
      logger.info(CONTEXTO, 'Perfil carregado com sucesso', {
        perfil_tipo: response.data?.perfil_tipo,
      });
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  atualizarDadosPerfil: async (
    dados: AtualizarPerfilPayload,
  ): Promise<PerfilUsuario> => {
    const endpoint = '/perfil/update';
    try {
      logger.info(CONTEXTO, 'Atualizando dados do perfil', {
        campos: Object.keys(dados),
      });
      const response = await api.patch<PerfilUsuario>(
        endpoint,
        dados,
      );
      logger.info(
        CONTEXTO,
        'Perfil atualizado com sucesso',
        { perfil_tipo: response.data?.perfil_tipo },
      );
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  obterVitrinePrestador: async (
    prestadorId: string,
  ): Promise<PerfilPrestadorPublico> => {
    const endpoint = `/perfil/prestador/${prestadorId}`;
    try {
      logger.info(CONTEXTO, 'Carregando vitrine pública', {
        prestadorId,
      });
      const response =
        await api.get<PerfilPrestadorPublico>(endpoint);
      logger.info(
        CONTEXTO,
        'Vitrine pública carregada com sucesso',
        { prestadorId },
      );
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },

  obterDadosCliente: async (
    clienteId: string,
  ): Promise<PerfilClienteParaPrestador> => {
    const endpoint = `/perfil/cliente/${clienteId}`;
    try {
      logger.info(
        CONTEXTO,
        'Carregando dados liberados do cliente',
        { clienteId },
      );
      const response =
        await api.get<PerfilClienteParaPrestador>(
          endpoint,
        );
      logger.info(
        CONTEXTO,
        'Dados do cliente carregados com sucesso',
        {
          clienteId,
          contato_liberado:
            response.data?.contato_liberado,
        },
      );
      return response.data;
    } catch (error: unknown) {
      logarErro(endpoint, error);
      throw error;
    }
  },
};
