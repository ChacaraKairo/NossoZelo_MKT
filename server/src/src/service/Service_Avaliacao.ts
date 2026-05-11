import {
  avaliacoes_tipo_autor,
  avaliacoes_tipo_avaliacao,
  contratacoes,
  contratacoes_status,
  Prisma,
} from '@prisma/client';
import prisma from '../lib/prisma';
import { ServicePerfil } from './Service_Perfil';
import { STATUS_CONTRATACAO } from '../constants/dominio';

type UsuarioAvaliacao = {
  id: string;
  tipo?: string;
};

type DisponibilidadeAvaliacao = {
  contratacao_id: number;
  pode_avaliar: boolean;
  tipo_avaliacao: avaliacoes_tipo_avaliacao | null;
  avaliacao_existente: boolean;
  avaliacao_disponivel_em: Date | null;
  motivo_bloqueio: string | null;
  mensagem_usuario: string;
};

const STATUS_AVALIAVEIS = new Set<contratacoes_status>([
  STATUS_CONTRATACAO.confirmado,
  STATUS_CONTRATACAO.concluido,
]);

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

function dataHoraFimServico(contratacao: Pick<contratacoes, 'data' | 'hora_fim'>) {
  const data = new Date(contratacao.data);
  const hora = new Date(contratacao.hora_fim);
  const fim = new Date(data);

  fim.setUTCHours(
    hora.getUTCHours(),
    hora.getUTCMinutes(),
    hora.getUTCSeconds(),
    0,
  );

  return fim;
}

function tipoAvaliacaoDaParte(
  contratacao: Pick<contratacoes, 'cliente_id' | 'prestador_id'>,
  usuario: UsuarioAvaliacao,
) {
  if (usuario.id === contratacao.cliente_id) {
    return {
      tipoAutor: 'cliente' as avaliacoes_tipo_autor,
      tipoAvaliacao:
        'cliente_para_prestador' as avaliacoes_tipo_avaliacao,
      avaliadoId: contratacao.prestador_id,
    };
  }

  if (usuario.id === contratacao.prestador_id) {
    return {
      tipoAutor: 'prestador' as avaliacoes_tipo_autor,
      tipoAvaliacao:
        'prestador_para_cliente' as avaliacoes_tipo_avaliacao,
      avaliadoId: contratacao.cliente_id,
    };
  }

  return null;
}

function respostaDisponibilidade(
  contratacaoId: number,
  tipoAvaliacao: avaliacoes_tipo_avaliacao | null,
  avaliacaoExistente: boolean,
  podeAvaliar: boolean,
  motivo: string | null,
  disponivelEm: Date | null,
): DisponibilidadeAvaliacao {
  return {
    contratacao_id: contratacaoId,
    pode_avaliar: podeAvaliar,
    tipo_avaliacao: tipoAvaliacao,
    avaliacao_existente: avaliacaoExistente,
    avaliacao_disponivel_em: disponivelEm,
    motivo_bloqueio: motivo,
    mensagem_usuario: podeAvaliar
      ? 'A avaliacao ja esta disponivel.'
      : motivo || 'A avaliacao ainda nao esta disponivel.',
  };
}

async function atualizarMediaUsuario(usuarioId: string) {
  const agregacao = await prisma.avaliacoes.aggregate({
    where: { avaliado_id: usuarioId },
    _avg: { nota: true },
  });

  await prisma.usuarios.update({
    where: { id: usuarioId },
    data: {
      avaliacao_media: new Prisma.Decimal(
        Number(agregacao._avg.nota || 0).toFixed(2),
      ),
    },
  });
}

class ServiceAvaliacao {
  static dataHoraFimServico = dataHoraFimServico;

  static async podeAvaliarContratacao(
    contratacao: contratacoes,
    usuario: UsuarioAvaliacao,
    agora = new Date(),
  ): Promise<DisponibilidadeAvaliacao> {
    const papel = tipoAvaliacaoDaParte(contratacao, usuario);

    if (!papel) {
      return respostaDisponibilidade(
        contratacao.id,
        null,
        false,
        false,
        'Apenas cliente e profissional deste atendimento podem avaliar.',
        null,
      );
    }

    const avaliacaoExistente = await prisma.avaliacoes.findFirst({
      where: {
        contratacao_id: contratacao.id,
        autor_id: usuario.id,
      },
      select: { id: true },
    });

    if (avaliacaoExistente) {
      return respostaDisponibilidade(
        contratacao.id,
        papel.tipoAvaliacao,
        true,
        false,
        'Voce ja enviou sua avaliacao para este atendimento.',
        null,
      );
    }

    if (contratacao.status === STATUS_CONTRATACAO.cancelado) {
      return respostaDisponibilidade(
        contratacao.id,
        papel.tipoAvaliacao,
        false,
        false,
        'Atendimentos cancelados nao podem ser avaliados.',
        null,
      );
    }

    if (contratacao.status === STATUS_CONTRATACAO.nao_realizado) {
      return respostaDisponibilidade(
        contratacao.id,
        papel.tipoAvaliacao,
        false,
        false,
        'Atendimentos marcados como nao realizados nao podem ser avaliados.',
        null,
      );
    }

    if (!STATUS_AVALIAVEIS.has(contratacao.status as contratacoes_status)) {
      return respostaDisponibilidade(
        contratacao.id,
        papel.tipoAvaliacao,
        false,
        false,
        'A avaliacao fica disponivel apenas para atendimentos confirmados.',
        null,
      );
    }

    const fimServico = dataHoraFimServico(contratacao);
    if (agora <= fimServico) {
      return respostaDisponibilidade(
        contratacao.id,
        papel.tipoAvaliacao,
        false,
        false,
        'A avaliacao ficara disponivel apos a data e horario final do servico.',
        fimServico,
      );
    }

    return respostaDisponibilidade(
      contratacao.id,
      papel.tipoAvaliacao,
      false,
      true,
      null,
      null,
    );
  }

