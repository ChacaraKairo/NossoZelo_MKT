export interface PrestadorCardData {
  id: string;
  nome: string;
  tipo: string;
  localidade: string;
  imageUrl: string;
  precoHora?: number;
  avaliacao?: number;
  cidade?: string;
  estado?: string;
  bairro?: string;
  disponibilidade?: string | boolean;
  especialidades?: string[] | string;
  verificado?: boolean;
}
