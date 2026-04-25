"use strict";
/**
 * @author Kairo Chácara & Gemini Sócio
 * @version 3.2
 * @description Service orquestrador: Processamento -> S3 -> Banco de Dados (MySQL).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = __importDefault(require("path"));
const nanoid_1 = require("nanoid");
const sharp_1 = __importDefault(require("sharp"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// server/src/src/service/Service_Storage.ts
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        // 🔥 CORREÇÃO: O nome correto da propriedade é accessKeyId
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env
            .AWS_SECRET_ACCESS_KEY,
    },
});
class StorageService {
    /**
     * FUNÇÃO MESTRE: Orquestra o fluxo completo.
     * Adicionado sessionId como 5º argumento para resolver o erro de tipagem.
     */
    static async processarUploadEVinculo(file, usuarioId, tipoDoc, isPrivado = false, sessionId) {
        // 1. Otimização (PNG -> JPG)
        const { buffer, mimetype, extensao } = await this.otimizarImagem(file);
        // 2. Nomenclatura Padrão: user_{id/sessao}_{tipo}_{random}
        // Priorizamos o sessionId para o nome do arquivo se disponível
        const identificadorNome = sessionId || usuarioId;
        const nomeArquivo = `user_${identificadorNome}_${tipoDoc}_${(0, nanoid_1.nanoid)(6)}${extensao}`;
        const pastaS3 = isPrivado ? 'documentos' : 'fotos';
        const s3Key = `${pastaS3}/${nomeArquivo}`;
        const bucket = isPrivado
            ? process.env.AWS_PRIVATE_BUCKET_NAME
            : process.env.AWS_PUBLIC_BUCKET_NAME;
        // 3. Persistência na AWS
        const urlOuKey = await this.persistirNoS3(buffer, s3Key, bucket, mimetype, isPrivado);
        // 4. Persistência no Banco (MySQL)
        await this.registrarNoBanco(usuarioId, tipoDoc, urlOuKey);
        return urlOuKey;
    }
    static async otimizarImagem(file) {
        let buffer = file.buffer;
        let extensao = path_1.default
            .extname(file.originalname)
            .toLowerCase();
        let mimetype = file.mimetype;
        if (mimetype.startsWith('image/') &&
            !mimetype.includes('gif')) {
            buffer = await (0, sharp_1.default)(file.buffer)
                .jpeg({ quality: 80 })
                .toBuffer();
            extensao = '.jpg';
            mimetype = 'image/jpeg';
        }
        return { buffer, mimetype, extensao };
    }
    static async persistirNoS3(buffer, key, bucket, mimetype, isPrivado) {
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        }));
        return isPrivado
            ? key
            : `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
    static async registrarNoBanco(usuarioId, tipoDoc, caminho) {
        try {
            if (tipoDoc === 'foto') {
                await prisma.usuarios.update({
                    where: { id: usuarioId },
                    data: { url_foto_perfil: caminho },
                });
            }
            else {
                // Vincula na tabela de documentos_cuidadores
                await prisma.documentos_cuidadores.create({
                    data: {
                        usuario_id: usuarioId, // 🔥 FK garantida pelo ID validado no Controller
                        tipo: tipoDoc,
                        url_arquivo: caminho,
                    },
                });
            }
        }
        catch (error) {
            console.error(`[ERRO-DB-SERVICE] Falha ao registrar ${tipoDoc}:`, error.message);
            throw error;
        }
    }
}
exports.StorageService = StorageService;
exports.default = StorageService;
