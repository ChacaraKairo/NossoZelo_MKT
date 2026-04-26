import { Request, Response } from 'express';
import { ServicePerfil } from '../service/Service_Perfil';

import { AuthRequest } from '../types/auth';

export type { AuthRequest };

const camposProtegidosPerfil = [
  'id',
  'email',
  'senha',
  'cpf',
  'tipo',
  'role',
  'admin',
  'avaliacao_media',
  'criado_em',
  'updated_at',
];

function removerCamposProtegidos(dados: any) {
  const dadosLimpos = { ...dados };

  for (const campo of camposProtegidosPerfil) {
    delete dadosLimpos[campo];
  }

  return dadosLimpos;
}

function statusErroPerfil(error: any) {
  if (typeof error?.status === 'number') {
    return error.status;
  }

  const mensagem = String(error?.message || '').toLowerCase();

  if (error?.code === 'P2025' || mensagem.includes('nÃ£o encontrado')) {
    return 404;
  }

  if (
    mensagem.includes('nÃ£o autorizado') ||
    mensagem.includes('token')
  ) {
    return 401;
  }

  if (
    mensagem.includes('acesso negado') ||
    mensagem.includes('apenas prestadores')
  ) {
    return 403;
  }

  return 400;
}

class ControllerPerfil {
  async alterarSenha(req: AuthRequest, res: Response) {
    try {
      const usuarioId = req.user?.id;
      if (!usuarioId) {
        return res.status(401).json({
          error: 'NÃ£o autorizado: Token invÃ¡lido ou ausente.',
        });
      }

      const { senhaAtual, novaSenha } = req.body || {};
      const resultado = await ServicePerfil.alterarSenhaSegura(
        usuarioId,
        senhaAtual,
        novaSenha,
      );

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErroPerfil(error))
        .json({ error: error.message });
    }
  }

  /**
   * Recupera o perfil completo do usuÃ¡rio autenticado (Dashboard).
   */
  async obterMeuPerfil(req: AuthRequest, res: Response) {
    console.log(
      `[LOG-FLUXO] Controller: Iniciando obterMeuPerfil.`,
    );

    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({
          error:
            'NÃ£o autorizado: Token invÃ¡lido ou ausente.',
        });
      }

      // Chama o Service que agora traz Agenda, ServiÃ§os e AvaliaÃ§Ãµes inclusos
      const perfil =
        await ServicePerfil.obterMeuPerfilCompleto(
          usuarioId,
        );

      return res.status(200).json(perfil);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em obterMeuPerfil: ${error.message}`,
      );
      return res
        .status(statusErroPerfil(error))
        .json({ error: error.message });
    }
  }

  async obterResumoPerfil(req: AuthRequest, res: Response) {
    console.log(
      `[LOG-FLUXO] Controller: Iniciando obterResumoPerfil.`,
    );

    try {
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({
          error:
            'NÃ£o autorizado: Token invÃ¡lido ou ausente.',
        });
      }

      const resumo =
        await ServicePerfil.obterResumoPerfil(usuarioId);

      return res.status(200).json(resumo);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em obterResumoPerfil: ${error.message}`,
      );
      return res
        .status(statusErroPerfil(error))
        .json({ error: error.message });
    }
  }

  /**
   * Atualiza dados parciais do perfil do usuÃ¡rio logado.
   */
  async atualizarDadosPerfil(
    req: AuthRequest,
    res: Response,
  ) {
    console.log(
      `[LOG-FLUXO] Controller: Iniciando atualizarDadosPerfil.`,
    );
    try {
      const usuarioId = req.user?.id;
      const tipo = req.user?.tipo;
      if (!usuarioId || !tipo) {
        return res.status(401).json({
          error:
            'NÃ£o autorizado: Token invÃ¡lido ou ausente (tipo nÃ£o identificado).',
        });
      }

      const dados = req.body;
      if (!dados || Object.keys(dados).length === 0) {
        return res.status(400).json({
          error: 'Nenhum dado fornecido para atualizaÃ§Ã£o.',
        });
      }

      const dadosLimpos = removerCamposProtegidos(dados);

      if (Object.keys(dadosLimpos).length === 0) {
        return res.status(400).json({
          error:
            'Nenhum campo permitido fornecido para atualizaÃ§Ã£o.',
        });
      }

      const perfilAtualizado =
        await ServicePerfil.atualizarDados(
          usuarioId,
          tipo,
          dadosLimpos,
        );
      return res.status(200).json(perfilAtualizado);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em atualizarDadosPerfil: ${error.message}`,
      );
      return res
        .status(statusErroPerfil(error))
        .json({ error: error.message });
    }
  }

  /**
   * Retorna a vitrine pÃºblica de um prestador.
   */
  async vitrinePrestador(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const vitrine =
        await ServicePerfil.obterVitrinePrestador(id);
      return res.status(200).json(vitrine);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em vitrinePrestador: ${error.message}`,
      );
      return res
        .status(404)
        .json({ error: 'Prestador nÃ£o encontrado' });
    }
  }

  /**
   * BUG FIX: Corrigido o acesso Ã  propriedade 'contato_liberado'
   */
  async dadosClienteParaPrestador(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      const clienteId = req.params.id;
      const prestadorId = req.user?.id;
      const tipo = req.user?.tipo;

      if (!prestadorId) {
        return res
          .status(401)
          .json({ error: 'NÃ£o autorizado' });
      }

      const tiposPrestador = [
        'cuidador',
        'enfermeiro',
        'acompanhante',
      ];

      if (!tipo || !tiposPrestador.includes(tipo)) {
        return res.status(403).json({
          error:
            'Apenas prestadores podem acessar dados de clientes.',
        });
      }

      console.log(
        `[LOG-FLUXO] Buscando dados do cliente ${clienteId} para o prestador ${prestadorId}`,
      );

      // Aguarda o retorno do Service
      const dados =
        await ServicePerfil.obterDadosClienteParaPrestador(
          clienteId,
          prestadorId,
        );

      // Se o service nÃ£o retornar dados (ex: sem permissÃ£o), retorna 404.
      if (!dados) {
        return res
          .status(404)
          .json({ error: 'Dados nÃ£o localizados.' });
      }

      // Log de telemetria atualizado para evitar erro de compilaÃ§Ã£o
      console.log(
        `[LOG-FLUXO] Resposta enviada. Contato Liberado: ${
          (dados as any).contato_liberado ? 'SIM' : 'NÃƒO'
        }`,
      );

      return res.status(200).json(dados);
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Erro em dadosClienteParaPrestador: ${error.message}`,
      );
      return res
        .status(statusErroPerfil(error))
        .json({ error: error.message });
    }
  }
}

// Exportamos uma instÃ¢ncia da classe para manter o padrÃ£o singleton
export default new ControllerPerfil();


