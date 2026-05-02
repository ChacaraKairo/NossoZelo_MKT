/**
 * @author Kairo Chacara
 * @version 1.1
 * @date 15/04/2026
 * @description Ponto central de roteamento da API Nosso Zelo.
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
import ConfirmacaoEmailRouter from './Route_ConfirmacaoEmail';
import OnboardingRouter from './Route_Onboarding';

const router = Router();

router.use('/create-users', UserRouter);
router.use('/crud', CrudRouter);
router.use('/login', LoginRouter);
router.use('/geolocalizacao', LocalizacaoRouter);
router.use('/agendamentos', AgendamentoRouter);
router.use('/upload', UploadRouter);
router.use('/perfil', PerfilRouter);
router.use('/avaliacoes', AvaliacaoRouter);
router.use('/servicos', ServicoRouter);
router.use('/assinaturas', AssinaturaRouter);
router.use('/email', ConfirmacaoEmailRouter);
router.use('/onboarding', OnboardingRouter);

export default router;
