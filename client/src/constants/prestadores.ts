export const TIPOS_PRESTADOR = [
  'cuidador',
  'enfermeiro',
  'acompanhante',
  'baba',
  'diarista',
  'motorista_assistencial',
] as const;

export type TipoPrestador = (typeof TIPOS_PRESTADOR)[number];

export const LABEL_TIPO_PRESTADOR: Record<TipoPrestador, string> = {
  cuidador: 'Cuidador',
  enfermeiro: 'Enfermeiro',
  acompanhante: 'Acompanhante',
  baba: 'Babá',
  diarista: 'Diarista/Faxineira',
  motorista_assistencial: 'Motorista assistencial',
};

export const CATEGORIAS_PRESTADOR = TIPOS_PRESTADOR.map((value) => ({
  value,
  label: LABEL_TIPO_PRESTADOR[value],
}));

export const CATEGORIAS_PRESTADOR_LABELS = CATEGORIAS_PRESTADOR.map(
  (categoria) => categoria.label,
);

type CampoFormularioPrestador = {
  titulo: string;
  descricao: string;
  experienciaLabel: string;
  experienciaPlaceholder: string;
  valorHoraLabel: string;
  valorHoraPlaceholder: string;
  valorDiariaLabel: string;
  valorDiariaPlaceholder: string;
  disponibilidadeLabel: string;
  disponibilidadePlaceholder: string;
  especialidadesLabel: string;
  especialidadesPlaceholder: string;
  bioLabel: string;
  bioPlaceholder: string;
};

export const FORMULARIO_PRESTADOR: Record<
  TipoPrestador,
  CampoFormularioPrestador
