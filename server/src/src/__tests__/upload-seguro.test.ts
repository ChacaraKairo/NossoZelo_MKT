import express from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  usuariosUpdate: vi.fn(),
  documentosCreate: vi.fn(),
  logsCreate: vi.fn(),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  PutObjectCommand: vi.fn().mockImplementation(function PutObjectCommandMock(input) {
    return { input };
  }),
  S3Client: vi.fn().mockImplementation(function S3ClientMock() {
    return { send: mocks.send };
  }),
}));

vi.mock('../lib/prisma', () => ({
  default: {
    usuarios: { update: mocks.usuariosUpdate },
    documentos_cuidadores: { create: mocks.documentosCreate },
    logs_acao: { create: mocks.logsCreate },
  },
}));

import UploadRouter from '../route/Route_Upload';
import { StorageService } from '../service/Service_Storage';

function appUpload() {
  const app = express();
  app.use('/upload', UploadRouter);
  return app;
}

function pdfTeste(): Express.Multer.File {
  return {
    fieldname: 'identidade',
    originalname: 'identidade.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 14,
    buffer: Buffer.from('%PDF-1.4 teste'),
    stream: undefined as never,
    destination: '',
    filename: '',
    path: '',
  };
}

describe('uploads seguros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'aws-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'aws-secret';
    process.env.AWS_PUBLIC_BUCKET_NAME = 'bucket-publico';
    process.env.AWS_PRIVATE_BUCKET_NAME = 'bucket-privado';
    process.env.UPLOAD_SCAN_MODE = 'disabled';
    mocks.send.mockResolvedValue({});
    mocks.usuariosUpdate.mockResolvedValue({});
    mocks.documentosCreate.mockResolvedValue({});
    mocks.logsCreate.mockResolvedValue({});
  });

  afterEach(() => {
    delete process.env.ENABLE_UPLOADS;
  });

  it('bloqueia rota quando ENABLE_UPLOADS nao esta habilitado', async () => {
    process.env.ENABLE_UPLOADS = 'false';

    const response = await request(appUpload()).post('/upload/completar-cadastro');

    expect(response.status).toBe(503);
    expect(response.body.error).toBe('Uploads indisponiveis.');
  });

  it('armazena documento privado como chave interna e registra auditoria', async () => {
    process.env.ENABLE_UPLOADS = 'true';

    const resultado = await StorageService.processarUploadEVinculo(
      pdfTeste(),
      'usuario-1',
      'identidade',
      true,
      'sessao-1',
    );

    expect(resultado).toMatch(/^documentos\/user_sessao-1_identidade_/);
    expect(resultado).not.toMatch(/^https?:\/\//);
    expect(mocks.documentosCreate).toHaveBeenCalledWith({
      data: {
        usuario_id: 'usuario-1',
        tipo: 'identidade',
        url_arquivo: resultado,
      },
    });
    expect(mocks.logsCreate).toHaveBeenCalledTimes(2);
    expect(mocks.logsCreate).toHaveBeenCalledWith({
      data: {
        usuario_id: 'usuario-1',
        tabela_afetada: 'upload_identidade_scan_aprovado',
        acao: 'INSERT',
      },
    });
    expect(mocks.logsCreate).toHaveBeenCalledWith({
      data: {
        usuario_id: 'usuario-1',
        tabela_afetada: 'upload_identidade_liberado',
        acao: 'INSERT',
      },
    });
  });
});
