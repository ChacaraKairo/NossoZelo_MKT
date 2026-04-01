import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controller/Controller_Upload';

const UploadRouter = Router();

// 🔥 A MÁGICA DO MULTER AQUI: memoryStorage!
// O arquivo não toca no disco rígido ainda. Fica em "buffer" (RAM).
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint: POST /nossozelo/upload
// O middleware "upload.single('file')" diz ao Multer para intercetar o arquivo enviado com o nome 'file'
UploadRouter.post(
  '/',
  upload.single('file'),
  UploadController.fazerUpload,
);

export default UploadRouter;
