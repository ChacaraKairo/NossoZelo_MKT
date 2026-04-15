/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 15/04/2026
 * @description Definição das rotas de upload de arquivos, utilizando o middleware Multer
 * para interceptação de buffers em memória (RAM) e delegação ao controlador de persistência.
 * @rota server\src\src\route\Route_Upload
 */

import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controller/Controller_Upload';

console.log(
  '[LOG-FLUXO] Inicializando UploadRouter para gestão de arquivos.',
);
const UploadRouter = Router();

/**
 * Configuração do Multer utilizando memoryStorage.
 * O arquivo não toca no disco rígido nesta etapa; permanece como Buffer na RAM para processamento volátil.
 */
console.log(
  '[LOG-FLUXO] Configurando middleware Multer com estratégia de memoryStorage.',
);
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint: POST /
// Prefixo herdado do roteador principal: /nossozelo/upload
console.log(
  '[LOG-FLUXO] Mapeando Rota: POST / -> UploadController.fazerUpload (Interceptor: single "file")',
);
/**
 * O middleware "upload.single('file')" diz ao Multer para interceptar o arquivo enviado com o nome 'file'.
 */
UploadRouter.post(
  '/',
  upload.single('file'),
  UploadController.fazerUpload,
);

console.log(
  '[LOG-FLUXO] UploadRouter configurado com sucesso e pronto para interceptar streams de dados.',
);

export default UploadRouter;
