"use strict";
/**
 * @author Kairo Chácara & Gemini Sócio
 * @version 2.1
 * @description Controller orquestrador para múltiplos uploads de prestadores.
 * Garante que o vínculo entre S3 e Banco de Dados ocorra de forma atômica por arquivo.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const Service_Storage_1 = require("../service/Service_Storage");
class UploadController {
    /**
     * Endpoint: POST /nossozelo/upload/completar-cadastro
     * Processa paralelamente cada arquivo enviado, garantindo a conversão e o vínculo no MySQL.
     */
    static async fazerUpload(req, res) {
        console.log(`[LOG-FLUXO] Iniciando Controller de Upload.`);
        // 1. Recuperação de arquivos e metadados
        const arquivos = req.files;
        // 🔥 Captura o ID real do usuário e o SessionID do Body
        const { usuarioId, sessionId } = req.body;
        // Validação de segurança: Sem usuarioId, o vínculo na tabela documentos_cuidadores falha.
        if (!usuarioId || usuarioId === 'undefined') {
            console.error('[ERRO-CONTROLLER] Tentativa de upload sem usuarioId válido.');
            res.status(400).json({
                error: 'ID do usuário (usuarioId) não fornecido ou inválido. O vínculo no banco é impossível.',
            });
            return;
        }
        if (!arquivos || Object.keys(arquivos).length === 0) {
            res
                .status(400)
                .json({
                error: 'Nenhum arquivo detectado para processamento.',
            });
            return;
        }
        try {
            const resultados = {};
            /**
             * 🔥 LÓGICA DE ORQUESTRAÇÃO PARALELA:
             * Mapeamos os campos (foto, identidade, certificado, antecedentes) enviados.
             */
            const promises = Object.keys(arquivos).map(async (campo) => {
                const arquivo = arquivos[campo][0];
                const isPrivado = campo !== 'foto'; // Apenas o campo 'foto' vai para o bucket público.
                console.log(`[LOG-UPLOAD] Orquestrando processamento para o campo: ${campo} (Privado: ${isPrivado})`);
                /**
                 * Delega para o StorageService a responsabilidade de:
                 * 1. Converter Imagem para JPG (Sharp)
                 * 2. Renomear com {usuarioId}_{campo}_{random}
                 * 3. Persistir no S3 correspondente
                 * 4. Criar registro na tabela documentos_cuidadores ou atualizar usuário
                 */
                const urlOuKey = await Service_Storage_1.StorageService.processarUploadEVinculo(arquivo, usuarioId, campo, isPrivado, sessionId);
                resultados[campo] = urlOuKey;
            });
            // Aguarda todos os processos terminarem para dar a resposta única ao frontend.
            await Promise.all(promises);
            console.log(`[LOG-SUCESSO] Todos os vínculos realizados para o usuário: ${usuarioId}`);
            res.status(200).json({
                message: 'Todos os documentos foram processados, convertidos e vinculados com sucesso.',
                data: resultados,
            });
        }
        catch (error) {
            console.error(`[ERRO-CONTROLLER] Falha crítica na orquestração: ${error.message}`);
            res.status(500).json({
                error: 'Erro interno ao processar e vincular arquivos.',
                details: error.message,
            });
        }
    }
}
exports.UploadController = UploadController;
exports.default = UploadController;
