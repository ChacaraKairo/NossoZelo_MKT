import {
  contratacoes_status,
  contratacoes_tipo_prestador,
  Prisma,
  usuarios_tipo,
} from '@prisma/client';
import prisma from '../lib/prisma';
import EmailService from './Service_Email';
import {
  STATUS_CONTRATACAO,
  TIPOS_PRESTADOR,
} from '../constants/dominio';
import ServiceAssinatura from './Service_Assinatura';

type UsuarioAutenticado = {
  id: string;
  tipo: string;
};

type CriarAgendamentoInput = {
  cliente_id?: string;
  prestador_id?: string;
  tipo_prestador?: string;
  servico_id?: number | string;
  data?: string;
  hora_inicio?: string;
  hora_fim?: string;
  preco?: number | string;
  observacoes?: string;
  observacao?: string;
};

type ContratacaoComUsuarios = Prisma.contratacoesGetPayload<{
  include: {
    usuarios_contratacoes_cliente_idTousuarios: {
      select: {
        id: true;
        nome: true;
        email: true;
      };
    };
    usuarios_contratacoes_prestador_idTousuarios: {
      select: {
        id: true;
        nome: true;
        email: true;
      };
    };
  };
}>;

function erroNegocio(mensagem: string, status = 400) {
  const error = new Error(mensagem) as Error & { status?: number };
  error.status = status;
  return error;
}

function dataSomenteData(valor?: string) {
  if (!valor) {
    throw erroNegocio('Informe a data desejada para o agendamento.');
  }

  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) {
    throw erroNegocio('Data de agendamento invalida.');
  }

  return data;
}

function horaSomenteHora(valor?: string, campo = 'horario') {
  if (!valor) {
    throw erroNegocio(`Informe ${campo} do agendamento.`);
  }

  const [hora, minuto = '00'] = valor.split(':');
  const horas = Number(hora);
  const minutos = Number(minuto);

  if (
    Number.isNaN(horas) ||
    Number.isNaN(minutos) ||
    horas < 0 ||
    horas > 23 ||
    minutos < 0 ||
    minutos > 59
  ) {
    throw erroNegocio(`${campo} invalido.`);
  }

  return new Date(
    Date.UTC(1970, 0, 1, horas, minutos, 0, 0),
  );
}

function horaFimPadrao(horaInicio?: string, horaFim?: string) {
  if (horaFim) return horaSomenteHora(horaFim, 'o horario final');

  const inicio = horaSomenteHora(horaInicio, 'o horario inicial');
  const fim = new Date(inicio);
  fim.setUTCHours(fim.getUTCHours() + 1);
  return fim;
}

