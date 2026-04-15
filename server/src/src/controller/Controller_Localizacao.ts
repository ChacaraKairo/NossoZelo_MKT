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
    const { cep } = req.params;
    console.log(
      `[LOG-FLUXO] Iniciando buscarCoordenadas no GeolocalizacaoController para o CEP: ${cep}`,
    );

    // Ramificação condicional: Validação de parâmetro (Fail Fast)
    if (!cep) {
      console.error(
        `[ERRO-FLUXO] Falha na requisição: O parâmetro 'cep' não foi fornecido na URL.`,
      );
      return res
        .status(400)
        .json({ erro: 'CEP é obrigatório.' });
    }

    try {
      console.log(
        `[LOG-FLUXO] Solicitando geocodificação ao GeolocalizacaoService.buscarCoordenadasPorCep...`,
      );

      // Operação assíncrona: Busca externa/interna de coordenadas
      const coordenadas =
        await GeolocalizacaoService.buscarCoordenadasPorCep(
          cep,
        );

      console.log(
        `[LOG-FLUXO] Coordenadas obtidas com sucesso para o CEP ${cep}: [${coordenadas.latitude}, ${coordenadas.longitude}].`,
      );
      return res.status(200).json(coordenadas);
    } catch (erro: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica ao buscar coordenadas para o CEP ${cep}: ${erro.message}`,
      );
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
  ) {
    console.log(
      `[LOG-FLUXO] Iniciando buscarPrestadores no GeolocalizacaoController. QueryParams: ${JSON.stringify(
        req.query,
      )}`,
    );

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

      console.log(
        `[LOG-FLUXO] Processando extração e tipagem de filtros para consulta dinâmica.`,
      );

      // Invocação de serviço assíncrono com mapeamento de tipos
      console.log(
        `[LOG-FLUXO] Despachando busca ao GeolocalizacaoService.buscarPrestadores...`,
      );
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

      console.log(
        `[LOG-FLUXO] Busca de prestadores finalizada. Total de registros localizados: ${prestadores.length}.`,
      );
      return res.status(200).json(prestadores);
    } catch (erro: any) {
      console.error(
        `[ERRO-FLUXO] Exceção capturada na filtragem de prestadores: ${erro.message}`,
      );
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
    const { nome, raioKm } = req.query;

    console.log(
      `[LOG-FLUXO] Iniciando buscarPorNomeERaio. Contexto: Usuário ${idUsuario}, Termo: '${nome}', Raio: ${raioKm}km.`,
    );

    // Validação de segurança (Fail Fast)
    if (!idUsuario || !nome) {
      console.error(
        `[ERRO-FLUXO] Falha na validação nominal: idUsuario ou nome ausentes na requisição.`,
      );
      return res.status(400).json({
        erro: 'idUsuario e nome são obrigatórios.',
      });
    }

    try {
      const raio = raioKm
        ? parseFloat(raioKm as string)
        : 50;

      console.log(
        `[LOG-FLUXO] Solicitando busca nominal espacial ao GeolocalizacaoService para o usuário: ${idUsuario}.`,
      );
      const resultados =
        await GeolocalizacaoService.buscarPorNomeERaio(
          idUsuario as string,
          nome as string,
          raio,
        );

      console.log(
        `[LOG-FLUXO] Operação finalizada com sucesso. Itens encontrados: ${resultados.length}.`,
      );
      return res.status(200).json(resultados);
    } catch (erro: any) {
      console.error(
        `[ERRO-FLUXO] Erro na busca por nome e raio para o ID ${idUsuario}: ${erro.message}`,
      );
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
    const { idUsuario, raioKm } = req.body;
    console.log(
      `[LOG-FLUXO] Iniciando buscarUsuariosProximos via POST. Contexto: ${idUsuario}, Raio: ${raioKm}km.`,
    );

    if (!idUsuario || !raioKm) {
      console.error(
        `[ERRO-FLUXO] Parâmetros insuficientes no body para busca de proximidade.`,
      );
      return res.status(400).json({
        erro: 'idUsuario e raioKm são obrigatórios.',
      });
    }

    try {
      console.log(
        `[LOG-FLUXO] Invocando busca por raio para o ID: ${idUsuario}.`,
      );
      const usuariosIds =
        await GeolocalizacaoService.buscarUsuariosPorRaioPorUsuarioId(
          idUsuario.toString(),
          parseFloat(raioKm),
        );

      console.log(
        `[LOG-FLUXO] Identificados ${usuariosIds.length} usuários na vizinhança.`,
      );
      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro: any) {
      console.error(
        `[ERRO-FLUXO] Falha ao processar vizinhança para o usuário ${idUsuario}: ${erro.message}`,
      );
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
    const { idUsuario } = req.params;
    console.log(
      `[LOG-FLUXO] Iniciando buscar20UsuariosMaisProximos para o ID: ${idUsuario}`,
    );

    if (!idUsuario) {
      console.error(
        `[ERRO-FLUXO] Requisição bloqueada: idUsuario não informado nos parâmetros.`,
      );
      return res
        .status(400)
        .json({ erro: 'idUsuario é obrigatório.' });
    }

    try {
      console.log(
        `[LOG-FLUXO] Solicitando top 20 vizinhos ao GeolocalizacaoService.`,
      );
      const usuariosIds =
        await GeolocalizacaoService.buscar20UsuariosMaisProximos(
          idUsuario.toString(),
        );

      console.log(
        `[LOG-FLUXO] Sucesso ao recuperar top 20 proximidade para o ID: ${idUsuario}.`,
      );
      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro: any) {
      console.error(
        `[ERRO-FLUXO] Erro ao buscar ranking de proximidade para ${idUsuario}: ${erro.message}`,
      );
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
    const { idUsuario, tipo } = req.params;
    console.log(
      `[LOG-FLUXO] Iniciando buscar20UsuariosMaisProximosPorTipo. Usuário: ${idUsuario}, Tipo: ${tipo}`,
    );

    if (!idUsuario || !tipo) {
      console.error(
        `[ERRO-FLUXO] Falha na validação: idUsuario ou tipo ausentes na rota.`,
      );
      return res.status(400).json({
        erro: 'idUsuario e tipo são obrigatórios.',
      });
    }

    try {
      console.log(
        `[LOG-FLUXO] Solicitando busca filtrada por tipo '${tipo.toLowerCase()}' e proximidade geográfica.`,
      );
      const usuariosIds =
        await GeolocalizacaoService.buscar20UsuariosMaisProximosPorTipo(
          idUsuario,
          tipo.toLowerCase(),
        );

      console.log(
        `[LOG-FLUXO] Busca por tipo concluída. Encontrados: ${usuariosIds.length} resultados.`,
      );
      return res
        .status(200)
        .json({ usuarios: usuariosIds });
    } catch (erro: any) {
      console.error(
        `[ERRO-FLUXO] Falha na operação buscar20UsuariosMaisProximosPorTipo: ${erro.message}`,
      );
      return res.status(500).json({
        erro: 'Erro ao buscar por tipo.',
        detalhes: (erro as Error).message,
      });
    }
  }
}

export default GeolocalizacaoController;
