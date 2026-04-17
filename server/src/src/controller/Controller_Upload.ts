/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 15/04/2026
 * @description Controller responsável por mediar as operações de upload de arquivos,
 * capturando payloads multipart/form-data e delegando a persistência na AWS S3 via StorageService.
 * @rota server\src\src\controller\Controller_Upload.ts
 */

import { Request, Response } from 'express';
import { StorageService } from '../service/Service_Storage';

export class UploadController {
  /**
   * Endpoint para processamento de upload de arquivos para a nuvem.
   * Suporta definição de pasta, nome customizado e privacidade (Público/Privado).
   * @param {Request} req - Requisição Express contendo o arquivo (Multer) e metadados no body.
   * @param {Response} res - Resposta HTTP.
   * @returns {Promise<void>}
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

      // 🔥 Ajuste Sênior: Formulários multipart enviam tudo como string.
      // Se 'true' for enviado, convertemos para o booleano true.
      const isPrivado = req.body.isPrivado === 'true';

      console.log(
        `[LOG-FLUXO] Configurações de destino -> Pasta: '${pastaDesejada}', Nome Sugerido: '${
          nomeCustomizado || 'Gerado Automaticamente'
        }', Privado: ${isPrivado}.`,
      );

      // Invocação de serviço assíncrono repassando a flag de privacidade
      console.log(
        `[LOG-FLUXO] Delegando persistência para StorageService.uploadFile.`,
      );
      const urlOuChaveFinal =
        await StorageService.uploadFile(
          req.file,
          pastaDesejada,
          nomeCustomizado,
          isPrivado, // O S3 agora saberá para qual bucket enviar
        );

      console.log(
        `[LOG-FLUXO] Persistência concluída com sucesso. Retorno do S3: ${urlOuChaveFinal}`,
      );

      // Retorna a URL (se público) ou a AWS Key (se privado)
      res.status(200).json({ url: urlOuChaveFinal });

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
          'Erro interno ao processar o upload para a nuvem.',
      });
    }
  }
}

export default UploadController;
