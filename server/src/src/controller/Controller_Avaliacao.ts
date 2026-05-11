import { Request, Response } from 'express';
import { AuthRequest } from './Controller_Perfil';
import ServiceAvaliacao from '../service/Service_Avaliacao';

function statusErro(error: any) {
  return typeof error?.status === 'number' ? error.status : 500;
}

function mensagemErro(error: any) {
  return error?.message || 'Nao foi possivel processar a avaliacao.';
}

class ControllerAvaliacao {
  static async registrar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          error: 'Entre na sua conta para avaliar.',
        });
      }

      const resultado = await ServiceAvaliacao.registrarAvaliacao(
        req.body,
        req.user,
      );

      return res.status(201).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async disponibilidade(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          error: 'Entre na sua conta para consultar a avaliacao.',
        });
      }

      const resultado =
        await ServiceAvaliacao.consultarDisponibilidade(
          Number(req.params.contratacaoId || req.params.id),
          req.user,
        );

      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async minhasPendentes(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          error: 'Entre na sua conta para ver avaliacoes pendentes.',
        });
      }

      const resultado = await ServiceAvaliacao.listarPendentes(req.user);
      return res.status(200).json(resultado);
    } catch (error: any) {
      return res
        .status(statusErro(error))
        .json({ error: mensagemErro(error) });
    }
  }

  static async listarPorPrestador(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const avaliacoes =
        await ServiceAvaliacao.obterAvaliacoesPorPrestador(id);
      return res.status(200).json(avaliacoes);
    } catch (error: any) {
      return res.status(500).json({ error: mensagemErro(error) });
    }
  }

  static async listarPorCliente(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const avaliacoes =
        await ServiceAvaliacao.obterAvaliacoesPorCliente(id);
      return res.status(200).json(avaliacoes);
    } catch (error: any) {
      return res.status(500).json({ error: mensagemErro(error) });
    }
  }
}

export default ControllerAvaliacao;
