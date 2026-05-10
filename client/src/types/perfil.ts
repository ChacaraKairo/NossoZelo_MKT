export type TipoUsuario =
  | 'cliente'
  | 'cuidador'
  | 'enfermeiro'
  | 'acompanhante'
  | string;

export interface PerfilBase {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  estado?: string | null;
  bairro?: string | null;
  endereco?: string | null;
  url_foto_perfil?: string | null;
  tipo: TipoUsuario;
  avaliacao_media?: number | string | null;
  perfil_tipo?: TipoUsuario;
  status_cadastro?: string | null;
  email_confirmado?: boolean | null;
}

export interface AssinaturaAtual {
  id: number;
  prestador_id: string;
  plano_id: number;
  status: string;
  gateway?: string | null;
  gateway_customer_id?: string | null;
  gateway_subscription_id?: string | null;
  gateway_payment_id?: string | null;
  gateway_status?: string | null;
  data_ultimo_pagamento?: string | Date | null;
  data_proximo_vencimento?: string | Date | null;
  periodo_tolerancia_ate?: string | Date | null;
  confirmacao_expira_em?: string | Date | null;
  cancelada_em?: string | Date | null;
}

export interface ServicoPerfil {
  id: number;
  nome?: string | null;
  descricao?: string | null;
  valor?: number | string | null;
  tipo?: string | null;
  tipo_cobranca?: 'hora' | 'dia' | string | null;
}

export interface AgendaPerfil {
  id: number | string;
  contratacao_id?: number;
  origem?: 'agenda' | 'contratacao' | string;
  data: string | Date;
  status: string;
  observacao?: string | null;
  observacoes?: string | null;
  hora_inicio?: string | Date | null;
  hora_fim?: string | Date | null;
  preco?: number | string | null;
  cliente?: {
    id?: string | null;
    nome?: string | null;
    url_foto_perfil?: string | null;
  } | null;
}

export interface AvaliacaoPerfil {
  id: number;
  contratacao_id?: number;
  autor_id?: string;
  avaliado_id?: string;
  tipo_autor?: 'cliente' | 'prestador' | string;
  tipo_avaliacao?:
    | 'cliente_para_prestador'
    | 'prestador_para_cliente'
    | string;
  nota: number | null;
  comentario?: string | null;
  data_avaliacao: string | Date | null;
  cliente?: Partial<PerfilBase>;
  usuarios_avaliacoes_cliente_idTousuarios?: {
    nome: string;
    url_foto_perfil?: string | null;
  };
}

export interface ContratacaoPerfil {
  id: number;
  cliente_id: string;
  prestador_id: string;
  tipo_prestador?: string | null;
  status: string | null;
  data?: string | Date | null;
  hora_inicio?: string | Date | null;
  hora_fim?: string | Date | null;
  preco?: number | string | null;
  observacoes?: string | null;
  cancelado_por?: 'cliente' | 'prestador' | 'admin' | string | null;
  motivo_cancelamento?: string | null;
  cancelado_em?: string | Date | null;
  cancelamento_tardio?: boolean | null;
  nao_realizado_motivo?: string | null;
  nao_realizado_em?: string | Date | null;
  servico_id?: number | null;
  servico?: Partial<ServicoPerfil> | null;
  servicos?: Partial<ServicoPerfil> | null;
  usuarios_contratacoes_cliente_idTousuarios?: {
    nome?: string | null;
    url_foto_perfil?: string | null;
  };
  usuarios_contratacoes_prestador_idTousuarios?: {
    nome?: string | null;
    url_foto_perfil?: string | null;
  };
  avaliacao?: AvaliacaoPerfil | null;
  avaliacoes?: AvaliacaoPerfil[];
  mensagem_usuario?: string;
}

export interface PerfilUsuario extends PerfilBase {
  servicos?: ServicoPerfil[];
  agenda?: AgendaPerfil[];
  avaliacoes_avaliacoes_prestador_idTousuarios?: AvaliacaoPerfil[];
  avaliacoes_recebidas?: AvaliacaoPerfil[];
  avaliacoes_feitas?: AvaliacaoPerfil[];
  contratacoes_contratacoes_prestador_idTousuarios?: ContratacaoPerfil[];
  contratacoes_contratacoes_cliente_idTousuarios?: ContratacaoPerfil[];
  contratacoes?: ContratacaoPerfil[];
  dados_usuario?: PerfilBase;
  dados_profissionais?: Partial<PerfilUsuario> | null;
  bio?: string | null;
  anos_experiencia?: number | null;
  coren?: string | null;
  valor_hora?: number | string | null;
  valor_diaria?: number | string | null;
  disponibilidade?: string | null;
  especialidades?: string[] | string | null;
  assinatura_atual?: AssinaturaAtual | null;
  assinatura_status?: string | null;
  assinatura_confirmacao_expira_em?: string | Date | null;
  perfil_profissional_ativo?: boolean | null;
  motivo_perfil_inativo?: string | null;
}

export interface PerfilPrestadorPublico
  extends Omit<
    PerfilBase,
    'email' | 'telefone' | 'endereco'
  > {
  servicos?: ServicoPerfil[];
  rating: number;
  pode_ver_contato: boolean;
  contatos?: {
    email?: string | null;
    telefone?: string | null;
    cidade?: string | null;
    estado?: string | null;
  };
  [campo: string]: unknown;
}

export interface PerfilClienteParaPrestador {
  id: string;
  nome: string;
  url_foto_perfil?: string | null;
  cidade?: string | null;
  estado?: string | null;
  bairro?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  contato_liberado: boolean;
  contratacao_id: number;
  status_contratacao: string | null;
}

export type AtualizarPerfilPayload = Partial<{
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  bairro: string;
  endereco: string;
}>;
