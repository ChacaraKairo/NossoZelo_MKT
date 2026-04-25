"use strict";
/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Service especializado na gestão de Prova Social e Segurança.
 * Orquestra a criação de avaliações e garante a atualização da reputação dos prestadores no banco MySQL.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const Service_Perfil_1 = require("./Service_Perfil");
console.log('[LOG-FLUXO] Inicializando PrismaClient para o ServiceAvaliacao.');
const prisma = new client_1.PrismaClient();
class ServiceAvaliacao {
    /**
     * Registra uma avaliação e atualiza a média aritmética do prestador.
     * A unicidade é garantida pelo vínculo com a contratação (contratacao_id).
     * @param {any} data - Objeto contendo contratacao_id, cliente_id, prestador_id, nota e comentário.
     * @returns {Promise<any>} - O registro da avaliação persistido.
     * @throws {Error} - Lança erro em caso de falha na persistência ou no recálculo da média.
     */
    static async registrarAvaliacao(data) {
        console.log(`[LOG-FLUXO] Iniciando registrarAvaliacao para a Contratação ID: ${data.contratacao_id}`);
        try {
            const contratacaoId = Number(data.contratacao_id);
            const nota = Number(data.nota);
            if (!Number.isInteger(contratacaoId)) {
                throw new Error('Contratação inválida.');
            }
            if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
                throw new Error('A nota deve estar entre 1 e 5.');
            }
            const contratacao = await prisma.contratacoes.findUnique({
                where: { id: contratacaoId },
            });
            if (!contratacao) {
                throw new Error('Contratação não encontrada.');
            }
            if (contratacao.cliente_id !== data.cliente_id) {
                throw new Error('A contratação não pertence ao cliente autenticado.');
            }
            if (contratacao.prestador_id !== data.prestador_id) {
                throw new Error('Prestador informado não corresponde à contratação.');
            }
            if (contratacao.status !==
                'concluido') {
                throw new Error('A contratação precisa estar concluída para ser avaliada.');
            }
            const avaliacaoExistente = await prisma.avaliacoes.findUnique({
                where: { contratacao_id: contratacaoId },
                select: { id: true },
            });
            if (avaliacaoExistente) {
                throw new Error('Esta contratação já possui avaliação.');
            }
            /**
             * 1. PERSISTÊNCIA DA AVALIAÇÃO
             * Realiza o cast explícito para Number para evitar conflitos de tipo com o driver MySQL.
             */
            console.log(`[LOG-FLUXO] Inserindo nota ${data.nota} para o prestador ${data.prestador_id} na tabela 'avaliacoes'.`);
            const novaAvaliacao = await prisma.avaliacoes.create({
                data: {
                    contratacao_id: contratacaoId,
                    cliente_id: data.cliente_id,
                    prestador_id: data.prestador_id,
                    tipo_prestador: contratacao.tipo_prestador,
                    nota,
                    comentario: data.comentario,
                },
            });
            console.log(`[LOG-FLUXO] Sucesso: Avaliação ${novaAvaliacao.id} persistida. Iniciando gatilho de reputação.`);
            /**
             * 2. ATUALIZAÇÃO ATÔMICA DA MÉDIA
             * Reaproveita a lógica centralizada no ServicePerfil para manter a consistência da vitrine.
             */
            console.log(`[LOG-FLUXO] Solicitando recálculo de média ao ServicePerfil para o ID: ${data.prestador_id}`);
            await Service_Perfil_1.ServicePerfil.atualizarMediaAvaliacao(data.prestador_id);
            console.log('[LOG-FLUXO] Fluxo de registro de avaliação e atualização de média concluído.');
            return novaAvaliacao;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha crítica ao registrar avaliação para a contratação ${data.contratacao_id}: ${error.message}`);
            throw new Error(`Erro ao registar avaliação: ${error.message}`);
        }
    }
    /**
     * LEITURA: Procura todos os feedbacks de um prestador.
     * Centraliza como as avaliações são apresentadas (ordem, campos do cliente, etc).
     * @param {string} prestadorId - Identificador único do prestador.
     * @returns {Promise<any[]>} - Lista de avaliações ordenadas com dados dos clientes.
     */
    static async obterAvaliacoesPorPrestador(prestadorId) {
        console.log(`[LOG-FLUXO] Iniciando obterAvaliacoesPorPrestador para o Prestador ID: ${prestadorId}`);
        try {
            const avaliacoes = await prisma.avaliacoes.findMany({
                where: { prestador_id: prestadorId },
                include: {
                    // Traz dados básicos de quem avaliou para a UI
                    usuarios_avaliacoes_cliente_idTousuarios: {
                        select: {
                            nome: true,
                            url_foto_perfil: true,
                        },
                    },
                },
                orderBy: { data_avaliacao: 'desc' },
            });
            console.log(`[LOG-FLUXO] Busca de avaliações concluída. Total encontrado: ${avaliacoes.length}`);
            return avaliacoes;
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Falha ao recuperar avaliações para o prestador ${prestadorId}: ${error.message}`);
            throw new Error(`Erro ao procurar avaliações: ${error.message}`);
        }
    }
}
exports.default = ServiceAvaliacao;
