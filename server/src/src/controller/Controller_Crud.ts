/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller genérico responsável por gerenciar requisições HTTP para operações CRUD dinâmicas,
 * permitindo a manipulação de diversas entidades do banco de dados através de parâmetros de rota.
 * @rota server\src\src\controller\Controller_Crud.ts
 */

import { Request, Response } from 'express';
import ServiceCrud from '../service/Service_Crud';

/**
 * Extrai mensagem de erro de qualquer tipo de exceção de forma segura.
 * @param {unknown} error - O objeto de erro capturado no catch.
 * @returns {string} - A mensagem de erro processada.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}

function statusErroCrud(msg: string) {
  return msg.includes('bloqueada') || msg.includes('invalida') ? 403 : 400;
}

function validarEntidade(req: Request) {
  return ServiceCrud.validarEntidadeCrud(req.params.entity);
}

class CrudController {
  /**
   * Lista todas as entidades (tabelas) disponíveis no esquema do banco de dados.
   * @param {Request} req - Requisição Express.
   * @param {Response} res - Resposta HTTP.
   */
  static async listarEntidades(
    req: Request,
    res: Response,
  ) {    try {      const entidades =
        await ServiceCrud.listar_entidades();      res.json(entidades);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(500).json({ error: msg });
    }
  }

  /**
   * Recupera todos os registros de uma entidade específica.
   * @param {Request} req - Requisição contendo o nome da entidade nos parâmetros.
   * @param {Response} res - Resposta HTTP.
   */
  static async listarTodos(req: Request, res: Response) {
    const { entity } = req.params;    try {      validarEntidade(req);      const registros = await ServiceCrud.findAll(entity);      res.json(registros);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(statusErroCrud(msg)).json({ error: msg });
    }
  }

  /**
   * Busca um registro específico por ID em uma determinada entidade.
   * @param {Request} req - Params: entity, id.
   * @param {Response} res - Resposta HTTP.
   */
  static async buscarPorId(req: Request, res: Response) {
    const { entity, id } = req.params;    try {      validarEntidade(req);      const registro = await ServiceCrud.findById(
        entity,
        id,
      );

      // Ramificação condicional: Verificação de existência
      if (!registro) {        return res
          .status(404)
          .json({ error: 'Registro não encontrado' });
      }      res.json(registro);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(statusErroCrud(msg)).json({ error: msg });
    }
  }

  /**
   * Filtra registros de uma entidade baseados em um campo e valor específicos.
   * @param {Request} req - Params: entity, field, value.
   * @param {Response} res - Resposta HTTP.
   */
  static async buscarPorCampo(req: Request, res: Response) {
    const { entity, field, value } = req.params;    try {      validarEntidade(req);      const registros = await ServiceCrud.findByField(
        entity,
        field,
        value,
      );      res.json(registros);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(statusErroCrud(msg)).json({ error: msg });
    }
  }

  /**
   * Cria um novo registro em uma entidade especificada.
   * @param {Request} req - Params: entity | Body: dados do registro.
   * @param {Response} res - Resposta HTTP 201.
   */
  static async criarRegistro(req: Request, res: Response) {
    const { entity } = req.params;
    const data = req.body;    try {      validarEntidade(req);      const registroCriado = await ServiceCrud.create(
        entity,
        data,
      );      res.status(201).json(registroCriado);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(statusErroCrud(msg)).json({ error: msg });
    }
  }

  /**
   * Realiza a criação de múltiplos registros (Batch Insert) em uma entidade.
   * @param {Request} req - Params: entity | Body: Array de objetos.
   * @param {Response} res - Resposta HTTP.
   */
  static async criarMultiplos(req: Request, res: Response) {
    const { entity } = req.params;
    const data = req.body;    try {      validarEntidade(req);
      // Ramificação condicional: Validação de estrutura de dados (Array)
      if (!Array.isArray(data)) {        return res.status(400).json({
          error: 'O corpo da requisição deve ser um array',
        });
      }      const resultado = await ServiceCrud.createMany(
        entity,
        data,
      );      res.status(201).json(resultado);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(statusErroCrud(msg)).json({ error: msg });
    }
  }

  /**
   * Atualiza um registro existente através de seu ID.
   * @param {Request} req - Params: entity, id | Body: Dados para atualização.
   * @param {Response} res - Resposta HTTP.
   */
  static async atualizarRegistro(
    req: Request,
    res: Response,
  ) {
    const { entity, id } = req.params;
    const data = req.body;    try {      validarEntidade(req);      const registroAtualizado = await ServiceCrud.update(
        entity,
        id,
        data,
      );      res.json(registroAtualizado);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(statusErroCrud(msg)).json({ error: msg });
    }
  }

  /**
   * Remove fisicamente um registro do banco de dados via ID.
   * @param {Request} req - Params: entity, id.
   * @param {Response} res - Resposta HTTP 204 (No Content).
   */
  static async deletarRegistro(
    req: Request,
    res: Response,
  ) {
    const { entity, id } = req.params;    try {      validarEntidade(req);      await ServiceCrud.delete(entity, id);      res.status(204).send();
    } catch (error: unknown) {
      const msg = getErrorMessage(error);      res.status(statusErroCrud(msg)).json({ error: msg });
    }
  }
}

export default CrudController;
