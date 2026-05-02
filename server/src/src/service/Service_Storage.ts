import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import prisma from '../lib/prisma';

// TODO: adicionar varredura antivirus/quarentena antes de liberar documentos.

let s3Client: S3Client | null = null;

function obterConfigAws(isPrivado: boolean) {
  const bucket = isPrivado
    ? process.env.AWS_PRIVATE_BUCKET_NAME
    : process.env.AWS_PUBLIC_BUCKET_NAME;
  const obrigatorias = {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    bucket,
  };
  const ausentes = Object.entries(obrigatorias)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (ausentes.length > 0) {
    throw new Error(`Configuracao AWS incompleta: ${ausentes.join(', ')}.`);
  }

  return {
    region: process.env.AWS_REGION as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    bucket: bucket as string,
  };
}

function obterS3Client(config: ReturnType<typeof obterConfigAws>) {
  if (!s3Client) {
    s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

export class StorageService {
  static async processarUploadEVinculo(
    file: Express.Multer.File,
    usuarioId: string,
    tipoDoc: 'foto' | 'identidade' | 'certificado' | 'antecedentes',
    isPrivado = false,
    sessionId?: string,
  ): Promise<string> {
    const { buffer, mimetype, extensao } = await this.otimizarImagem(file);
    const identificadorNome = sessionId || usuarioId;
    const nomeArquivo = `user_${identificadorNome}_${tipoDoc}_${nanoid(6)}${extensao}`;
    const pastaS3 = isPrivado ? 'documentos' : 'fotos';
    const s3Key = `${pastaS3}/${nomeArquivo}`;
    const awsConfig = obterConfigAws(isPrivado);

    const urlOuKey = await this.persistirNoS3(
      buffer,
      s3Key,
      awsConfig,
      mimetype,
      isPrivado,
    );

    await this.registrarNoBanco(usuarioId, tipoDoc, urlOuKey);
    return urlOuKey;
  }

  private static async otimizarImagem(file: Express.Multer.File) {
    let buffer = file.buffer;
    let extensao = path.extname(file.originalname).toLowerCase();
    let mimetype = file.mimetype;

    if (mimetype.startsWith('image/') && !mimetype.includes('gif')) {
      buffer = await sharp(file.buffer).jpeg({ quality: 80 }).toBuffer();
      extensao = '.jpg';
      mimetype = 'image/jpeg';
    }

    return { buffer, mimetype, extensao };
  }

  private static async persistirNoS3(
    buffer: Buffer,
    key: string,
    awsConfig: ReturnType<typeof obterConfigAws>,
    mimetype: string,
    isPrivado: boolean,
  ) {
    await obterS3Client(awsConfig).send(
      new PutObjectCommand({
        Bucket: awsConfig.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    return isPrivado
      ? key
      : `https://${awsConfig.bucket}.s3.${awsConfig.region}.amazonaws.com/${key}`;
  }

  private static async registrarNoBanco(
    usuarioId: string,
    tipoDoc: string,
    caminho: string,
  ) {
    if (tipoDoc === 'foto') {
      await prisma.usuarios.update({
        where: { id: usuarioId },
        data: { url_foto_perfil: caminho },
      });
      return;
    }

    await prisma.documentos_cuidadores.create({
      data: {
        usuario_id: usuarioId,
        tipo: tipoDoc,
        url_arquivo: caminho,
      },
    });
  }
}

export default StorageService;
