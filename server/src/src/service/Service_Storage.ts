/**
 * @author Kairo Chácara
 * @version 1.1
 * @date 14/04/2026
 * @description Classe de serviço responsável pelo gerenciamento de persistência de arquivos na AWS S3.
 * Roteia automaticamente entre buckets públicos (imagens) e privados (documentos).
 * @rota server\src\src\service\Service_Storage.ts
 */

import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import path from 'path';
import { nanoid } from 'nanoid';

// 1. Inicializa o cliente do S3 usando as chaves do seu arquivo .env
const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env
      .AWS_SECRET_ACCESS_KEY as string,
  },
});

export class StorageService {
  /**
   * Realiza o upload de arquivos para a AWS S3.
   * @param {Express.Multer.File} file - Objeto de arquivo processado pelo middleware Multer (precisa usar memoryStorage).
   * @param {string} [pastaDestino='geral'] - Nome da subpasta dentro do bucket S3.
   * @param {string} [nomeCustomizado] - Nome opcional sugerido para o arquivo.
   * @param {boolean} [isPrivado=false] - Define se vai para o bucket de Documentos (Privado) ou Imagens (Público).
   * @returns {Promise<string>} - Retorna a URL completa do S3 ou a chave do arquivo.
   */
  static async uploadFile(
    file: Express.Multer.File,
    pastaDestino: string = 'geral',
    nomeCustomizado?: string,
    isPrivado: boolean = false,
  ): Promise<string> {
    console.log(
      `[LOG-FLUXO] Iniciando upload S3. Parâmetros: pastaDestino='${pastaDestino}', Privado: ${isPrivado}, originalName='${file.originalname}', fileSize=${file.size} bytes`,
    );

    try {
      const extensao = path.extname(file.originalname);

      console.log(
        '[LOG-FLUXO] Processando definição do nome de persistência.',
      );
      const nomeArquivo = nomeCustomizado
        ? `${nomeCustomizado}${extensao}`
        : `${nanoid(15)}${extensao}`;

      // No S3 não temos pastas reais, usamos o "Key" para simular o caminho
      const s3Key = `${pastaDestino}/${nomeArquivo}`;

      // Decide qual bucket usar baseado no nível de segurança exigido
      const bucketName = isPrivado
        ? process.env.AWS_PRIVATE_BUCKET_NAME
        : process.env.AWS_PUBLIC_BUCKET_NAME;

      console.log(
        `[LOG-FLUXO] Solicitando escrita no S3: Bucket '${bucketName}' | Key: '${s3Key}'`,
      );

      // 2. Monta o comando de envio para a AWS
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        Body: file.buffer, // O arquivo cru na memória
        ContentType: file.mimetype, // Ex: 'image/jpeg' ou 'application/pdf'
      });

      // 3. Dispara o envio
      await s3Client.send(command);
      console.log(
        `[LOG-FLUXO] Sincronização com AWS S3 concluída para o arquivo: ${nomeArquivo}`,
      );

      // 4. Retorno
      // Se for privado, retornamos apenas o caminho (s3Key) para o banco de dados.
      // Se for público, podemos retornar a URL direta que o S3 gera.
      if (isPrivado) {
        return s3Key; // Você salvará essa key no banco MySQL para gerar URL assinada depois
      } else {
        const urlFinal = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        console.log(
          `[LOG-FLUXO] Operação uploadFile finalizada com sucesso. URL Pública: ${urlFinal}`,
        );
        return urlFinal;
      }
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Falha crítica no upload S3 (Bucket: destino). Motivo: ${
          error.message || error
        }. Detalhes: ${JSON.stringify(error)}`,
      );
      throw error;
    }
  }
}

export default StorageService;
