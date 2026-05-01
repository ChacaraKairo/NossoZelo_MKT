/**
 * @author Kairo Chácara
 * @version 1.1
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
import PerfilRouter from './Route_Perfil';
import AvaliacaoRouter from './Route_Avaliacao';
import ServicoRouter from './Route_Servico';
import AssinaturaRouter from './Route_Assinatura';
import ConfirmacaoEmailRouter from './Route_ConfirmacaoEmail';const router = Router();/**
 * Rota para criação e gerenciamento básico de usuários.
 */
router.use('/create-users', UserRouter);/**
 * Rota para operações CRUD genéricas em múltiplas entidades.
 */
router.use('/crud', CrudRouter);/**
 * Rota para processos de autenticação e identidade.
 */
router.use('/login', LoginRouter);/**
 * Rota para serviços geográficos, busca de CEP e proximidade.
 */
router.use('/geolocalizacao', LocalizacaoRouter);/**
 * Rota para gestão de contratações e agendas de serviços.
 */
router.use('/agendamentos', AgendamentoRouter);/**
 * Rota para gerenciamento de upload de arquivos e documentos.
 */
router.use('/upload', UploadRouter);/**
 * Rota para gerenciamento e vitrine de perfis.
 */
router.use('/perfil', PerfilRouter);/**
 * Rota para sistema de avaliações cruzadas e gestão de reputação.
 */
router.use('/avaliacoes', AvaliacaoRouter);/**
 * Rota para gerenciamento real dos serviços oferecidos por prestadores.
 */
router.use('/servicos', ServicoRouter);

router.use('/assinaturas', AssinaturaRouter);

router.use('/email', ConfirmacaoEmailRouter);export default router;
