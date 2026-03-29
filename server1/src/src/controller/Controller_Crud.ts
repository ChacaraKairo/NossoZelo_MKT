import { Request, Response } from 'express';
import ServiceCrud from '../service/Service_Crud';

/**
 * Extrai mensagem de erro de qualquer tipo de exceção.
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}

class CrudController {
  static async listarEntidades(
    req: Request,
    res: Response,
  ) {
    try {
      const entidades =
        await ServiceCrud.listar_entidades();
      res.json(entidades);
    } catch (error: unknown) {
      res
        .status(500)
        .json({ error: getErrorMessage(error) });
    }
  }

  static async listarTodos(req: Request, res: Response) {
    try {
      const { entity } = req.params;
      const registros = await ServiceCrud.findAll(entity);
      res.json(registros);
    } catch (error: unknown) {
      res
        .status(400)
        .json({ error: getErrorMessage(error) });
    }
  }

  static async buscarPorId(req: Request, res: Response) {
    try {
      const { entity, id } = req.params;
      const registro = await ServiceCrud.findById(
        entity,
        id,
      );
      if (!registro) {
        return res
          .status(404)
          .json({ error: 'Registro não encontrado' });
      }
      res.json(registro);
    } catch (error: unknown) {
      res
        .status(400)
        .json({ error: getErrorMessage(error) });
    }
  }

  static async buscarPorCampo(req: Request, res: Response) {
    try {
      const { entity, field, value } = req.params;
      const registros = await ServiceCrud.findByField(
        entity,
        field,
        value,
      );
      res.json(registros);
    } catch (error: unknown) {
      res
        .status(400)
        .json({ error: getErrorMessage(error) });
    }
  }

  static async criarRegistro(req: Request, res: Response) {
    try {
      const { entity } = req.params;
      const data = req.body;
      const registroCriado = await ServiceCrud.create(
        entity,
        data,
      );
      res.status(201).json(registroCriado);
    } catch (error: unknown) {
      res
        .status(400)
        .json({ error: getErrorMessage(error) });
    }
  }

  static async criarMultiplos(req: Request, res: Response) {
    try {
      const { entity } = req.params;
      const data = req.body;
      if (!Array.isArray(data)) {
        return res.status(400).json({
          error: 'O corpo da requisição deve ser um array',
        });
      }
      const resultado = await ServiceCrud.createMany(
        entity,
        data,
      );
      res.status(201).json(resultado);
    } catch (error: unknown) {
      res
        .status(400)
        .json({ error: getErrorMessage(error) });
    }
  }

  static async atualizarRegistro(
    req: Request,
    res: Response,
  ) {
    try {
      const { entity, id } = req.params;
      const data = req.body;
      const registroAtualizado = await ServiceCrud.update(
        entity,
        id,
        data,
      );
      res.json(registroAtualizado);
    } catch (error: unknown) {
      res
        .status(400)
        .json({ error: getErrorMessage(error) });
    }
  }

  static async deletarRegistro(
    req: Request,
    res: Response,
  ) {
    try {
      const { entity, id } = req.params;
      await ServiceCrud.delete(entity, id);
      res.status(204).send();
    } catch (error: unknown) {
      res
        .status(400)
        .json({ error: getErrorMessage(error) });
    }
  }
}

export default CrudController;
