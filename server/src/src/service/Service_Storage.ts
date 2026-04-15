/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável pelo gerenciamento de persistência física de arquivos (uploads) no sistema local,
 * cuidando da estruturação de diretórios e geração de URLs acessíveis.
 * @rota server\src\src\service\Service_Storage.ts
 
 */

import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

export class StorageService {
  /**
   * Realiza o upload de arquivos para o sistema local.
   * @param {Express.Multer.File} file - Objeto de arquivo processado pelo middleware Multer.
   * @param {string} [pastaDestino='geral'] - Nome da subpasta dentro do diretório raiz de uploads.
   * @param {string} [nomeCustomizado] - Nome opcional sugerido para o arquivo (sem extensão).
   * @returns {Promise<string>} - Retorna a URL completa e acessível do arquivo após o upload.
   * @throws {Error} - Lança uma exceção caso ocorra falha na escrita física do arquivo ou criação de diretório.
   */
  static async uploadFile(
    file: Express.Multer.File,
    pastaDestino: string = 'geral',
    nomeCustomizado?: string,
  ): Promise<string> {
    console.log(
      `[LOG-FLUXO] Iniciando uploadFile. Parâmetros: pastaDestino='${pastaDestino}', nomeCustomizado='${
        nomeCustomizado || 'N/A'
      }', originalName='${file.originalname}', fileSize=${
        file.size
      } bytes`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Extraindo extensão do arquivo original: ${file.originalname}`,
      );
      const extensao = path.extname(file.originalname);
      console.log(
        `[LOG-FLUXO] Extensão identificada: ${extensao}`,
      );

      // Lógica de definição do nome do arquivo (Preservando nomenclatura)
      console.log(
        '[LOG-FLUXO] Processando definição do nome de persistência.',
      );
      const nomeArquivo = nomeCustomizado
        ? `${nomeCustomizado}${extensao}`
        : `${nanoid(15)}${extensao}`;

      console.log(
        `[LOG-FLUXO] Nome de persistência definido: ${nomeArquivo}`,
      );

      const uploadDir = path.join(
        __dirname,
        `../../../uploads/${pastaDestino}`,
      );

      console.log(
        `[LOG-FLUXO] Verificando infraestrutura de diretórios no sistema de arquivos em: ${uploadDir}`,
      );

      // Garantia de existência do diretório (Ramificação condicional)
      if (!fs.existsSync(uploadDir)) {
        console.log(
          `[LOG-FLUXO] Condição detectada: Diretório '${pastaDestino}' não existe. Iniciando criação recursiva.`,
        );
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(
          '[LOG-FLUXO] Estrutura de pastas criada com sucesso no disco.',
        );
      } else {
        console.log(
          `[LOG-FLUXO] Condição detectada: Diretório de destino já está disponível para escrita.`,
        );
      }

      const caminhoCompleto = path.join(
        uploadDir,
        nomeArquivo,
      );

      console.log(
        `[LOG-FLUXO] Solicitando escrita física do buffer no disco: ${caminhoCompleto}`,
      );

      /**
       * Realiza a escrita síncrona do buffer no disco.
       * Mantendo padrão original de escrita síncrona conforme o código fonte.
       */
      fs.writeFileSync(caminhoCompleto, file.buffer);

      console.log(
        `[LOG-FLUXO] Sincronização de dados concluída para o arquivo: ${nomeArquivo}`,
      );

      console.log(
        '[LOG-FLUXO] Iniciando construção da URL de acesso público via variáveis de ambiente.',
      );
      const baseUrl =
        process.env.API_URL || 'http://localhost:4000';
      const urlFinal = `${baseUrl}/uploads/${pastaDestino}/${nomeArquivo}`;

      console.log(
        `[LOG-FLUXO] Operação uploadFile finalizada com sucesso. URL gerada: ${urlFinal}`,
      );
      return urlFinal;
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica no gerenciamento de armazenamento (Subpasta: ${pastaDestino}). Motivo: ${
          error.message || error
        }. Detalhes técnicos: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}

export default StorageService;
