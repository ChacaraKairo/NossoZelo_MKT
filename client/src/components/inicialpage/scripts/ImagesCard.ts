export interface CategoriaCard {
  id: number;
  imageUrl: string;
  alt: string;
  tipo: 'acompanhante' | 'enfermeiro' | 'cuidador';
  titulo: string;
  descricao: string;
  cta: string;
}

const ImagesCard: CategoriaCard[] = [
  {
    id: 1,
    imageUrl: '/home/acompanhante2.png',
    alt: 'Acompanhante profissional',
    tipo: 'acompanhante',
    titulo: 'Acompanhantes',
    descricao:
      'Encontre apoio para rotinas, consultas e acompanhamento de quem precisa de presença cuidadosa.',
    cta: 'Ver acompanhantes',
  },
  {
    id: 2,
    imageUrl: '/home/enfermeiro.png',
    alt: 'Enfermeiro profissional',
    tipo: 'enfermeiro',
    titulo: 'Enfermeiros',
    descricao:
      'Busque profissionais de enfermagem para cuidados técnicos e acompanhamento especializado.',
    cta: 'Ver enfermeiros',
  },
  {
    id: 3,
    imageUrl: '/home/cuidador.png',
    alt: 'Cuidador profissional',
    tipo: 'cuidador',
    titulo: 'Cuidadores',
    descricao:
      'Encontre profissionais para apoio diário, cuidado domiciliar e bem-estar contínuo.',
    cta: 'Ver cuidadores',
  },
];

export default ImagesCard;
