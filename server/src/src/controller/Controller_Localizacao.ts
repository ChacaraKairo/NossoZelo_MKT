import { Request, Response } from 'express';
import { GeolocalizacaoService } from '../service/Service_Localizacao';

export class GeolocalizacaoController {
  // ✅ Buscar coordenadas por CEP
  static async buscarCoordenadas(
    req: Request,
    res: Response,
  ) {
    const { cep } = req.params;

    if (!cep) {
      return res
        .status(400)
        .json({ erro: 'CEP é obrigatório.' });
    }

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

  // ✅ Buscar usuários por raio (latitude, longitude, raioKm)
  static async buscarUsuariosProximos(
    req: Request,
    res: Response,
  ) {
    const { idUsuario, raioKm } = req.body;

    if (!idUsuario || !raioKm) {
      return res.status(400).json({
        erro: 'Parâmetros idUsuario e raioKm são obrigatórios.',
      });
    }

    try {
      const usuarioId = idUsuario.toString();
      const raio = parseFloat(raioKm);

      const usuariosIds =
        await GeolocalizacaoService.buscarUsuariosPorRaioPorUsuarioId(
          usuarioId,
          raio,
        );

      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao buscar usuários próximos.',
        detalhes: (erro as Error).message,
      });
    }
  }
  static async buscar20UsuariosMaisProximos(
    req: Request,
    res: Response,
  ) {
    const { idUsuario } = req.params;

    if (!idUsuario) {
      return res.status(400).json({
        erro: 'Parâmetro idUsuario é obrigatório.',
      });
    }

    try {
      const usuarioId = idUsuario.toString();

      const usuariosIds =
        await GeolocalizacaoService.buscar20UsuariosMaisProximos(
          usuarioId,
        );

      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro) {
      return res.status(500).json({
        erro: 'Erro ao buscar usuários mais próximos.',
        detalhes: (erro as Error).message,
      });
    }
  }
  // ✅ Buscar 20 usuários mais próximos com base no tipo
  static async buscar20UsuariosMaisProximosPorTipo(
    req: Request,
    res: Response,
  ) {
    const { idUsuario, tipo } = req.params;

    if (!idUsuario || !tipo) {
      return res.status(400).json({
        erro: 'Parâmetros idUsuario e tipo são obrigatórios.',
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
        erro: 'Erro ao buscar usuários mais próximos por tipo.',
        detalhes: (erro as Error).message,
      });
    }
  }
}
