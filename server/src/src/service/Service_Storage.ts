/**
 * @author Kairo Chácara & Gemini Sócio
 * @version 3.2
 * @description Service orquestrador: Processamento -> S3 -> Banco de Dados (MySQL).
 */

import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// server/src/src/service/Service_Storage.ts

const s3Client = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    // 🔥 CORREÇÃO: O nome correto da propriedade é accessKeyId
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env
      .AWS_SECRET_ACCESS_KEY as string,
  },
});

export class StorageService {
  /**
   * FUNÇÃO MESTRE: Orquestra o fluxo completo.
   * Adicionado sessionId como 5º argumento para resolver o erro de tipagem.
   */
  static async processarUploadEVinculo(
    file: Express.Multer.File,
    usuarioId: string,
    tipoDoc:
      | 'foto'
      | 'identidade'
      | 'certificado'
      | 'antecedentes',
    isPrivado: boolean = false,
    sessionId?: string, // 🔥 Agora aceita o 5º argumento vindo do Controller
  ): Promise<string> {
    // 1. Otimização (PNG -> JPG)
    const { buffer, mimetype, extensao } =
      await this.otimizarImagem(file);

    // 2. Nomenclatura Padrão: user_{id/sessao}_{tipo}_{random}
    // Priorizamos o sessionId para o nome do arquivo se disponível
    const identificadorNome = sessionId || usuarioId;
    const nomeArquivo = `user_${identificadorNome}_${tipoDoc}_${nanoid(6)}${extensao}`;

    const pastaS3 = isPrivado ? 'documentos' : 'fotos';
    const s3Key = `${pastaS3}/${nomeArquivo}`;

    const bucket = isPrivado
      ? process.env.AWS_PRIVATE_BUCKET_NAME
      : process.env.AWS_PUBLIC_BUCKET_NAME;

    // 3. Persistência na AWS
    const urlOuKey = await this.persistirNoS3(
      buffer,
      s3Key,
      bucket!,
      mimetype,
      isPrivado,
    );

    // 4. Persistência no Banco (MySQL)
    await this.registrarNoBanco(
      usuarioId,
      tipoDoc,
      urlOuKey,
    );

    return urlOuKey;
  }

  private static async otimizarImagem(
    file: Express.Multer.File,
  ) {
    let buffer = file.buffer;
    let extensao = path
      .extname(file.originalname)
      .toLowerCase();
    let mimetype = file.mimetype;

    if (
      mimetype.startsWith('image/') &&
      !mimetype.includes('gif')
    ) {
      buffer = await sharp(file.buffer)
        .jpeg({ quality: 80 })
        .toBuffer();
      extensao = '.jpg';
      mimetype = 'image/jpeg';
    }
    return { buffer, mimetype, extensao };
  }

  private static async persistirNoS3(
    buffer: Buffer,
    key: string,
    bucket: string,
    mimetype: string,
    isPrivado: boolean,
  ) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    return isPrivado
      ? key
      : `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  private static async registrarNoBanco(
    usuarioId: string,
    tipoDoc: string,
    caminho: string,
  ) {
    try {
      if (tipoDoc === 'foto') {
        await prisma.usuarios.update({
          where: { id: usuarioId },
          data: { url_foto_perfil: caminho },
        });
      } else {
        // Vincula na tabela de documentos_cuidadores
        await prisma.documentos_cuidadores.create({
          data: {
            usuario_id: usuarioId, // 🔥 FK garantida pelo ID validado no Controller
            tipo: tipoDoc,
            url_arquivo: caminho,
          },
        });
      }
    } catch (error: any) {
      console.error(
        `[ERRO-DB-SERVICE] Falha ao registrar ${tipoDoc}:`,
        error.message,
      );
      throw error;
    }
  }
}

export default StorageService;
