import { Router } from 'express';
import AgendamentoController from '../controller/Controller_Agendamentos';

const AgendamentoRouter = Router();

// Criar um novo agendamento (agenda + contratação)
AgendamentoRouter.post(
  '/agendamentos',
  AgendamentoController.criar,
);

// Listar agendamentos de um prestador por tempo
// Exemplo: /agendamentos/prestador/USR456?dias=7
AgendamentoRouter.get(
  '/agendamentos/prestador/:id',
  AgendamentoController.listarPorTempo,
);

// Listar agendamentos de um cliente
// Exemplo: /agendamentos/cliente/USR123
AgendamentoRouter.get(
  '/agendamentos/cliente/:id',
  AgendamentoController.listarPorCliente,
);

export default AgendamentoRouter;
