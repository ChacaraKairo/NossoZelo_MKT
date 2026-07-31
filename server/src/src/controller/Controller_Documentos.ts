import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import ServiceDocumentos from '../service/Service_Documentos';

function responderErro(res: Response, error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : 'Erro inesperado.';
  return res.status(status).json({ error: message });
}

export class DocumentosController {
  static async upload(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario nao autenticado.' });
      const documento = await ServiceDocumentos.uploadDocumento(
        req.user,
        req.body?.tipo_documento,
        req.file,
      );
      return res.status(201).json({
        message: 'Documento enviado para revisao.',
        documentoId: documento.id,
        status: documento.status,
        documento,
      });
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async analisar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario nao autenticado.' });
      const documento = await ServiceDocumentos.uploadDocumento(
        req.user,
        req.body?.tipo_documento,
        req.file,
      );
      return res.status(201).json({
        documentoId: documento.id,
        tipoDocumentoDetectado: documento.analise?.tipo_detectado,
        status: documento.status,
        sinal: documento.analise?.sinal,
        score: documento.analise?.score,
        dadosExtraidos: documento.analise?.dados_extraidos,
        validacoes: documento.analise?.validacoes,
        pendencias: documento.analise?.pendencias,
        precisaRevisaoManual: documento.analise?.precisa_revisao,
        analise: documento.analise,
      });
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async status(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario nao autenticado.' });
      const status = await ServiceDocumentos.obterStatus(req.user);
      return res.json(status);
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async listarPendentes(req: AuthRequest, res: Response) {
    try {
      if (req.user?.tipo !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
      const documentos = await ServiceDocumentos.listarPendentes();
      return res.json({ documentos });
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async detalhar(req: AuthRequest, res: Response) {
    try {
      if (req.user?.tipo !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
      const documento = await ServiceDocumentos.detalhar(Number(req.params.id));
      return res.json({ documento });
    } catch (error) {
      return responderErro(res, error, 404);
    }
  }

  static async aprovar(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.tipo !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
      const resultado = await ServiceDocumentos.aprovar(req.user, Number(req.params.id), req.body?.motivo);
      return res.json({ message: 'Documento aprovado.', ...resultado });
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async recusar(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.tipo !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
      const resultado = await ServiceDocumentos.recusar(req.user, Number(req.params.id), req.body?.motivo);
      return res.json({ message: 'Documento recusado.', ...resultado });
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async reprocessar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario nao autenticado.' });
      const documento = await ServiceDocumentos.reprocessar(req.user, Number(req.params.id));
      return res.json({ message: 'Documento reenviado para revisao.', documento });
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async reanalisar(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario nao autenticado.' });
      const analise = await ServiceDocumentos.reanalisar(req.user, Number(req.params.id));
      return res.json({
        documentoId: Number(req.params.id),
        sinal: analise.sinal,
        score: analise.score,
        precisaRevisaoManual: analise.precisa_revisao,
        motivo: analise.motivo,
        analise,
      });
    } catch (error) {
      return responderErro(res, error);
    }
  }

  static async obterAnalise(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ error: 'Usuario nao autenticado.' });
      const analise = await ServiceDocumentos.obterAnalise(req.user, Number(req.params.id));
      return res.json({
        documentoId: Number(req.params.id),
        sinal: analise.sinal,
        score: analise.score,
        precisaRevisaoManual: analise.precisa_revisao,
        motivo: analise.motivo,
        analise,
      });
    } catch (error) {
      return responderErro(res, error, 404);
    }
  }
}

export default DocumentosController;
