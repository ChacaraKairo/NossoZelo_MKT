import { Request, Response } from 'express';
import { StorageService } from '../service/Service_Storage';

export class UploadController {
  static async fazerUpload(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      if (!req.file) {
        res
          .status(400)
          .json({
            message:
              'Nenhum arquivo enviado na requisição.',
          });
        return;
      }

      const pastaDesejada = req.body.pasta || 'geral';

      // 🔥 NOVO: Lemos o nome customizado enviado pelo frontend (ex: "id_1")
      const nomeCustomizado = req.body.nomeCustomizado;

      // Passamos a pasta e o nome para o Service
      const urlFinal = await StorageService.uploadFile(
        req.file,
        pastaDesejada,
        nomeCustomizado,
      );

      res.status(200).json({ url: urlFinal });
    } catch (error: any) {
      console.error('Erro no UploadController:', error);
      res
        .status(500)
        .json({
          message:
            error.message ||
            'Erro interno ao processar o upload.',
        });
    }
  }
}
