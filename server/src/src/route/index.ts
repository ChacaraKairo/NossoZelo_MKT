import { Router } from 'express';
import UserRouter from './Route_User';
import CrudRouter from './Route_Crud';
import LoginRouter from './Route_Login';
import LocalizacaoRouter from './Route_Localizacao';
import AgendamentoRouter from './Route_Agendamento';
const router = Router();

router.use('/create-users', UserRouter);
router.use('/crud', CrudRouter);
router.use('/login', LoginRouter);
router.use('/geolocalizacao', LocalizacaoRouter);
router.use('/agendamentos', AgendamentoRouter);

export default router;
