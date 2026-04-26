/**
 * @author Kairo Chácara & Gemini Sócio
 * @version 2.1
 * @description Controller orquestrador para múltiplos uploads de prestadores.
 * Garante que o vínculo entre S3 e Banco de Dados ocorra de forma atômica por arquivo.
 */

import { Request, Response } from 'express';
import { StorageService } from '../service/Service_Storage';
import { CadastroUploadRequest } from '../middleware/uploadCadastro';

export class UploadController {
  /**
   * Endpoint: POST /nossozelo/upload/completar-cadastro
   * Processa paralelamente cada arquivo enviado, garantindo a conversão e o vínculo no MySQL.
   */
  static async fazerUpload(
    req: CadastroUploadRequest,
    res: Response,
  ): Promise<void> {
    console.log(
      `[LOG-FLUXO] Iniciando Controller de Upload.`,
    );

    // 1. Recuperação de arquivos e metadados
    const arquivos = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    // 🔥 Captura o ID real do usuário e o SessionID do Body
    const { usuarioId, sessionId } = req.body;
    const usuarioIdToken = req.cadastroUpload?.usuarioId;

    // Validação de segurança: Sem usuarioId, o vínculo na tabela documentos_cuidadores falha.
    if (!usuarioId || usuarioId === 'undefined') {
      console.error(
        '[ERRO-CONTROLLER] Tentativa de upload sem usuarioId válido.',
      );
      res.status(400).json({
        error:
          'ID do usuário (usuarioId) não fornecido ou inválido. O vínculo no banco é impossível.',
      });
      return;
    }

    if (!usuarioIdToken || usuarioIdToken !== usuarioId) {
      console.error(
        '[ERRO-CONTROLLER] Token temporario nao pertence ao usuario informado no upload.',
      );
      res.status(403).json({
        error:
          'Token temporario nao autoriza upload para este usuario.',
        message:
          'Token temporario nao autoriza upload para este usuario.',
      });
      return;
    }

    if (!arquivos || Object.keys(arquivos).length === 0) {
      res
        .status(400)
        .json({
          error:
            'Nenhum arquivo detectado para processamento.',
        });
      return;
    }

    try {
      const resultados: any = {};

      /**
       * 🔥 LÓGICA DE ORQUESTRAÇÃO PARALELA:
       * Mapeamos os campos (foto, identidade, certificado, antecedentes) enviados.
       */
      const promises = Object.keys(arquivos).map(
        async (campo) => {
          const arquivo = arquivos[campo][0];
          const isPrivado = campo !== 'foto'; // Apenas o campo 'foto' vai para o bucket público.

          console.log(
            `[LOG-UPLOAD] Orquestrando processamento para o campo: ${campo} (Privado: ${isPrivado})`,
          );

          /**
           * Delega para o StorageService a responsabilidade de:
           * 1. Converter Imagem para JPG (Sharp)
           * 2. Renomear com {usuarioId}_{campo}_{random}
           * 3. Persistir no S3 correspondente
           * 4. Criar registro na tabela documentos_cuidadores ou atualizar usuário
           */
          const urlOuKey =
            await StorageService.processarUploadEVinculo(
              arquivo,
              usuarioId,
              campo as any,
              isPrivado,
              sessionId, // Passamos o sessionId opcionalmente para reforçar a nomenclatura
            );

          resultados[campo] = urlOuKey;
        },
      );

      // Aguarda todos os processos terminarem para dar a resposta única ao frontend.
      await Promise.all(promises);

      console.log(
        `[LOG-SUCESSO] Todos os vínculos realizados para o usuário: ${usuarioId}`,
      );

      res.status(200).json({
        message:
          'Todos os documentos foram processados, convertidos e vinculados com sucesso.',
        data: resultados,
      });
    } catch (error: any) {
      console.error(
        `[ERRO-CONTROLLER] Falha crítica na orquestração: ${error.message}`,
      );

      res.status(500).json({
        error:
          'Erro interno ao processar e vincular arquivos.',
        details: error.message,
      });
    }
  }
}

export default UploadController;
