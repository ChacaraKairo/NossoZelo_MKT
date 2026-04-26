/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Definição das rotas de Perfil, centralizando endpoints para visualização
 * de dados próprios, vitrine pública de prestadores e acesso restrito a dados de clientes.
 * @rota server\src\src\route\Route_Perfil
 */

import { Router } from 'express';
import ControllerPerfil from '../controller/Controller_Perfil';
import { authMiddleware } from '../middleware/autenticacao';
import { permitirTipos } from '../middleware/permitirTipos';

console.log(
  '[LOG-FLUXO] Inicializando RoutePerfil e configurando endpoints de acesso a perfis.',
);
const router = Router();

// ==========================================
// GESTÃO DE PERFIS E VITRINE
// ==========================================

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /meu -> ControllerPerfil.obterMeuPerfil (Protegida)',
);
/**
 * Ver o próprio perfil (Telas A e B).
 * Requer autenticação via token JWT.
 */
router.get(
  '/meu', // 🔥 CORRIGIDO: Removido o prefixo /perfil
  authMiddleware,
  ControllerPerfil.obterMeuPerfil as any,
);

router.get(
  '/resumo',
  authMiddleware,
  ControllerPerfil.obterResumoPerfil as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /prestador/:id -> ControllerPerfil.vitrinePrestador (Protegida)',
);
/**
 * Ver vitrine de um prestador (Tela D).
 * Requer autenticação para controle de métricas de visualização.
 */
router.get(
  '/prestador/:id', // 🔥 CORRIGIDO: Removido o prefixo /perfil
  authMiddleware,
  ControllerPerfil.vitrinePrestador as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: GET /cliente/:id -> ControllerPerfil.dadosClienteParaPrestador (Protegida)',
);
/**
 * Ver dados de um cliente (Tela C - Triagem).
 * Endpoint com lógica de negócio para liberação de contato.
 */
router.get(
  '/cliente/:id', // 🔥 CORRIGIDO: Removido o prefixo /perfil
  authMiddleware,
  permitirTipos(['cuidador', 'enfermeiro', 'acompanhante']),
  ControllerPerfil.dadosClienteParaPrestador as any,
);

console.log(
  '[LOG-FLUXO] Mapeando Rota: PATCH /update -> ControllerPerfil.atualizarDadosPerfil (Protegida)',
);
/**
 * Atualizar o próprio perfil.
 * Rota que estava faltando e causando o erro 404.
 */
router.patch(
  '/update',
  authMiddleware,
  ControllerPerfil.atualizarDadosPerfil as any,
);

router.patch(
  '/seguranca/senha',
  authMiddleware,
  ControllerPerfil.alterarSenha as any,
);

console.log(
  '[LOG-FLUXO] RoutePerfil configurado com sucesso e pronto para o Router Principal.',
);

export default router;
