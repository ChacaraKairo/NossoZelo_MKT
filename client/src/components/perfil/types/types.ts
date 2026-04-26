// client/src/components/perfil/types/types.ts

import type { ContratacaoPerfil } from '@/types/perfil';

export interface Servico {
  id: number;
  nome: string;
  descricao: string;
  valor: string | number; // Decimal do Prisma geralmente vem como string ou number no JSON
  tipo_cobranca: 'hora' | 'dia';
}

export interface AgendaItem {
  id: number;
  data: string | Date;
  hora_inicio: string | Date;
  hora_fim: string | Date;
  status: 'disponivel' | 'ocupado' | 'indisponivel';
  observacoes?: string;
}

export interface Avaliacao {
  id: number;
  nota: number;
  comentario?: string;
  data_avaliacao: string | Date;
  // Se vier com dados do cliente (include)
  usuarios_avaliacoes_cliente_idTousuarios?: {
    nome: string;
    url_foto_perfil?: string;
  };
}

export interface Contratacao {
  id: number;
  cliente_id: string;
  prestador_id: string;
  status: string | null;
  data?: string | Date | null;
  servico_id?: number | null;
  usuarios_contratacoes_cliente_idTousuarios?: {
    nome?: string | null;
    url_foto_perfil?: string | null;
  };
  usuarios_contratacoes_prestador_idTousuarios?: {
    nome?: string | null;
    url_foto_perfil?: string | null;
  };
}

export interface PerfilCompleto {
  id: string;
  nome: string;
  email: string;
  url_foto_perfil?: string;
  tipo:
    | 'cliente'
    | 'cuidador'
    | 'enfermeiro'
    | 'acompanhante';
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  avaliacao_media: number;

  // 🔥 Tipagem Estrita Baseada no Prisma (Adeus, any!)
  servicos?: Servico[];
  agenda?: AgendaItem[];
  avaliacoes_avaliacoes_prestador_idTousuarios?: Avaliacao[];
  contratacoes?: Contratacao[];
  contratacoes_contratacoes_prestador_idTousuarios?: Contratacao[];
  contratacoes_contratacoes_cliente_idTousuarios?: Contratacao[];
  avaliacoes_feitas?: Avaliacao[];

  // Campos específicos de prestadores
  bio?: string;
  anos_experiencia?: number;
  coren?: string; // Específico para Enfermeiros
}
