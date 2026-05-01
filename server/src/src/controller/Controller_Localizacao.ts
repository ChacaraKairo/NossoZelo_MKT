/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller responsável por gerenciar as requisições HTTP de geoprocessamento,
 * incluindo busca de coordenadas por CEP e filtragem avançada de prestadores por proximidade geográfica.
 * @rota server\src\src\controller\Controller_Localizacao.ts
 */

import { Request, Response } from 'express';
import { GeolocalizacaoService } from '../service/Service_Localizacao';
import logger from '../lib/logger';

function normalizarParaJson(valor: unknown): unknown {
  if (typeof valor === 'bigint') {
    const numero = Number(valor);
    return Number.isSafeInteger(numero) ? numero : valor.toString();
  }

  if (valor instanceof Date) {
    return valor.toISOString();
  }

  if (Array.isArray(valor)) {
    return valor.map(normalizarParaJson);
  }

  if (valor && typeof valor === 'object') {
    if ('toNumber' in valor && typeof valor.toNumber === 'function') {
      return valor.toNumber();
    }

    return Object.fromEntries(
      Object.entries(valor).map(([chave, item]) => [
        chave,
        normalizarParaJson(item),
      ]),
    );
  }

  return valor;
}

export class GeolocalizacaoController {
  /**
   * Endpoint para converter um CEP em coordenadas geográficas (Lat/Lon).
   * @param {Request} req - Requisição contendo o CEP nos parâmetros da URL.
   * @param {Response} res - Resposta HTTP.
   * @returns {Promise<Response>}
   */
  static async buscarCoordenadas(
    req: Request,
    res: Response,
  ) {
    const { cep } = req.params;    // Ramificação condicional: Validação de parâmetro (Fail Fast)
    if (!cep) {      return res
        .status(400)
        .json({ erro: 'CEP é obrigatório.' });
    }

    try {      // Operação assíncrona: Busca externa/interna de coordenadas
      const coordenadas =
        await GeolocalizacaoService.buscarCoordenadasPorCep(
          cep,
        );      return res.status(200).json(coordenadas);
    } catch (erro: any) {
      logger.error('GeolocalizacaoController: falha ao buscar coordenadas', {
        cep,
        erro,
      });

      return res.status(500).json({
        erro: 'Erro ao buscar coordenadas.',
        detalhes: (erro as Error).message,
      });
    }
  }

  /**
   * Realiza a busca filtrada de prestadores baseada em múltiplos critérios (nome, tipo, raio, preço).
   * @param {Request} req - Requisição contendo filtros na Query String.
   * @param {Response} res - Resposta HTTP.
   * @returns {Promise<Response>}
   */
  static async buscarPrestadores(
    req: Request,
    res: Response,
  ) {    try {
      const {
        idUsuario,
        nome,
        localizacao,
        latitude,
        longitude,
        tipo,
        limit,
        raioKm,
        precoMax,
      } = req.query;  const prestadores =
        await GeolocalizacaoService.buscarPrestadores({
          idUsuario: idUsuario as string,
          nome: nome as string,
          localizacao: localizacao as string,
          latitude: latitude
            ? parseFloat(latitude as string)
            : undefined,
          longitude: longitude
            ? parseFloat(longitude as string)
            : undefined,
          tipo: tipo as string,
          raioKm: raioKm
            ? parseFloat(raioKm as string)
            : undefined,
          precoMax: precoMax
            ? parseFloat(precoMax as string)
            : undefined,
          limit: limit ? parseInt(limit as string) : 20,
        });      return res.status(200).json(normalizarParaJson(prestadores));
    } catch (erro: any) {
      logger.error('GeolocalizacaoController: falha ao filtrar prestadores', {
        query: req.query,
        erro,
      });

      return res.status(500).json({
        erro: 'Erro ao filtrar prestadores.',
        detalhes: (erro as Error).message,
      });
    }
  }

