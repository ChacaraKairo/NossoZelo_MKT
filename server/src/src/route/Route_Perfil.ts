/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas de Perfil, centralizando endpoints para visualização
 * de dados próprios, vitrine pública de prestadores e acesso restrito a dados de clientes.
 * @rota server\src\src\route\Route_Perfil
 */

import { Router } from 'express';
import ControllerPerfil from '../controller/Controller_Perfil';
import { authMiddleware } from '../middleware/autenticacao';

console.log(
  '[LOG-FLUXO] Inicializando RoutePerfil e configurando endpoints de acesso a perfis.',
);
const router = Router();

// ==========================================
// GESTÃO DE PERFIS E VITRINE
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /perfil/meu -> ControllerPerfil.obterMeuPerfil (Protegida)',
);
/**
 * Ver o próprio perfil (Telas A e B).
 * Requer autenticação via token JWT.
 */
router.get(
  '/perfil/meu',
  authMiddleware,
  ControllerPerfil.obterMeuPerfil,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /perfil/prestador/:id -> ControllerPerfil.vitrinePrestador (Protegida)',
);
/**
 * Ver vitrine de um prestador (Tela D).
 * Requer autenticação para controle de métricas de visualização.
 */
router.get(
  '/perfil/prestador/:id',
  authMiddleware,
  ControllerPerfil.vitrinePrestador,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /perfil/cliente/:id -> ControllerPerfil.dadosClienteParaPrestador (Protegida)',
);
/**
 * Ver dados de um cliente (Tela C - Triagem).
 * Endpoint com lógica de negócio para liberação de contato.
 */
router.get(
  '/perfil/cliente/:id',
  authMiddleware,
  ControllerPerfil.dadosClienteParaPrestador,
);

console.log(
  '[LOG-FLUXO] RoutePerfil configurado com sucesso e pronto para o Router Principal.',
);

export default router;
