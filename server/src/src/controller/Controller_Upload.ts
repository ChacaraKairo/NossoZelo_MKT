/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Controller responsável por mediar as operações de upload de arquivos,
 * capturando payloads multipart/form-data e delegando a persistência física para o StorageService.
 * @rota server\src\src\controller\Controller_Upload.ts
 */

import { Request, Response } from 'express';
import { StorageService } from '../service/Service_Storage';

export class UploadController {
  /**
   * Endpoint para processamento de upload de arquivos.
   * Suporta definição de pasta de destino e nome customizado para o arquivo.
   * @param {Request} req - Requisição Express contendo o arquivo (Multer) e metadados no body.
   * @param {Response} res - Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} - Lança erro em caso de falha no processamento do buffer ou escrita em disco.
   */
  static async fazerUpload(
    req: Request,
    res: Response,
  ): Promise<void> {
    console.log(
      `[LOG-FLUXO] Iniciando fazerUpload no UploadController. Verificando presença de arquivo.`,
    );

    try {
      // Ramificação condicional: Validação de presença do arquivo (Fail Fast)
      if (!req.file) {
        console.error(
          `[ERRO-FLUXO] Falha na requisição de upload: Nenhum arquivo foi detectado no multipart/form-data.`,
        );
        res.status(400).json({
          message: 'Nenhum arquivo enviado na requisição.',
        });
        return;
      }

      console.log(
        `[LOG-FLUXO] Arquivo recebido: ${req.file.originalname} (${req.file.size} bytes). Processando metadados do body.`,
      );

      // Definição de variáveis mantendo nomes originais
      const pastaDesejada = req.body.pasta || 'geral';
      const nomeCustomizado = req.body.nomeCustomizado;

      console.log(
        `[LOG-FLUXO] Configurações de destino -> Pasta: '${pastaDesejada}', Nome Sugerido: '${
          nomeCustomizado || 'Gerado Automaticamente'
        }'.`,
      );

      // Invocação de serviço assíncrono
      console.log(
        `[LOG-FLUXO] Delegando persistência para StorageService.uploadFile.`,
      );
      const urlFinal = await StorageService.uploadFile(
        req.file,
        pastaDesejada,
        nomeCustomizado,
      );

      console.log(
        `[LOG-FLUXO] Persistência concluída com sucesso. URL de acesso gerada: ${urlFinal}`,
      );

      res.status(200).json({ url: urlFinal });

      console.log(
        `[LOG-FLUXO] Resposta enviada ao cliente com status 200.`,
      );
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Exceção crítica capturada no UploadController.fazerUpload: ${
          error.message || error
        }`,
      );

      res.status(500).json({
        message:
          error.message ||
          'Erro interno ao processar o upload.',
      });
    }
  }
}

export default UploadController;
