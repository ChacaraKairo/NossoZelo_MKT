import { PerfilUsuario } from '@/types/perfil';

export const perfilClienteMock: PerfilUsuario = {
  id: 'cliente-1',
  nome: 'Cliente Teste',
  tipo: 'cliente',
  perfil_tipo: 'cliente',
  telefone: '11999999999',
  cidade: 'Indaiatuba',
  estado: 'SP',
  contratacoes_contratacoes_cliente_idTousuarios: [],
};

export const perfilPrestadorMock: PerfilUsuario = {
  id: 'prestador-1',
  nome: 'Prestador Teste',
  tipo: 'cuidador',
  perfil_tipo: 'cuidador',
  telefone: '11988888888',
  cidade: 'Indaiatuba',
  estado: 'SP',
  avaliacao_media: 4.8,
  dados_usuario: {
    id: 'prestador-1',
    nome: 'Prestador Teste',
    tipo: 'cuidador',
  },
  dados_profissionais: {
    bio: 'Atendimento humanizado.',
    anos_experiencia: 5,
    valor_hora: 120,
    disponibilidade: 'Segunda a sexta',
    especialidades: 'Idosos',
  },
  servicos: [
    {
      id: 1,
      nome: 'Acompanhamento',
      descricao: 'Atendimento domiciliar',
      valor: 120,
      tipo: 'hora',
    },
  ],
  agenda: [
    {
      id: 1,
      data: '2026-05-10T10:00:00.000Z',
      status: 'confirmado',
    },
  ],
  avaliacoes_avaliacoes_prestador_idTousuarios: [
    {
      id: 1,
      nota: 5,
      comentario: 'Excelente',
      data_avaliacao: '2026-05-11T10:00:00.000Z',
    },
  ],
  contratacoes_contratacoes_prestador_idTousuarios: [
    {
      id: 7,
      cliente_id: 'cliente-1',
      prestador_id: 'prestador-1',
      status: 'pendente',
      data: '2026-05-10T00:00:00.000Z',
      servico_id: 1,
      usuarios_contratacoes_cliente_idTousuarios: {
        nome: 'Cliente Teste',
      },
    },
  ],
};
