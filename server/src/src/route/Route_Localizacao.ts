import { Router } from 'express';
import { GeolocalizacaoController } from '../controller/Controller_Localizacao';

const LocalizacaoRouter = Router();

/**
 * @route GET /api/localizacao/coordenadas/:cep
 * @desc Busca latitude e longitude a partir de um CEP (via Nominatim/ViaCEP)
 */
LocalizacaoRouter.get(
  '/coordenadas/:cep',
  GeolocalizacaoController.buscarCoordenadas,
);

/**
 * @route GET /api/localizacao/prestadores
 * @desc Busca geral por nome, cidade ou tipo (Usa Prisma findMany)
 * @query ?nome=...&localizacao=...&tipo=...&limit=...
 */
LocalizacaoRouter.get(
  '/prestadores',
  GeolocalizacaoController.buscarPrestadores,
);

/**
 * @route GET /api/localizacao/prestadores/raio/:idUsuario
 * @desc Busca prestadores por nome dentro de um raio de distância do usuário
 * @query ?nome=...&raioKm=...
 */
LocalizacaoRouter.get(
  '/prestadores/raio/:idUsuario',
  GeolocalizacaoController.buscarPorNomeERaio,
);

/**
 * @route GET /api/localizacao/usuarios-proximos
 * @desc Busca usuários dentro de um raio específico (Baseado em coordenadas no body ou query)
 */
LocalizacaoRouter.get(
  '/usuarios-proximos',
  GeolocalizacaoController.buscarUsuariosProximos,
);

/**
 * @route GET /api/localizacao/mais-proximos/:idUsuario
 * @desc Lista os 20 prestadores mais próximos de um usuário específico
 */
LocalizacaoRouter.get(
  '/mais-proximos/:idUsuario',
  GeolocalizacaoController.buscar20UsuariosMaisProximos,
);

/**
 * @route GET /api/localizacao/mais-proximos/:idUsuario/:tipo
 * @desc Lista os 20 prestadores mais próximos filtrando por tipo (cuidador, enfermeiro, etc)
 */
LocalizacaoRouter.get(
  '/mais-proximos/:idUsuario/:tipo',
  GeolocalizacaoController.buscar20UsuariosMaisProximosPorTipo,
);

export default LocalizacaoRouter;
