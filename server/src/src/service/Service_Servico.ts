import {
  servicos_tipo_cobranca,
  servicos_tipo_prestador,
} from '@prisma/client';
import prisma from '../lib/prisma';
import {
  TIPOS_COBRANCA_SERVICO,
  TIPOS_PRESTADOR,
} from '../constants/dominio';

type UsuarioAutenticado = {
  id: string;
  tipo: string;
};

type ServicoPayload = {
  nome?: string;
  descricao?: string;
  valor?: number | string;
  tipo_cobranca?: string;
};

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

function validarPrestador(usuario: UsuarioAutenticado) {
  if (!usuario?.id) {
    throw erroNegocio('Usuário não identificado na sessão.', 401);
  }

  if (!TIPOS_PRESTADOR.includes(usuario.tipo as any)) {
    throw erroNegocio(
      'Apenas prestadores podem gerenciar serviços.',
      403,
    );
  }
}

function montarDadosServico(
  dados: ServicoPayload,
  parcial = false,
) {
  const data: {
    nome?: string;
    descricao?: string;
    valor?: number;
    tipo_cobranca?: servicos_tipo_cobranca;
  } = {};

  if (!parcial || dados.nome !== undefined) {
    const nome = String(dados.nome || '').trim();
    if (nome.length < 3 || nome.length > 100) {
      throw erroNegocio(
        'Nome do serviço deve ter entre 3 e 100 caracteres.',
      );
    }
    data.nome = nome;
  }

  if (!parcial || dados.descricao !== undefined) {
    const descricao = String(dados.descricao || '').trim();
    if (descricao.length < 10 || descricao.length > 1000) {
      throw erroNegocio(
        'Descrição do serviço deve ter entre 10 e 1000 caracteres.',
      );
    }
    data.descricao = descricao;
  }

  if (!parcial || dados.valor !== undefined) {
    const valor = Number(dados.valor);
    if (!Number.isFinite(valor) || valor < 10 || valor > 10000) {
      throw erroNegocio(
        'Valor do serviço deve estar entre R$ 10 e R$ 10.000.',
      );
    }
    data.valor = valor;
  }

  if (!parcial || dados.tipo_cobranca !== undefined) {
    const tipoCobranca = String(dados.tipo_cobranca || '');
    if (!TIPOS_COBRANCA_SERVICO.includes(tipoCobranca as any)) {
      throw erroNegocio('Tipo de cobrança inválido.');
    }
    data.tipo_cobranca = tipoCobranca as servicos_tipo_cobranca;
  }

  return data;
}

class ServiceServico {
  static async listarMeus(usuario: UsuarioAutenticado) {
    validarPrestador(usuario);

    return prisma.servicos.findMany({
      where: { prestador_id: usuario.id },
      orderBy: { id: 'desc' },
    });
  }

  static async criar(
    dados: ServicoPayload,
    usuario: UsuarioAutenticado,
  ) {
    validarPrestador(usuario);
    const data = montarDadosServico(dados);

    return prisma.servicos.create({
      data: {
        prestador_id: usuario.id,
        tipo_prestador: usuario.tipo as servicos_tipo_prestador,
        nome: data.nome!,
        descricao: data.descricao!,
        valor: data.valor!,
        tipo_cobranca: data.tipo_cobranca!,
      },
    });
  }

  static async atualizar(
    servicoId: number,
    dados: ServicoPayload,
    usuario: UsuarioAutenticado,
  ) {
    validarPrestador(usuario);

    if (!Number.isInteger(servicoId) || servicoId <= 0) {
      throw erroNegocio('Serviço inválido.');
    }

    const servico = await prisma.servicos.findFirst({
      where: { id: servicoId, prestador_id: usuario.id },
      select: { id: true },
    });

    if (!servico) {
      throw erroNegocio('Serviço não encontrado.', 404);
    }

    const data = montarDadosServico(dados, true);

    if (Object.keys(data).length === 0) {
      throw erroNegocio('Nenhum campo permitido enviado.');
    }

    return prisma.servicos.update({
      where: { id: servicoId },
      data,
    });
  }

  static async remover(
    servicoId: number,
    usuario: UsuarioAutenticado,
  ) {
    validarPrestador(usuario);

    if (!Number.isInteger(servicoId) || servicoId <= 0) {
      throw erroNegocio('Serviço inválido.');
    }

    const servico = await prisma.servicos.findFirst({
      where: { id: servicoId, prestador_id: usuario.id },
      select: { id: true },
    });

    if (!servico) {
      throw erroNegocio('Serviço não encontrado.', 404);
    }

    await prisma.servicos.delete({ where: { id: servicoId } });
    return { id: servicoId, removido: true };
  }
}

export default ServiceServico;
