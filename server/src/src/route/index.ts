/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Ponto central de roteamento da API Nosso Zelo, responsável por orquestrar
 * e unificar os sub-roteadores especializados em um único ponto de entrada para a aplicação Express.
 * @rota server\src\src\route\index.ts
 */

import { Router } from 'express';
import UserRouter from './Route_User';
import CrudRouter from './Route_Crud';
import LoginRouter from './Route_Login';
import LocalizacaoRouter from './Route_Localizacao';
import AgendamentoRouter from './Route_Agendamento';
import UploadRouter from './Route_Upload';

console.log(
  '[LOG-FLUXO] Inicializando roteador central (index) e iniciando acoplamento de módulos.',
);
const router = Router();

// ==========================================
// REGISTRO DE MÓDULOS DE ROTA
// ==========================================

console.log(
  '[LOG-FLUXO] Acoplando módulo: /create-users -> UserRouter',
);
/**
 * Rota para criação e gerenciamento básico de usuários.
 */
router.use('/create-users', UserRouter);

console.log(
  '[LOG-FLUXO] Acoplando módulo: /crud -> CrudRouter',
);
/**
 * Rota para operações CRUD genéricas em múltiplas entidades.
 */
router.use('/crud', CrudRouter);

console.log(
  '[LOG-FLUXO] Acoplando módulo: /login -> LoginRouter',
);
/**
 * Rota para processos de autenticação e identidade.
 */
router.use('/login', LoginRouter);

console.log(
  '[LOG-FLUXO] Acoplando módulo: /geolocalizacao -> LocalizacaoRouter',
);
/**
 * Rota para serviços geográficos, busca de CEP e proximidade.
 */
router.use('/geolocalizacao', LocalizacaoRouter);

console.log(
  '[LOG-FLUXO] Acoplando módulo: /agendamentos -> AgendamentoRouter',
);
/**
 * Rota para gestão de contratações e agendas de serviços.
 */
router.use('/agendamentos', AgendamentoRouter);

console.log(
  '[LOG-FLUXO] Acoplando módulo: /upload -> UploadRouter',
);
/**
 * Rota para gerenciamento de upload de arquivos e documentos.
 */
router.use('/upload', UploadRouter);

console.log(
  '[LOG-FLUXO] Roteamento central configurado com sucesso. Árvore de endpoints operacional.',
);

export default router;