  static async consultarDisponibilidade(
    contratacaoId: number,
    usuario: UsuarioAvaliacao,
  ) {
    const contratacao = await prisma.contratacoes.findUnique({
      where: { id: contratacaoId },
    });

    if (!contratacao) {
      throw erroNegocio('Atendimento nao encontrado.', 404);
    }

    return this.podeAvaliarContratacao(contratacao, usuario);
  }

  static async registrarAvaliacao(data: any, usuario: UsuarioAvaliacao) {
    const contratacaoId = Number(data.contratacao_id);
    const nota = Number(data.nota);

    if (!usuario?.id) {
      throw erroNegocio('Usuario nao identificado.', 401);
    }

    if (!Number.isInteger(contratacaoId)) {
      throw erroNegocio('Atendimento invalido.', 400);
    }

    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
      throw erroNegocio('A nota deve estar entre 1 e 5.', 400);
    }

    const autor = await prisma.usuarios.findUnique({
      where: { id: usuario.id },
      select: { email_confirmado: true },
    });

    if (!autor?.email_confirmado) {
      throw erroNegocio('Confirme seu e-mail para avaliar.', 403);
    }

    const contratacao = await prisma.contratacoes.findUnique({
      where: { id: contratacaoId },
    });

    if (!contratacao) {
      throw erroNegocio('Atendimento nao encontrado.', 404);
    }

    const disponibilidade = await this.podeAvaliarContratacao(
      contratacao,
      usuario,
    );

    if (!disponibilidade.pode_avaliar) {
      throw erroNegocio(disponibilidade.mensagem_usuario, 409);
    }

    const papel = tipoAvaliacaoDaParte(contratacao, usuario);
    if (!papel) {
      throw erroNegocio(
        'Apenas cliente e profissional deste atendimento podem avaliar.',
        403,
      );
    }

    const novaAvaliacao = await prisma.avaliacoes.create({
      data: {
        contratacao_id: contratacaoId,
        cliente_id: contratacao.cliente_id,
        prestador_id: contratacao.prestador_id,
        autor_id: usuario.id,
        avaliado_id: papel.avaliadoId,
        tipo_autor: papel.tipoAutor,
        tipo_avaliacao: papel.tipoAvaliacao,
        tipo_prestador: contratacao.tipo_prestador,
        nota,
        comentario: data.comentario || null,
      },
    });

    if (papel.tipoAvaliacao === 'cliente_para_prestador') {
      await ServicePerfil.atualizarMediaAvaliacao(
        contratacao.prestador_id,
      );
    } else {
      await atualizarMediaUsuario(contratacao.cliente_id);
    }

    return {
      avaliacao: novaAvaliacao,
      disponibilidade: {
        ...disponibilidade,
        pode_avaliar: false,
        avaliacao_existente: true,
        mensagem_usuario: 'Avaliacao enviada com sucesso.',
      },
    };
  }

  static async listarPendentes(usuario: UsuarioAvaliacao) {
    if (!usuario?.id) {
      throw erroNegocio('Usuario nao identificado.', 401);
    }

    const contratacoes = await prisma.contratacoes.findMany({
      where: {
        OR: [{ cliente_id: usuario.id }, { prestador_id: usuario.id }],
        status: {
          in: [
            STATUS_CONTRATACAO.confirmado,
            STATUS_CONTRATACAO.concluido,
          ],
        },
      },
      include: {
        usuarios_contratacoes_cliente_idTousuarios: {
          select: { nome: true },
        },
        usuarios_contratacoes_prestador_idTousuarios: {
          select: { nome: true },
        },
      },
      orderBy: [{ data: 'desc' }, { hora_fim: 'desc' }],
    });

    const pendentes = [];

    for (const contratacao of contratacoes) {
      const disponibilidade = await this.podeAvaliarContratacao(
        contratacao,
        usuario,
      );

      if (disponibilidade.avaliacao_existente) continue;

      const avaliandoPrestador = usuario.id === contratacao.cliente_id;
      pendentes.push({
        contratacao_id: contratacao.id,
        nome_avaliado: avaliandoPrestador
          ? contratacao.usuarios_contratacoes_prestador_idTousuarios.nome
          : contratacao.usuarios_contratacoes_cliente_idTousuarios.nome,
        tipo_avaliacao: disponibilidade.tipo_avaliacao,
        data_servico: contratacao.data,
        pode_avaliar: disponibilidade.pode_avaliar,
        avaliacao_disponivel_em:
          disponibilidade.avaliacao_disponivel_em,
      });
    }

    return { pendentes };
  }

  static async obterAvaliacoesPorPrestador(prestadorId: string) {
    return prisma.avaliacoes.findMany({
      where: {
        prestador_id: prestadorId,
        tipo_avaliacao: 'cliente_para_prestador',
      },
      include: {
        usuarios_avaliacoes_cliente_idTousuarios: {
          select: {
            nome: true,
            url_foto_perfil: true,
          },
        },
      },
      orderBy: { data_avaliacao: 'desc' },
    });
  }

  static async obterAvaliacoesPorCliente(clienteId: string) {
    return prisma.avaliacoes.findMany({
      where: {
        avaliado_id: clienteId,
        tipo_avaliacao: 'prestador_para_cliente',
      },
      include: {
        usuarios_avaliacoes_autor_idTousuarios: {
          select: {
            nome: true,
            url_foto_perfil: true,
          },
        },
      },
      orderBy: { data_avaliacao: 'desc' },
    });
  }
}

export default ServiceAvaliacao;
