import { Router } from 'express';
import CrudController from '../controller/Controller_Crud';
import { authMiddleware } from '../middleware/autenticacao';
import { permitirTipos } from '../middleware/permitirTipos';

const CrudRouter = Router();

CrudRouter.use(authMiddleware, permitirTipos(['admin']));

CrudRouter.get('/entities', CrudController.listarEntidades);
CrudRouter.get('/:entity', CrudController.listarTodos);
CrudRouter.get('/:entity/:id', CrudController.buscarPorId);
CrudRouter.get('/:entity/:field/:value', CrudController.buscarPorCampo);
CrudRouter.post('/:entity', CrudController.criarRegistro);
CrudRouter.post('/:entity/many', CrudController.criarMultiplos);
CrudRouter.put('/:entity/:id', CrudController.atualizarRegistro);
CrudRouter.delete('/:entity/:id', CrudController.deletarRegistro);

export default CrudRouter;
