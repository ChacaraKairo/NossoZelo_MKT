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
import { permitirTipos } from '../middleware/permitirTipos';const router = Router();/**
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
);/**
 * Ver vitrine de um prestador (Tela D).
 * Requer autenticação para controle de métricas de visualização.
 */
router.get(
  '/prestador/:id', // 🔥 CORRIGIDO: Removido o prefixo /perfil
  authMiddleware,
  ControllerPerfil.vitrinePrestador as any,
);/**
 * Ver dados de um cliente (Tela C - Triagem).
 * Endpoint com lógica de negócio para liberação de contato.
 */
router.get(
  '/cliente/:id', // 🔥 CORRIGIDO: Removido o prefixo /perfil
  authMiddleware,
  permitirTipos(['cuidador', 'enfermeiro', 'acompanhante']),
  ControllerPerfil.dadosClienteParaPrestador as any,
);/**
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
);export default router;