function formatarMoeda(valor: Prisma.Decimal | number | string) {
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(valor: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(valor);
}

function formatarHora(valor: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(valor);
}

function htmlBase(titulo: string, corpo: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h1 style="color: #0f766e; font-size: 22px;">${titulo}</h1>
      ${corpo}
      <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
        Este e-mail foi enviado automaticamente pela plataforma NossoZelo.
      </p>
    </div>
  `;
}

async function enviarEmailSeguro(
  to: string | null | undefined,
  subject: string,
  html: string,
) {
  if (!to) return false;

  try {
    // TODO tecnico: migrar notificacoes de e-mail para fila transacional no backend,
    // mantendo credenciais e tokens sempre fora do frontend.
    const emailService = new EmailService();
    await emailService.send(to, subject, html);
    return true;
  } catch (error) {
    console.error('[AGENDAMENTO_EMAIL] Falha ao enviar e-mail', {
      to,
      subject,
      error,
    });
    return false;
  }
}

async function notificarCriacao(contratacao: ContratacaoComUsuarios) {
  const cliente =
    contratacao.usuarios_contratacoes_cliente_idTousuarios;
  const prestador =
    contratacao.usuarios_contratacoes_prestador_idTousuarios;

  const detalhes = `
    <p><strong>Cliente:</strong> ${cliente.nome}</p>
    <p><strong>Prestador:</strong> ${prestador.nome}</p>
    <p><strong>Data:</strong> ${formatarData(contratacao.data)}</p>
    <p><strong>Horario:</strong> ${formatarHora(contratacao.hora_inicio)} ate ${formatarHora(contratacao.hora_fim)}</p>
    <p><strong>Valor:</strong> ${formatarMoeda(contratacao.preco)}</p>
    <p><strong>Status:</strong> pendente</p>
  `;

  const [emailCliente, emailPrestador] = await Promise.all([
    enviarEmailSeguro(
      cliente.email,
      'Solicitacao de agendamento enviada',
      htmlBase(
        'Solicitacao enviada com sucesso',
        `${detalhes}<p>Agora aguarde o prestador aceitar ou negar o pedido.</p>`,
      ),
    ),
    enviarEmailSeguro(
      prestador.email,
      'Nova solicitacao de agendamento recebida',
      htmlBase(
        'Voce recebeu uma nova solicitacao',
        `${detalhes}<p>Acesse sua area de solicitacoes para aceitar ou negar o pedido.</p>`,
      ),
    ),
  ]);

  return { cliente: emailCliente, prestador: emailPrestador };
}

async function notificarMudancaStatus(
  contratacao: ContratacaoComUsuarios,
  status: contratacoes_status,
) {
  const cliente =
    contratacao.usuarios_contratacoes_cliente_idTousuarios;
  const prestador =
    contratacao.usuarios_contratacoes_prestador_idTousuarios;

  const statusTexto =
    status === STATUS_CONTRATACAO.confirmado
      ? 'aceita'
      : status === STATUS_CONTRATACAO.cancelado
        ? 'negada'
        : status === STATUS_CONTRATACAO.concluido
          ? 'concluida'
          : String(status);

  const detalhes = `
    <p><strong>Cliente:</strong> ${cliente.nome}</p>
    <p><strong>Prestador:</strong> ${prestador.nome}</p>
    <p><strong>Data:</strong> ${formatarData(contratacao.data)}</p>
    <p><strong>Horario:</strong> ${formatarHora(contratacao.hora_inicio)} ate ${formatarHora(contratacao.hora_fim)}</p>
    <p><strong>Status atualizado:</strong> ${statusTexto}</p>
  `;

  const [emailCliente, emailPrestador] = await Promise.all([
    enviarEmailSeguro(
      cliente.email,
      `Solicitacao ${statusTexto}`,
      htmlBase(
        `Sua solicitacao foi ${statusTexto}`,
        `${detalhes}<p>Consulte a plataforma para acompanhar os detalhes.</p>`,
      ),
    ),
    enviarEmailSeguro(
      prestador.email,
      `Agendamento ${statusTexto}`,
      htmlBase(
        `Agendamento ${statusTexto}`,
        `${detalhes}<p>A atualizacao ja esta registrada na plataforma.</p>`,
      ),
    ),
  ]);

  return { cliente: emailCliente, prestador: emailPrestador };
}

async function buscarContratacaoCompleta(id: number) {
  return prisma.contratacoes.findUnique({
    where: { id },
    include: {
      usuarios_contratacoes_cliente_idTousuarios: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      usuarios_contratacoes_prestador_idTousuarios: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });
}

class ServiceAgendamento {
  static async criarAgendamento(
    data: CriarAgendamentoInput,
    usuario: UsuarioAutenticado,
  ) {
    if (!usuario?.id) {
      throw erroNegocio('Cliente nao identificado na sessao.', 401);
    }

    if (usuario.tipo !== 'cliente') {
      throw erroNegocio(
        'Apenas clientes podem solicitar agendamentos.',
        403,
      );
    }

    const cliente = await prisma.usuarios.findUnique({
      where: { id: usuario.id },
      select: { id: true, email_confirmado: true },
    });

    if (!cliente?.email_confirmado) {
      throw erroNegocio(
        'Confirme seu e-mail para solicitar serviços.',
        403,
      );
    }

    if (!data.prestador_id) {
      throw erroNegocio('Informe o prestador desejado.');
    }

    if (data.prestador_id === usuario.id) {
      throw erroNegocio(
        'Nao e possivel solicitar agendamento para si mesmo.',
      );
    }

    const prestador = await prisma.usuarios.findUnique({
      where: { id: data.prestador_id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        email_confirmado: true,
      },
    });

    if (!prestador) {
      throw erroNegocio('Prestador nao encontrado.', 404);
    }

    if (!TIPOS_PRESTADOR.includes(prestador.tipo as any)) {
      throw erroNegocio('Usuario informado nao e um prestador.', 400);
    }

    if (!prestador.email_confirmado) {
      throw erroNegocio(
        'Este prestador ainda nao confirmou o e-mail.',
        403,
      );
    }

    const podeReceberPedidos =
      await ServiceAssinatura.prestadorPodeReceberPedidos(prestador.id);

    if (!podeReceberPedidos) {
      throw erroNegocio(
        'Este prestador nao esta disponivel para receber pedidos no momento.',
        403,
      );
    }

    const servicoId = Number(data.servico_id);
    if (!servicoId || Number.isNaN(servicoId)) {
      throw erroNegocio('Selecione um servico para solicitar o agendamento.');
    }

    const servico = await prisma.servicos.findFirst({
      where: {
        id: servicoId,
        prestador_id: prestador.id,
      },
    });

    if (!servico) {
      throw erroNegocio(
        'Servico nao encontrado para este prestador.',
        404,
      );
    }

    const dataAgendamento = dataSomenteData(data.data);
    const horaInicio = horaSomenteHora(
      data.hora_inicio,
      'o horario inicial',
    );
    const horaFim = horaFimPadrao(data.hora_inicio, data.hora_fim);

    if (horaFim <= horaInicio) {
      throw erroNegocio(
        'O horario final deve ser maior que o horario inicial.',
      );
    }

    const conflito = await prisma.contratacoes.findFirst({
      where: {
        prestador_id: prestador.id,
        data: dataAgendamento,
        status: {
          in: [
            STATUS_CONTRATACAO.pendente,
            STATUS_CONTRATACAO.confirmado,
          ],
        },
        OR: [
          {
            hora_inicio: { lt: horaFim },
            hora_fim: { gt: horaInicio },
          },
        ],
      },
      select: { id: true },
    });

    if (conflito) {
      throw erroNegocio(
        'Este horario ja possui uma solicitacao ou agendamento confirmado.',
        409,
      );
    }

    const contratacao = await prisma.contratacoes.create({
      data: {
        cliente_id: usuario.id,
        prestador_id: prestador.id,
        tipo_prestador:
          prestador.tipo as contratacoes_tipo_prestador,
        data: dataAgendamento,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        preco: servico.valor,
        status: STATUS_CONTRATACAO.pendente,
        observacoes: data.observacoes || data.observacao || null,
      },
      include: {
        usuarios_contratacoes_cliente_idTousuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        usuarios_contratacoes_prestador_idTousuarios: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    const email_status = await notificarCriacao(contratacao);

    return {
      ...contratacao,
      email_status,
    };
  }

  static async aceitarContratacao(
    contratacaoId: number,
    usuario: UsuarioAutenticado,
  ) {
    return this.atualizarStatusContratacao(
      contratacaoId,
      usuario,
      STATUS_CONTRATACAO.confirmado,
    );
  }

  static async cancelarContratacao(
    contratacaoId: number,
    usuario: UsuarioAutenticado,
  ) {
    return this.atualizarStatusContratacao(
      contratacaoId,
      usuario,
      STATUS_CONTRATACAO.cancelado,
    );
  }

  static async finalizarContratacao(
    contratacaoId: number,
    usuario: UsuarioAutenticado,
  ) {
    return this.atualizarStatusContratacao(
      contratacaoId,
      usuario,
      STATUS_CONTRATACAO.concluido,
    );
  }

  static async atualizarStatusContratacao(
    contratacaoId: number,
    usuario: UsuarioAutenticado,
    status: contratacoes_status,
  ) {
    if (!usuario?.id) {
      throw erroNegocio('Usuario nao identificado na sessao.', 401);
    }

    if (!Number.isInteger(contratacaoId) || contratacaoId <= 0) {
      throw erroNegocio('Contratacao invalida.');
    }

    const contratacaoAtual = await prisma.contratacoes.findUnique({
      where: { id: contratacaoId },
      select: {
        id: true,
        prestador_id: true,
        cliente_id: true,
        status: true,
      },
    });

    if (!contratacaoAtual) {
      throw erroNegocio('Contratacao nao encontrada.', 404);
    }

    const ehPrestadorDaContratacao =
      contratacaoAtual.prestador_id === usuario.id;
    const ehClienteDaContratacao =
      contratacaoAtual.cliente_id === usuario.id;

    if (
      status === STATUS_CONTRATACAO.confirmado ||
      status === STATUS_CONTRATACAO.cancelado
    ) {
      if (!ehPrestadorDaContratacao) {
        throw erroNegocio(
          'Apenas o prestador desta contratacao pode aceitar ou negar.',
          403,
        );
      }

      if (contratacaoAtual.status !== STATUS_CONTRATACAO.pendente) {
        throw erroNegocio(
          'Somente contratacoes pendentes podem ser aceitas ou negadas.',
          409,
        );
      }
    }

    if (status === STATUS_CONTRATACAO.concluido) {
      if (!ehPrestadorDaContratacao && !ehClienteDaContratacao) {
        throw erroNegocio(
          'Apenas envolvidos na contratacao podem finaliza-la.',
          403,
        );
      }

      if (contratacaoAtual.status !== STATUS_CONTRATACAO.confirmado) {
        throw erroNegocio(
          'Somente contratacoes confirmadas podem ser concluidas.',
          409,
        );
      }
    }

    await prisma.contratacoes.update({
      where: { id: contratacaoId },
      data: { status },
    });

    const contratacao = await buscarContratacaoCompleta(contratacaoId);
    if (!contratacao) {
      throw erroNegocio('Contratacao nao encontrada apos atualizacao.', 404);
    }

    const email_status = await notificarMudancaStatus(
      contratacao,
      status,
    );

    return {
      ...contratacao,
      email_status,
    };
  }

  static async registroManual(data: any, usuario: UsuarioAutenticado) {
    if (!usuario?.id || !TIPOS_PRESTADOR.includes(usuario.tipo as any)) {
      throw erroNegocio(
        'Apenas prestadores podem registrar atendimento manual.',
        403,
      );
    }

    return prisma.contratacoes.create({
      data: {
        cliente_id: data.cliente_id,
        prestador_id: usuario.id,
        tipo_prestador:
          usuario.tipo as contratacoes_tipo_prestador,
        data: dataSomenteData(data.data),
        hora_inicio: horaSomenteHora(
          data.hora_inicio,
          'o horario inicial',
        ),
        hora_fim: horaFimPadrao(data.hora_inicio, data.hora_fim),
        preco: data.preco,
        status: STATUS_CONTRATACAO.manual,
        observacoes: data.observacoes || data.observacao || null,
      },
    });
  }

  static async listar_agendamentos_por_tempo(
    tempoEmDias: number,
    prestadorId: string,
    usuario: UsuarioAutenticado,
  ) {
    if (usuario.id !== prestadorId && usuario.tipo !== 'admin') {
      throw erroNegocio(
        'Voce nao tem permissao para listar esta agenda.',
        403,
      );
    }

    const hoje = new Date();
    const dataInicial = new Date();
    dataInicial.setDate(hoje.getDate() - tempoEmDias);

    return prisma.contratacoes.findMany({
      where: {
        prestador_id: prestadorId,
        data: { gte: dataInicial },
      },
      orderBy: [{ data: 'desc' }, { hora_inicio: 'desc' }],
      include: {
        usuarios_contratacoes_cliente_idTousuarios: {
          select: {
            id: true,
            nome: true,
            url_foto_perfil: true,
          },
        },
      },
    });
  }

  static async agendamentos_cliente(
    clienteId: string,
    usuario: UsuarioAutenticado,
  ) {
    if (usuario.id !== clienteId && usuario.tipo !== 'admin') {
      throw erroNegocio(
        'Voce nao tem permissao para listar estes agendamentos.',
        403,
      );
    }

    return prisma.contratacoes.findMany({
      where: { cliente_id: clienteId },
      orderBy: [{ data: 'desc' }, { hora_inicio: 'desc' }],
      include: {
        usuarios_contratacoes_prestador_idTousuarios: {
          select: {
            id: true,
            nome: true,
            url_foto_perfil: true,
            tipo: true,
          },
        },
      },
    });
  }
}

export default ServiceAgendamento;
