/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas de Geolocalização, centralizando endpoints para busca de
 * coordenadas por CEP, filtragem espacial de prestadores e cálculos de proximidade geográfica.
 * @rota server\src\src\route\Route_Localizacao
 
 */

import { Router } from 'express';
import { GeolocalizacaoController } from '../controller/Controller_Localizacao';

console.log(
  '[LOG-FLUXO] Inicializando LocalizacaoRouter e mapeando endpoints de geoprocessamento.',
);
const LocalizacaoRouter = Router();

// ==========================================
// BUSCA DE COORDENADAS E ENDEREÇO
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /coordenadas/:cep -> GeolocalizacaoController.buscarCoordenadas',
);
/**
 * @route GET /coordenadas/:cep
 * @desc Busca latitude e longitude a partir de um CEP (via integração Nominatim/ViaCEP).
 */
LocalizacaoRouter.get(
  '/coordenadas/:cep',
  GeolocalizacaoController.buscarCoordenadas,
);

// ==========================================
// FILTRAGEM DINÂMICA DE PRESTADORES
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /prestadores -> GeolocalizacaoController.buscarPrestadores',
);
/**
 * @route GET /prestadores
 * @desc Busca geral por nome, cidade ou tipo de prestador utilizando filtros dinâmicos do Prisma.
 * @query ?nome=...&localizacao=...&tipo=...&limit=...&raioKm=...&precoMax=...
 */
LocalizacaoRouter.get(
  '/prestadores',
  GeolocalizacaoController.buscarPrestadores,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /prestadores/raio/:idUsuario -> GeolocalizacaoController.buscarPorNomeERaio',
);
/**
 * @route GET /prestadores/raio/:idUsuario
 * @desc Busca prestadores por termo nominal dentro de um raio de distância baseado na posição do usuário.
 * @query ?nome=...&raioKm=...
 */
LocalizacaoRouter.get(
  '/prestadores/raio/:idUsuario',
  GeolocalizacaoController.buscarPorNomeERaio,
);

// ==========================================
// CÁLCULOS DE PROXIMIDADE (RANKING)
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /usuarios-proximos -> GeolocalizacaoController.buscarUsuariosProximos',
);
/**
 * @route GET /usuarios-proximos
 * @desc Identifica IDs de usuários localizados dentro de um raio específico.
 */
LocalizacaoRouter.get(
  '/usuarios-proximos',
  GeolocalizacaoController.buscarUsuariosProximos,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /mais-proximos/:idUsuario -> GeolocalizacaoController.buscar20UsuariosMaisProximos',
);
/**
 * @route GET /mais-proximos/:idUsuario
 * @desc Retorna o ranking dos 20 prestadores fisicamente mais próximos do solicitante.
 */
LocalizacaoRouter.get(
  '/mais-proximos/:idUsuario',
  GeolocalizacaoController.buscar20UsuariosMaisProximos,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /mais-proximos/:idUsuario/:tipo -> GeolocalizacaoController.buscar20UsuariosMaisProximosPorTipo',
);
/**
 * @route GET /mais-proximos/:idUsuario/:tipo
 * @desc Lista os 20 prestadores mais próximos filtrando por categoria (cuidador, enfermeiro, acompanhante).
 */
LocalizacaoRouter.get(
  '/mais-proximos/:idUsuario/:tipo',
  GeolocalizacaoController.buscar20UsuariosMaisProximosPorTipo,
);

console.log(
  '[LOG-FLUXO] LocalizacaoRouter configurado com sucesso e pronto para acoplamento principal.',
);

export default LocalizacaoRouter;