  /**
   * Busca prestadores por nome dentro de um raio de distância a partir da localização do usuário.
   * @param {Request} req - Params: idUsuario | Query: nome, raioKm.
   * @param {Response} res - Resposta HTTP.
   */
  static async buscarPorNomeERaio(
    req: Request,
    res: Response,
  ) {
    const { idUsuario } = req.params;
    const { nome, raioKm } = req.query;    // Validação de segurança (Fail Fast)
    if (!idUsuario || !nome) {      return res.status(400).json({
        erro: 'idUsuario e nome são obrigatórios.',
      });
    }

    try {
      const raio = raioKm
        ? parseFloat(raioKm as string)
        : 50;      const resultados =
        await GeolocalizacaoService.buscarPorNomeERaio(
          idUsuario as string,
          nome as string,
          raio,
        );      return res.status(200).json(resultados);
    } catch (erro: any) {
      logger.error('GeolocalizacaoController: falha na busca por nome e raio', {
        params: req.params,
        query: req.query,
        erro,
      });

      return res.status(500).json({
        erro: 'Erro na busca por nome e raio.',
        detalhes: (erro as Error).message,
      });
    }
  }

  /**
   * Identifica IDs de usuários localizados dentro de um raio geográfico específico.
   * @param {Request} req - Body: idUsuario, raioKm.
   * @param {Response} res - Resposta HTTP.
   */
  static async buscarUsuariosProximos(
    req: Request,
    res: Response,
  ) {
    const { idUsuario, raioKm } = req.body;    if (!idUsuario || !raioKm) {      return res.status(400).json({
        erro: 'idUsuario e raioKm são obrigatórios.',
      });
    }

    try {      const usuariosIds =
        await GeolocalizacaoService.buscarUsuariosPorRaioPorUsuarioId(
          idUsuario.toString(),
          parseFloat(raioKm),
        );      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro: any) {
      logger.error('GeolocalizacaoController: falha ao buscar proximos', {
        body: req.body,
        erro,
      });

      return res.status(500).json({
        erro: 'Erro ao buscar próximos.',
        detalhes: (erro as Error).message,
      });
    }
  }

  /**
   * Retorna o ranking dos 20 usuários fisicamente mais próximos do solicitante.
   * @param {Request} req - Params: idUsuario.
   * @param {Response} res - Resposta HTTP.
   */
  static async buscar20UsuariosMaisProximos(
    req: Request,
    res: Response,
  ) {
    const { idUsuario } = req.params;    if (!idUsuario) {      return res
        .status(400)
        .json({ erro: 'idUsuario é obrigatório.' });
    }

    try {      const usuariosIds =
        await GeolocalizacaoService.buscar20UsuariosMaisProximos(
          idUsuario.toString(),
        );      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro: any) {
      logger.error('GeolocalizacaoController: falha ao buscar mais proximos', {
        params: req.params,
        erro,
      });

      return res.status(500).json({
        erro: 'Erro ao buscar mais próximos.',
        detalhes: (erro as Error).message,
      });
    }
  }

  /**
   * Retorna o ranking dos 20 usuários mais próximos filtrados por tipo (Ex: Enfermeiro).
   * @param {Request} req - Params: idUsuario, tipo.
   * @param {Response} res - Resposta HTTP.
   */
  static async buscar20UsuariosMaisProximosPorTipo(
    req: Request,
    res: Response,
  ) {
    const { idUsuario, tipo } = req.params;    if (!idUsuario || !tipo) {      return res.status(400).json({
        erro: 'idUsuario e tipo são obrigatórios.',
      });
    }

    try {      const usuariosIds =
        await GeolocalizacaoService.buscar20UsuariosMaisProximosPorTipo(
          idUsuario,
          tipo.toLowerCase(),
        );      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro: any) {
      logger.error('GeolocalizacaoController: falha ao buscar por tipo', {
        params: req.params,
        erro,
      });

      return res.status(500).json({
        erro: 'Erro ao buscar por tipo.',
        detalhes: (erro as Error).message,
      });
    }
  }
}

export default GeolocalizacaoController;
