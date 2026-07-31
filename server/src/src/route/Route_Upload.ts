// server/src/src/route/Route_Upload.ts

import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controller/Controller_Upload';
import {
  exigirUploadsHabilitados,
  validarArquivosUploadCadastro,
  validarTokenUploadCadastro,
} from '../middleware/uploadCadastro';
import { validarEntrada } from '../middleware/validacaoEntrada';
import { uploadCadastroBodySchema } from '../validator/schemas/rotasSensiveis';

const UploadRouter = Router();

// A configuração que estava no seu middleware agora vive aqui,
// mas otimizada para o nosso novo fluxo.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB para aguentar todos os docs juntos
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Formato não suportado. Use JPG, PNG, WebP ou PDF.',
        ),
      );
    }
  },
});

// Mapeamento dos campos que o Multer deve "caçar" no FormData
const camposCadastro = [
  { name: 'foto', maxCount: 1 },
  { name: 'identidade', maxCount: 1 },
  { name: 'cnh', maxCount: 1 },
  { name: 'certificado', maxCount: 1 },
  { name: 'antecedentes', maxCount: 1 },
];

// Rota integrada
UploadRouter.post(
  '/completar-cadastro',
  exigirUploadsHabilitados,
  validarTokenUploadCadastro,
  upload.fields(camposCadastro),
  validarEntrada(uploadCadastroBodySchema),
  validarArquivosUploadCadastro,
  UploadController.fazerUpload,
);

export default UploadRouter;
