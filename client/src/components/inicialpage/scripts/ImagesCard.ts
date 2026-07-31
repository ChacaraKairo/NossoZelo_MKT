export interface CategoriaCard {
  id: number;
  imageUrl: string;
  alt: string;
  tipo:
    | 'acompanhante'
    | 'enfermeiro'
    | 'cuidador'
    | 'baba'
    | 'diarista'
    | 'motorista_assistencial';
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
      'Busque profissionais de enfermagem para cuidados de saude e acompanhamento especializado.',
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
  {
    id: 4,
    imageUrl: '/home/baba.png',
    alt: 'Babá profissional',
    tipo: 'baba',
    titulo: 'Babás',
    descricao:
      'Encontre apoio confiável para cuidado infantil, rotina e acompanhamento.',
    cta: 'Ver babás',
  },
  {
    id: 5,
    imageUrl: '/home/diarista.png',
    alt: 'Diarista profissional',
    tipo: 'diarista',
    titulo: 'Diaristas/Faxineiras',
    descricao:
      'Busque profissionais para limpeza, organização e apoio doméstico.',
    cta: 'Ver diaristas',
  },
  {
    id: 6,
    imageUrl: '/home/motorista-assistencial.png',
    alt: 'Motorista assistencial',
    tipo: 'motorista_assistencial',
    titulo: 'Motoristas assistenciais',
    descricao:
      'Transporte acompanhado para idosos em consultas, exames e compromissos.',
    cta: 'Ver motoristas',
  },
];

export default ImagesCard;
