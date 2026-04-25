"use strict";
/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Classe de serviço responsável pela orquestração de contratações e agendamentos,
 * gerenciando a persistência na tabela de contratações e consultas temporais na agenda dos prestadores.
 * Integra lógica de transição de status (Aceite/Finalização) e Registro Manual para métricas.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const Service_Crud_1 = __importDefault(require("./Service_Crud"));
console.log('[LOG-FLUXO] Inicializando instância do PrismaClient para o ServiceAgendamento.');
const prisma = new client_1.PrismaClient();
class ServiceAgendamento {
    /**
     * Cria uma nova contratação no sistema com status inicial 'pendente'.
     * Nota: O registro na tabela 'agenda' é gerado automaticamente via trigger no banco de dados.
     * @param {any} data - Objeto contendo dados da contratação (cliente_id, prestador_id, preco, etc).
     * @returns {Promise<any>} - O registro da contratação criada.
     * @throws {Error} - Lança erro em caso de falha na persistência dos dados.
     */
    static async criarAgendamento(data) {
        console.log(`[LOG-FLUXO] Iniciando criarAgendamento. Payload recebido: ${JSON.stringify(data)}`);
        const { cliente_id, prestador_id, tipo_prestador, data: dataAgendamento, hora_inicio, hora_fim, preco, observacoes, } = data;
        try {
            console.log(`[LOG-FLUXO] Preparando inserção de novo contrato pendente para o Cliente: ${cliente_id} e Prestador: ${prestador_id}`);
            console.log("[LOG-FLUXO] Invocando ServiceCrud.create na entidade 'contratacoes'.");
            const contratacao = await Service_Crud_1.default.create('contratacoes', {
                cliente_id,
                prestador_id,
                tipo_prestador,
                data: new Date(dataAgendamento),
                hora_inicio,
                hora_fim,
                preco,
                status: 'pendente',
                observacoes,
            });
            console.log(`[LOG-FLUXO] Sucesso: Contratação ID ${contratacao.id} criada com status: ${contratacao.status}.`);
            return contratacao;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha crítica ao registrar contratação: ${error.message}`);
            throw error;
        }
    }
    /**
     * Aceita uma contratação pendente, alterando o status para 'confirmado' e liberando dados de contato.
     * @param {number} contratacaoId - Identificador numérico da contratação.
     * @returns {Promise<any>} - Objeto da contratação atualizada.
     * @throws {Error} - Lança erro em caso de falha no update do Prisma.
     */
    static async aceitarContratacao(contratacaoId) {
        console.log(`[LOG-FLUXO] Iniciando aceitarContratacao para o registro ID: ${contratacaoId}`);
        try {
            // Regra de Ouro: Bypass de tipagem para enums Prisma mantendo consistência
            console.log('[LOG-FLUXO] Mapeando transição de status para: confirmado.');
            const statusConfirmado = 'confirmado';
            console.log(`[LOG-FLUXO] Executando update na tabela 'contratacoes' para o ID: ${contratacaoId}`);
            const resultado = await prisma.contratacoes.update({
                where: { id: Number(contratacaoId) },
                data: { status: statusConfirmado },
            });
            console.log(`[LOG-FLUXO] Sucesso: Contratação ${contratacaoId} CONFIRMADA. O Privacy Gate foi liberado para as partes.`);
            return resultado;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha ao processar o aceite da contratação ${contratacaoId}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Finaliza uma contratação, marcando o serviço como concluído para viabilizar o fluxo de avaliações.
     * @param {number} contratacaoId - Identificador numérico da contratação.
     * @returns {Promise<any>} - Objeto da contratação concluída.
     * @throws {Error} - Lança erro em caso de falha na persistência.
     */
    static async finalizarContratacao(contratacaoId) {
        console.log(`[LOG-FLUXO] Iniciando finalizarContratacao para o registro ID: ${contratacaoId}`);
        try {
            console.log('[LOG-FLUXO] Mapeando transição de status para: concluido.');
            const statusConcluido = 'concluido';
            console.log(`[LOG-FLUXO] Solicitando atualização definitiva para o ID: ${contratacaoId}`);
            const resultado = await prisma.contratacoes.update({
                where: { id: Number(contratacaoId) },
                data: { status: statusConcluido },
            });
            console.log(`[LOG-FLUXO] Sucesso: Contratação ${contratacaoId} CONCLUÍDA. Fluxo de negócio pronto para Etapa 4 (Avaliação).`);
            return resultado;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro crítico ao finalizar serviço ID ${contratacaoId}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Registra um serviço realizado de forma externa, mantendo a integridade das métricas do prestador.
     * @param {any} data - Objeto contendo os dados do serviço externo.
     * @returns {Promise<any>} - O registro da contratação manual criada.
     * @throws {Error} - Lança erro em caso de falha na inserção.
     */
    static async registroManual(data) {
        console.log(`[LOG-FLUXO] Iniciando registroManual de serviço externo para o prestador: ${data.prestador_id}`);
        try {
            console.log('[LOG-FLUXO] Mapeando entrada para status: manual.');
            const statusManual = 'manual';
            console.log("[LOG-FLUXO] Executando inserção direta via Prisma na tabela 'contratacoes'.");
            const registro = await prisma.contratacoes.create({
                data: {
                    ...data,
                    status: statusManual,
                    data: new Date(data.data),
                },
            });
            console.log(`[LOG-FLUXO] Sucesso: Registro manual ID ${registro.id} inserido para fins de métricas de experiência.`);
            return registro;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha ao processar registro manual externo: ${error.message}`);
            throw error;
        }
    }
    /**
     * Recupera o histórico de agendamentos de um prestador filtrado por uma janela temporal em dias.
     * @param {number} tempoEmDias - Intervalo de dias retroativos.
     * @param {string} prestadorId - UUID/ID do prestador.
     * @returns {Promise<any[]>} - Lista de registros localizados na agenda.
     * @throws {Error} - Lança erro em caso de falha na consulta.
     */
    static async listar_agendamentos_por_tempo(tempoEmDias, prestadorId) {
        console.log(`[LOG-FLUXO] Iniciando listar_agendamentos_por_tempo. Prestador: ${prestadorId}, Janela: ${tempoEmDias} dias.`);
        try {
            const hoje = new Date();
            const dataInicial = new Date();
            dataInicial.setDate(hoje.getDate() - tempoEmDias);
            console.log(`[LOG-FLUXO] Filtro temporal configurado: De ${dataInicial.toISOString()} até ${hoje.toISOString()}`);
            console.log("[LOG-FLUXO] Consultando ServiceCrud.findMany na entidade 'agenda' com filtros espaciais.");
            const agendamentos = await Service_Crud_1.default.findMany('agenda', {
                where: {
                    prestador_id: prestadorId,
                    data: { gte: dataInicial, lte: hoje },
                },
            });
            console.log(`[LOG-FLUXO] Busca cronológica concluída. Registros encontrados: ${agendamentos ? agendamentos.length : 0}`);
            return agendamentos;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha ao recuperar agenda temporal do prestador ${prestadorId}: ${error.message}`);
            throw error;
        }
    }
    /**
     * Retorna o histórico de todas as contratações vinculadas a um determinado cliente.
     * @param {string} clienteId - UUID/ID do cliente.
     * @returns {Promise<any[]>} - Lista de contratações do cliente.
     * @throws {Error} - Lança erro em caso de falha na consulta por campo.
     */
    static async agendamentos_cliente(clienteId) {
        console.log(`[LOG-FLUXO] Iniciando agendamentos_cliente para o Cliente ID: ${clienteId}`);
        try {
            console.log(`[LOG-FLUXO] Executando ServiceCrud.findByField na tabela 'contratacoes' para cliente_id: ${clienteId}`);
            const agendamentos = await Service_Crud_1.default.findByField('contratacoes', 'cliente_id', clienteId);
            console.log(`[LOG-FLUXO] Sucesso ao recuperar histórico do cliente ${clienteId}. Total: ${agendamentos ? agendamentos.length : 0} itens.`);
            return agendamentos;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro ao buscar histórico de contratações do cliente ${clienteId}: ${error.message}`);
            throw error;
        }
    }
}
exports.default = ServiceAgendamento;
