// client/src/pages/meu-perfil/types.ts

export interface PerfilCompleto {
  id: string;
  nome: string;
  email: string;
  url_foto_perfil?: string;
  tipo: 'cliente' | 'cuidador' | 'enfermeiro' | 'acompanhante';
  telefone?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  avaliacao_media: number;
  // 🔥 Dados trazidos pelo nosso include do Prisma
  servicos: any[]; 
  agenda: any[];
  avaliacoes_avaliacoes_prestador_idTousuarios: any[];
}