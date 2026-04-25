"use strict";
/**
 * @author Kairo Chácara & ZeloArchitect AI
 * @version 1.1
 * @date 22/04/2026
 * @description Controller para gestão de perfis.
 * Corrigido erro de tipagem no acesso aos dados de contato.
 * @rota server\src\src\controller\Controller_Perfil.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Service_Perfil_1 = require("../service/Service_Perfil");
const camposProtegidosPerfil = [
    'id',
    'email',
    'senha',
    'cpf',
    'tipo',
    'role',
    'admin',
    'avaliacao_media',
    'criado_em',
    'updated_at',
];
function removerCamposProtegidos(dados) {
    const dadosLimpos = { ...dados };
    for (const campo of camposProtegidosPerfil) {
        delete dadosLimpos[campo];
    }
    return dadosLimpos;
}
function statusErroPerfil(error) {
    const mensagem = String(error?.message || '').toLowerCase();
    if (error?.code === 'P2025' || mensagem.includes('não encontrado')) {
        return 404;
    }
    if (mensagem.includes('não autorizado') ||
        mensagem.includes('token')) {
        return 401;
    }
    if (mensagem.includes('acesso negado') ||
        mensagem.includes('apenas prestadores')) {
        return 403;
    }
    return 400;
}
class ControllerPerfil {
    /**
     * Recupera o perfil completo do usuário autenticado (Dashboard).
     */
    async obterMeuPerfil(req, res) {
        console.log(`[LOG-FLUXO] Controller: Iniciando obterMeuPerfil.`);
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                return res.status(401).json({
                    error: 'Não autorizado: Token inválido ou ausente.',
                });
            }
            // Chama o Service que agora traz Agenda, Serviços e Avaliações inclusos
            const perfil = await Service_Perfil_1.ServicePerfil.obterMeuPerfilCompleto(usuarioId);
            return res.status(200).json(perfil);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro em obterMeuPerfil: ${error.message}`);
            return res
                .status(statusErroPerfil(error))
                .json({ error: error.message });
        }
    }
    async obterResumoPerfil(req, res) {
        console.log(`[LOG-FLUXO] Controller: Iniciando obterResumoPerfil.`);
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                return res.status(401).json({
                    error: 'Não autorizado: Token inválido ou ausente.',
                });
            }
            const resumo = await Service_Perfil_1.ServicePerfil.obterResumoPerfil(usuarioId);
            return res.status(200).json(resumo);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro em obterResumoPerfil: ${error.message}`);
            return res
                .status(statusErroPerfil(error))
                .json({ error: error.message });
        }
    }
    /**
     * Atualiza dados parciais do perfil do usuário logado.
     */
    async atualizarDadosPerfil(req, res) {
        console.log(`[LOG-FLUXO] Controller: Iniciando atualizarDadosPerfil.`);
        try {
            const usuarioId = req.user?.id;
            const tipo = req.user?.tipo;
            if (!usuarioId || !tipo) {
                return res.status(401).json({
                    error: 'Não autorizado: Token inválido ou ausente (tipo não identificado).',
                });
            }
            const dados = req.body;
            if (!dados || Object.keys(dados).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum dado fornecido para atualização.',
                });
            }
            const dadosLimpos = removerCamposProtegidos(dados);
            if (Object.keys(dadosLimpos).length === 0) {
                return res.status(400).json({
                    error: 'Nenhum campo permitido fornecido para atualização.',
                });
            }
            const perfilAtualizado = await Service_Perfil_1.ServicePerfil.atualizarDados(usuarioId, tipo, dadosLimpos);
            return res.status(200).json(perfilAtualizado);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro em atualizarDadosPerfil: ${error.message}`);
            return res
                .status(statusErroPerfil(error))
                .json({ error: error.message });
        }
    }
    /**
     * Retorna a vitrine pública de um prestador.
     */
    async vitrinePrestador(req, res) {
        const { id } = req.params;
        try {
            const vitrine = await Service_Perfil_1.ServicePerfil.obterVitrinePrestador(id);
            return res.status(200).json(vitrine);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro em vitrinePrestador: ${error.message}`);
            return res
                .status(404)
                .json({ error: 'Prestador não encontrado' });
        }
    }
    /**
     * BUG FIX: Corrigido o acesso à propriedade 'contato_liberado'
     */
    async dadosClienteParaPrestador(req, res) {
        try {
            const clienteId = req.params.id;
            const prestadorId = req.user?.id;
            const tipo = req.user?.tipo;
            if (!prestadorId) {
                return res
                    .status(401)
                    .json({ error: 'Não autorizado' });
            }
            const tiposPrestador = [
                'cuidador',
                'enfermeiro',
                'acompanhante',
            ];
            if (!tipo || !tiposPrestador.includes(tipo)) {
                return res.status(403).json({
                    error: 'Apenas prestadores podem acessar dados de clientes.',
                });
            }
            console.log(`[LOG-FLUXO] Buscando dados do cliente ${clienteId} para o prestador ${prestadorId}`);
            // Aguarda o retorno do Service
            const dados = await Service_Perfil_1.ServicePerfil.obterDadosClienteParaPrestador(clienteId, prestadorId);
            // Se o service não retornar dados (ex: sem permissão), retorna 404.
            if (!dados) {
                return res
                    .status(404)
                    .json({ error: 'Dados não localizados.' });
            }
            // Log de telemetria atualizado para evitar erro de compilação
            console.log(`[LOG-FLUXO] Resposta enviada. Contato Liberado: ${dados.contato_liberado ? 'SIM' : 'NÃO'}`);
            return res.status(200).json(dados);
        }
        catch (error) {
            console.error(`[ERRO-FLUXO] Erro em dadosClienteParaPrestador: ${error.message}`);
            return res
                .status(statusErroPerfil(error))
                .json({ error: error.message });
        }
    }
}
// Exportamos uma instância da classe para manter o padrão singleton
exports.default = new ControllerPerfil();
