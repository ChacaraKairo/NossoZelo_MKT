import { AssinaturaAtual } from '@/types/perfil';

export type EtapaOnboardingPrestador =
  | 'confirmar_email'
  | 'completar_perfil'
  | 'escolher_plano'
  | 'pagar_assinatura'
  | 'aguardando_confirmacao_pagamento'
  | 'ativo'
  | 'inadimplente'
  | 'bloqueado';

export interface OnboardingStatus {
  tipoUsuario: string;
  isPrestador: boolean;
  emailConfirmado: boolean;
  possuiDadosProfissionais: boolean;
  possuiAssinatura: boolean;
  assinaturaStatus: string | null;
  assinatura?: AssinaturaAtual | null;
  statusCadastro: string;
  etapaAtual: EtapaOnboardingPrestador;
  perfilProfissionalAtivo: boolean;
  podeAparecerNaBusca: boolean;
  podeReceberPedidos: boolean;
  proximaAcao: string;
}
