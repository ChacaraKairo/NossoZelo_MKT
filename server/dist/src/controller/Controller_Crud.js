"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Controller genérico responsável por gerenciar requisições HTTP para operações CRUD dinâmicas,
 * permitindo a manipulação de diversas entidades do banco de dados através de parâmetros de rota.
 * @rota server\src\src\controller\Controller_Crud.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Service_Crud_1 = __importDefault(require("../service/Service_Crud"));
/**
 * Extrai mensagem de erro de qualquer tipo de exceção de forma segura.
 * @param {unknown} error - O objeto de erro capturado no catch.
 * @returns {string} - A mensagem de erro processada.
 */
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'Erro desconhecido';
}
class CrudController {
    /**
     * Lista todas as entidades (tabelas) disponíveis no esquema do banco de dados.
     * @param {Request} req - Requisição Express.
     * @param {Response} res - Resposta HTTP.
     */
    static async listarEntidades(req, res) {
        console.log('[LOG-FLUXO] Iniciando listarEntidades no CrudController.');
        try {
            console.log('[LOG-FLUXO] Solicitando mapeamento de tabelas ao ServiceCrud.listar_entidades.');
            const entidades = await Service_Crud_1.default.listar_entidades();
            console.log(`[LOG-FLUXO] Mapeamento concluído. Retornando ${entidades.length} entidades.`);
            res.json(entidades);
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Falha ao listar entidades no controller: ${msg}`);
            res.status(500).json({ error: msg });
        }
    }
    /**
     * Recupera todos os registros de uma entidade específica.
     * @param {Request} req - Requisição contendo o nome da entidade nos parâmetros.
     * @param {Response} res - Resposta HTTP.
     */
    static async listarTodos(req, res) {
        const { entity } = req.params;
        console.log(`[LOG-FLUXO] Iniciando listarTodos para a entidade: ${entity}`);
        try {
            console.log(`[LOG-FLUXO] Invocando ServiceCrud.findAll para: ${entity}`);
            const registros = await Service_Crud_1.default.findAll(entity);
            console.log(`[LOG-FLUXO] Busca massiva finalizada. Encontrados ${registros.length} itens em ${entity}.`);
            res.json(registros);
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Erro na listagem global da entidade ${entity}: ${msg}`);
            res.status(400).json({ error: msg });
        }
    }
    /**
     * Busca um registro específico por ID em uma determinada entidade.
     * @param {Request} req - Params: entity, id.
     * @param {Response} res - Resposta HTTP.
     */
    static async buscarPorId(req, res) {
        const { entity, id } = req.params;
        console.log(`[LOG-FLUXO] Iniciando buscarPorId. Entidade: ${entity}, ID: ${id}`);
        try {
            console.log(`[LOG-FLUXO] Executando ServiceCrud.findById para o registro alvo.`);
            const registro = await Service_Crud_1.default.findById(entity, id);
            // Ramificação condicional: Verificação de existência
            if (!registro) {
                console.warn(`[LOG-FLUXO] Aviso: Registro ${id} não localizado na entidade ${entity}.`);
                return res
                    .status(404)
                    .json({ error: 'Registro não encontrado' });
            }
            console.log(`[LOG-FLUXO] Registro ${id} localizado com sucesso em ${entity}.`);
            res.json(registro);
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Falha na busca por ID (${id}) em ${entity}: ${msg}`);
            res.status(400).json({ error: msg });
        }
    }
    /**
     * Filtra registros de uma entidade baseados em um campo e valor específicos.
     * @param {Request} req - Params: entity, field, value.
     * @param {Response} res - Resposta HTTP.
     */
    static async buscarPorCampo(req, res) {
        const { entity, field, value } = req.params;
        console.log(`[LOG-FLUXO] Iniciando buscarPorCampo. Entidade: ${entity}, Filtro: [${field}=${value}]`);
        try {
            console.log(`[LOG-FLUXO] Solicitando filtragem dinâmica ao ServiceCrud.findByField.`);
            const registros = await Service_Crud_1.default.findByField(entity, field, value);
            console.log(`[LOG-FLUXO] Filtragem concluída. Registros retornados: ${registros.length}.`);
            res.json(registros);
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Erro ao filtrar por campo na entidade ${entity}: ${msg}`);
            res.status(400).json({ error: msg });
        }
    }
    /**
     * Cria um novo registro em uma entidade especificada.
     * @param {Request} req - Params: entity | Body: dados do registro.
     * @param {Response} res - Resposta HTTP 201.
     */
    static async criarRegistro(req, res) {
        const { entity } = req.params;
        const data = req.body;
        console.log(`[LOG-FLUXO] Iniciando criarRegistro em ${entity}. Payload: ${JSON.stringify(data)}`);
        try {
            console.log(`[LOG-FLUXO] Invocando ServiceCrud.create para persistência.`);
            const registroCriado = await Service_Crud_1.default.create(entity, data);
            console.log(`[LOG-FLUXO] Sucesso: Novo registro criado em ${entity}. ID: ${registroCriado.id || 'Gerado'}`);
            res.status(201).json(registroCriado);
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Falha na criação de registro em ${entity}: ${msg}`);
            res.status(400).json({ error: msg });
        }
    }
    /**
     * Realiza a criação de múltiplos registros (Batch Insert) em uma entidade.
     * @param {Request} req - Params: entity | Body: Array de objetos.
     * @param {Response} res - Resposta HTTP.
     */
    static async criarMultiplos(req, res) {
        const { entity } = req.params;
        const data = req.body;
        console.log(`[LOG-FLUXO] Iniciando criarMultiplos em ${entity}.`);
        try {
            // Ramificação condicional: Validação de estrutura de dados (Array)
            if (!Array.isArray(data)) {
                console.error(`[ERRO-FLUXO] Rejeitado: O corpo da requisição para criarMultiplos não é um array.`);
                return res.status(400).json({
                    error: 'O corpo da requisição deve ser um array',
                });
            }
            console.log(`[LOG-FLUXO] Processando lote de ${data.length} registros para a entidade ${entity}.`);
            const resultado = await Service_Crud_1.default.createMany(entity, data);
            console.log(`[LOG-FLUXO] Batch insert finalizado. Registros afetados: ${resultado.count}.`);
            res.status(201).json(resultado);
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Falha no processamento em lote para ${entity}: ${msg}`);
            res.status(400).json({ error: msg });
        }
    }
    /**
     * Atualiza um registro existente através de seu ID.
     * @param {Request} req - Params: entity, id | Body: Dados para atualização.
     * @param {Response} res - Resposta HTTP.
     */
    static async atualizarRegistro(req, res) {
        const { entity, id } = req.params;
        const data = req.body;
        console.log(`[LOG-FLUXO] Iniciando atualizarRegistro. Entidade: ${entity}, ID: ${id}`);
        try {
            console.log(`[LOG-FLUXO] Enviando PATCH para ServiceCrud.update.`);
            const registroAtualizado = await Service_Crud_1.default.update(entity, id, data);
            console.log(`[LOG-FLUXO] Sucesso: Registro ${id} em ${entity} foi atualizado.`);
            res.json(registroAtualizado);
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Falha na atualização do registro ${id} (${entity}): ${msg}`);
            res.status(400).json({ error: msg });
        }
    }
    /**
     * Remove fisicamente um registro do banco de dados via ID.
     * @param {Request} req - Params: entity, id.
     * @param {Response} res - Resposta HTTP 204 (No Content).
     */
    static async deletarRegistro(req, res) {
        const { entity, id } = req.params;
        console.log(`[LOG-FLUXO] Iniciando deletarRegistro. Entidade: ${entity}, ID: ${id}`);
        try {
            console.log(`[LOG-FLUXO] Solicitando exclusão definitiva ao ServiceCrud.delete.`);
            await Service_Crud_1.default.delete(entity, id);
            console.log(`[LOG-FLUXO] Sucesso: Registro ${id} removido da entidade ${entity}.`);
            res.status(204).send();
        }
        catch (error) {
            const msg = getErrorMessage(error);
            console.error(`[ERRO-FLUXO] Erro crítico ao deletar registro ${id} em ${entity}: ${msg}`);
            res.status(400).json({ error: msg });
        }
    }
}
exports.default = CrudController;
