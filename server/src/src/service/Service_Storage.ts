import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export class StorageService {
  static async uploadFile(
    file: Express.Multer.File,
    pastaDestino: string = 'geral',
    nomeCustomizado?: string, // 🔥 NOVO: Recebemos o nome sugerido pelo frontend
  ): Promise<string> {
    const extensao = path.extname(file.originalname);

    // Se o frontend mandou "12345_1", o nome fica "12345_1.jpg". Se não mandou, gera um nanoid aleatório.
    const nomeArquivo = nomeCustomizado
      ? `${nomeCustomizado}${extensao}`
      : `${nanoid(15)}${extensao}`;

    const uploadDir = path.join(
      __dirname,
      `../../../uploads/${pastaDestino}`,
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const caminhoCompleto = path.join(
      uploadDir,
      nomeArquivo,
    );
    fs.writeFileSync(caminhoCompleto, file.buffer);

    const baseUrl =
      process.env.API_URL || 'http://localhost:4000';
    return `${baseUrl}/uploads/${pastaDestino}/${nomeArquivo}`;
  }
}
