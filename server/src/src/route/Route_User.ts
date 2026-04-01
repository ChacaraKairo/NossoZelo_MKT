// src/routes/UserRouter.ts (ou o caminho correto do seu arquivo)
import { Router } from 'express';
import UserController from '../controller/Controller_User';
import { validarUsuario } from '../middleware/user'; // Mantenha se for usar futuramente

const UserRouter = Router();

// ==========================================
// 1. ROTA DE CRIAÇÃO (UNIFICADA)
// ==========================================
// Esta única rota agora substitui as antigas /cuidador, /enfermeiro e /admin.
// O UserController.criarUsuario lê o "req.body.usuario.tipo" e roteia automaticamente.
UserRouter.post('/usuario', UserController.criarUsuario);

// ==========================================
// 2. ROTAS DE LEITURA E ATUALIZAÇÃO
// ==========================================
UserRouter.get(
  '/usuario/:id',
  UserController.buscarUsuarioCompleto,
);

UserRouter.put(
  '/usuario/:id',
  UserController.atualizarUsuario,
);

UserRouter.put(
  '/usuario/:id/senha',
  UserController.atualizarSenha,
);

// ==========================================
// 3. ROTAS DE DELEÇÃO
// ==========================================
UserRouter.delete(
  '/usuario/:id',
  UserController.deletarUsuario,
);

export default UserRouter;