> = {
  cuidador: {
    titulo: 'Formulario de cuidador',
    descricao:
      'Informe sua experiencia com idosos, rotina de cuidado e disponibilidade para atendimentos domiciliares.',
    experienciaLabel: 'Anos de experiencia com cuidado',
    experienciaPlaceholder: 'Ex: 4',
    valorHoraLabel: 'Valor por hora de cuidado (R$)',
    valorHoraPlaceholder: 'Ex: 45',
    valorDiariaLabel: 'Valor por diaria ou plantao (R$)',
    valorDiariaPlaceholder: 'Ex: 280',
    disponibilidadeLabel: 'Disponibilidade para cuidado',
    disponibilidadePlaceholder: 'Ex: segunda a sexta, manha e tarde',
    especialidadesLabel: 'Tipos de cuidado e necessidades atendidas',
    especialidadesPlaceholder:
      'Ex: Alzheimer, mobilidade reduzida, banho, alimentacao, companhia',
    bioLabel: 'Apresentacao como cuidador',
    bioPlaceholder:
      'Conte sua experiencia, seu jeito de cuidar e como costuma apoiar a familia.',
  },
  enfermeiro: {
    titulo: 'Formulario de enfermeiro',
    descricao:
      'Informe seu registro profissional, experiencia assistencial e procedimentos que realiza.',
    experienciaLabel: 'Anos de experiencia em enfermagem',
    experienciaPlaceholder: 'Ex: 6',
    valorHoraLabel: 'Valor por hora de atendimento (R$)',
    valorHoraPlaceholder: 'Ex: 90',
    valorDiariaLabel: 'Valor por plantao ou diaria (R$)',
    valorDiariaPlaceholder: 'Ex: 450',
    disponibilidadeLabel: 'Disponibilidade para atendimentos',
    disponibilidadePlaceholder: 'Ex: plantoes noturnos e finais de semana',
    especialidadesLabel: 'Procedimentos e areas de atuacao',
    especialidadesPlaceholder:
      'Ex: curativos, medicacao, pos-operatorio, acompanhamento hospitalar',
    bioLabel: 'Apresentacao profissional de enfermagem',
    bioPlaceholder:
      'Descreva sua formacao, experiencia clinica e cuidados que realiza com seguranca.',
  },
  acompanhante: {
    titulo: 'Formulario de acompanhante',
    descricao:
      'Informe sua experiencia em companhia, apoio em rotinas e acompanhamento externo.',
    experienciaLabel: 'Anos de experiencia como acompanhante',
    experienciaPlaceholder: 'Ex: 3',
    valorHoraLabel: 'Valor por hora de acompanhamento (R$)',
    valorHoraPlaceholder: 'Ex: 40',
    valorDiariaLabel: 'Valor por diaria de acompanhamento (R$)',
    valorDiariaPlaceholder: 'Ex: 240',
    disponibilidadeLabel: 'Disponibilidade para acompanhamento',
    disponibilidadePlaceholder: 'Ex: consultas, exames e periodo da tarde',
    especialidadesLabel: 'Tipos de acompanhamento',
    especialidadesPlaceholder:
      'Ex: consultas medicas, compras, passeios, companhia em casa',
    bioLabel: 'Apresentacao como acompanhante',
    bioPlaceholder:
      'Conte como voce apoia a rotina, conversa com a familia e acompanha deslocamentos.',
  },
  baba: {
    titulo: 'Formulario de baba',
    descricao:
      'Informe sua experiencia com criancas, rotina infantil e atividades que costuma conduzir.',
    experienciaLabel: 'Anos de experiencia com criancas',
    experienciaPlaceholder: 'Ex: 5',
    valorHoraLabel: 'Valor por hora de cuidado infantil (R$)',
    valorHoraPlaceholder: 'Ex: 55',
    valorDiariaLabel: 'Valor por diaria de baba (R$)',
    valorDiariaPlaceholder: 'Ex: 300',
    disponibilidadeLabel: 'Disponibilidade para familias',
    disponibilidadePlaceholder: 'Ex: segunda a sexta, saida da escola e noite',
    especialidadesLabel: 'Idades, rotinas e atividades infantis',
    especialidadesPlaceholder:
      'Ex: bebe, crianca pequena, rotina escolar, brincadeiras educativas',
    bioLabel: 'Apresentacao como baba',
    bioPlaceholder:
      'Conte sua experiencia com criancas, cuidados de seguranca e como organiza a rotina.',
  },
  diarista: {
    titulo: 'Formulario de diarista/faxineira',
    descricao:
      'Informe os tipos de limpeza que realiza, organizacao e disponibilidade por diaria.',
    experienciaLabel: 'Anos de experiencia com limpeza',
    experienciaPlaceholder: 'Ex: 7',
    valorHoraLabel: 'Valor por hora avulsa (R$)',
    valorHoraPlaceholder: 'Ex: 45',
    valorDiariaLabel: 'Valor por diaria ou faxina (R$)',
    valorDiariaPlaceholder: 'Ex: 250',
    disponibilidadeLabel: 'Disponibilidade para faxinas',
    disponibilidadePlaceholder: 'Ex: tercas, quintas e sabados',
    especialidadesLabel: 'Tipos de limpeza e organizacao',
    especialidadesPlaceholder:
      'Ex: faxina residencial, organizacao, pos-obra leve, limpeza pesada',
    bioLabel: 'Apresentacao como diarista/faxineira',
    bioPlaceholder:
      'Conte sua experiencia, seu padrao de limpeza e cuidados com os ambientes.',
  },
  motorista_assistencial: {
    titulo: 'Formulario de motorista assistencial',
    descricao:
      'Informe sua experiencia em transporte acompanhado, disponibilidade e dados do veiculo.',
    experienciaLabel: 'Anos de experiencia dirigindo profissionalmente',
    experienciaPlaceholder: 'Ex: 9',
    valorHoraLabel: 'Valor por hora ou deslocamento (R$)',
    valorHoraPlaceholder: 'Ex: 80',
    valorDiariaLabel: 'Valor por diaria de transporte (R$)',
    valorDiariaPlaceholder: 'Ex: 420',
    disponibilidadeLabel: 'Disponibilidade para deslocamentos',
    disponibilidadePlaceholder: 'Ex: consultas, exames e compromissos pela manha',
    especialidadesLabel: 'Tipos de transporte assistencial',
    especialidadesPlaceholder:
      'Ex: idosos, consultas medicas, porta a porta, apoio em embarque',
    bioLabel: 'Apresentacao como motorista assistencial',
    bioPlaceholder:
      'Conte sua experiencia com transporte seguro, pontualidade e apoio a idosos.',
  },
};

export function ehTipoPrestador(tipo?: string | null): tipo is TipoPrestador {
  return TIPOS_PRESTADOR.includes(tipo as TipoPrestador);
}

export function formatarTipoPrestador(tipo?: string | null) {
  if (!tipo) return 'Prestador';
  if (ehTipoPrestador(tipo)) return LABEL_TIPO_PRESTADOR[tipo];

  return tipo
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}
