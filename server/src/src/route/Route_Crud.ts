/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas genéricas de CRUD, permitindo a manipulação dinâmica
 * de diversas entidades do sistema através de mapeamento automático para o CrudController.
 * @rota server\src\src\route\Route_Crud
 */

import { Router } from 'express';
import CrudController from '../controller/Controller_Crud';const CrudRouter = Router();/**
 * Lista todas as tabelas/entidades configuradas no sistema.
 */
CrudRouter.get('/entities', CrudController.listarEntidades);/**
 * Retorna todos os registros de uma entidade específica.
 */
CrudRouter.get('/:entity', CrudController.listarTodos);/**
 * Busca um registro único pelo seu identificador primário.
 */
CrudRouter.get('/:entity/:id', CrudController.buscarPorId);/**
 * Filtra registros baseados em um par campo/valor dinâmico.
 */
CrudRouter.get(
  '/:entity/:field/:value',
  CrudController.buscarPorCampo,
);/**
 * Cria um novo registro na entidade especificada.
 */
CrudRouter.post('/:entity', CrudController.criarRegistro);/**
 * Realiza inserção em lote (Batch Insert) para uma entidade.
 */
CrudRouter.post(
  '/:entity/many',
  CrudController.criarMultiplos,
);/**
 * Atualiza um registro existente via ID.
 */
CrudRouter.put(
  '/:entity/:id',
  CrudController.atualizarRegistro,
);/**
 * Remove fisicamente um registro da base de dados.
 */
CrudRouter.delete(
  '/:entity/:id',
  CrudController.deletarRegistro,
);export default CrudRouter;
