import { Router } from 'express';
import DocumentosController from '../controller/Controller_Documentos';
import { exigirAutenticacao, permitirTipos } from '../middleware/autorizacao';
import {
  uploadDocumentoVerificacao,
  validarArquivoDocumento,
} from '../middleware/documentosUpload';
import { TIPOS_PRESTADOR } from '../constants/dominio';

const DocumentosRouter = Router();

DocumentosRouter.get('/status', exigirAutenticacao, DocumentosController.status);
DocumentosRouter.post(
  '/upload',
  exigirAutenticacao,
  permitirTipos([...TIPOS_PRESTADOR]),
  uploadDocumentoVerificacao.single('arquivo'),
  validarArquivoDocumento,
  DocumentosController.upload,
);
DocumentosRouter.post(
  '/analisar',
  exigirAutenticacao,
  permitirTipos([...TIPOS_PRESTADOR]),
  uploadDocumentoVerificacao.single('arquivo'),
  validarArquivoDocumento,
  DocumentosController.analisar,
);
DocumentosRouter.post('/:id/reprocessar', exigirAutenticacao, DocumentosController.reprocessar);
DocumentosRouter.post('/:id/reanalisar', exigirAutenticacao, DocumentosController.reanalisar);
DocumentosRouter.get('/:id/analise', exigirAutenticacao, DocumentosController.obterAnalise);

DocumentosRouter.get('/admin/pendentes', exigirAutenticacao, permitirTipos(['admin']), DocumentosController.listarPendentes);
DocumentosRouter.get('/admin/:id', exigirAutenticacao, permitirTipos(['admin']), DocumentosController.detalhar);
DocumentosRouter.post('/admin/:id/aprovar', exigirAutenticacao, permitirTipos(['admin']), DocumentosController.aprovar);
DocumentosRouter.post('/admin/:id/recusar', exigirAutenticacao, permitirTipos(['admin']), DocumentosController.recusar);

export default DocumentosRouter;
