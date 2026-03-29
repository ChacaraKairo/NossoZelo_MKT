import { Request, Response } from 'express';
import { GeolocalizacaoService } from '../service/Service_Localizacao';

// ✅ Nome da classe ajustado para bater com o import do Router
export class GeolocalizacaoController {
  static async buscarCoordenadas(
    req: Request,
    res: Response,
  ) {
    const { cep } = req.params;
    if (!cep)
      return res
        .status(400)
        .json({ erro: 'CEP é obrigatório.' });

    try {
      const coordenadas =
        await GeolocalizacaoService.buscarCoordenadasPorCep(
          cep,
        );
      return res.status(200).json(coordenadas);
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao buscar coordenadas.',
        detalhes: (erro as Error).message,
      });
    }
  }

  // ✅ ATUALIZADO: Agora extrai idUsuario, raioKm e precoMax do frontend
  static async buscarPrestadores(
    req: Request,
    res: Response,
  ) {
    try {
      const {
        idUsuario,
        nome,
        localizacao,
        tipo,
        limit,
        raioKm,
        precoMax,
      } = req.query;

      const prestadores =
        await GeolocalizacaoService.buscarPrestadores({
          idUsuario: idUsuario as string,
          nome: nome as string,
          localizacao: localizacao as string,
          tipo: tipo as string,
          raioKm: raioKm
            ? parseFloat(raioKm as string)
            : undefined,
          precoMax: precoMax
            ? parseFloat(precoMax as string)
            : undefined,
          limit: limit ? parseInt(limit as string) : 20,
        });

      return res.status(200).json(prestadores);
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao filtrar prestadores.',
        detalhes: (erro as Error).message,
      });
    }
  }

  static async buscarPorNomeERaio(
    req: Request,
    res: Response,
  ) {
    // ❌ Erro corrigido: idUsuario vem de params, nome/raioKm vem de query
    const { idUsuario } = req.params;
    const { nome, raioKm } = req.query;

    if (!idUsuario || !nome) {
      return res.status(400).json({
        erro: 'idUsuario e nome são obrigatórios.',
      });
    }

    try {
      const raio = raioKm
        ? parseFloat(raioKm as string)
        : 50;
      const resultados =
        await GeolocalizacaoService.buscarPorNomeERaio(
          idUsuario as string,
          nome as string,
          raio,
        );
      return res.status(200).json(resultados);
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro na busca por nome e raio.',
        detalhes: (erro as Error).message,
      });
    }
  }

  static async buscarUsuariosProximos(
    req: Request,
    res: Response,
  ) {
    const { idUsuario, raioKm } = req.body;
    if (!idUsuario || !raioKm) {
      return res.status(400).json({
        erro: 'idUsuario e raioKm são obrigatórios.',
      });
    }

    try {
      const usuariosIds =
        await GeolocalizacaoService.buscarUsuariosPorRaioPorUsuarioId(
          idUsuario.toString(),
          parseFloat(raioKm),
        );
      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao buscar próximos.',
        detalhes: (erro as Error).message,
      });
    }
  }

  static async buscar20UsuariosMaisProximos(
    req: Request,
    res: Response,
  ) {
    const { idUsuario } = req.params;
    if (!idUsuario)
      return res
        .status(400)
        .json({ erro: 'idUsuario é obrigatório.' });

    try {
      const usuariosIds =
        await GeolocalizacaoService.buscar20UsuariosMaisProximos(
          idUsuario.toString(),
        );
      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao buscar mais próximos.',
        detalhes: (erro as Error).message,
      });
    }
  }

  static async buscar20UsuariosMaisProximosPorTipo(
    req: Request,
    res: Response,
  ) {
    const { idUsuario, tipo } = req.params;
    if (!idUsuario || !tipo) {
      return res.status(400).json({
        erro: 'idUsuario e tipo são obrigatórios.',
      });
    }

    try {
      const usuariosIds =
        await GeolocalizacaoService.buscar20UsuariosMaisProximosPorTipo(
          idUsuario,
          tipo.toLowerCase(),
        );
      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao buscar por tipo.',
        detalhes: (erro as Error).message,
      });
    }
  }
}
