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

type CancelarContratacaoInput = {
  motivo?: string | null;
};

type ContratacaoComUsuarios =
  Prisma.contratacoesGetPayload<{
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
  const error = new Error(mensagem) as Error & {
    status?: number;
  };
  error.status = status;
  return error;
}

function dataSomenteData(valor?: string) {
  if (!valor) {
    throw erroNegocio(
      'Informe a data desejada para o agendamento.',
    );
  }

  const data = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(data.getTime())) {
    throw erroNegocio('Data de agendamento invalida.');
  }

  return data;
}

function horaSomenteHora(
  valor?: string,
  campo = 'horario',
) {
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

function horaFimPadrao(
  horaInicio?: string,
  horaFim?: string,
) {
  if (horaFim)
    return horaSomenteHora(horaFim, 'o horario final');

  const inicio = horaSomenteHora(
    horaInicio,
    'o horario inicial',
  );
  const fim = new Date(inicio);
  fim.setUTCHours(fim.getUTCHours() + 1);
  return fim;
}

function formatarMoeda(
  valor: Prisma.Decimal | number | string,
) {
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

function dataHoraInicioServico(
  contratacao: Pick<ContratacaoComUsuarios, 'data' | 'hora_inicio'>,
) {
  const data = new Date(contratacao.data);
  const hora = new Date(contratacao.hora_inicio);
  const inicio = new Date(data);
  inicio.setUTCHours(
    hora.getUTCHours(),
    hora.getUTCMinutes(),
    hora.getUTCSeconds(),
    0,
  );
  return inicio;
}

export function calcularCancelamentoMvp(
  contratacao: Pick<ContratacaoComUsuarios, 'status' | 'data' | 'hora_inicio'>,
  agora = new Date(),
) {
  const inicioServico = dataHoraInicioServico(contratacao as ContratacaoComUsuarios);
  const horasAteServico =
    (inicioServico.getTime() - agora.getTime()) / (1000 * 60 * 60);

  if (horasAteServico <= 0) {
    return {
      pode_cancelar: false,
      aplica_multa: false,
      valor_multa: 0,
      houve_cobranca_plataforma: false,
      cancelamento_tardio: false,
      horas_ate_servico: Math.round(horasAteServico * 100) / 100,
      motivo:
        "Este atendimento ja passou do horario de inicio. Use a opcao 'marcar como nao realizado' ou finalize o servico.",
    };
  }

  return {
    pode_cancelar: true,
    aplica_multa: false,
    valor_multa: 0,
    houve_cobranca_plataforma: false,
    cancelamento_tardio: horasAteServico <= 36,
    horas_ate_servico: Math.round(horasAteServico * 100) / 100,
    motivo: null,
  };
}

function respostaCancelamento(
  contratacao: any,
  politica: ReturnType<typeof calcularCancelamentoMvp>,
  canceladoPor: 'cliente' | 'prestador' | 'admin',
) {
  const mensagemBase =
    'Servico cancelado com sucesso. O NossoZelo nao processa pagamentos deste atendimento. Caso algum valor tenha sido combinado diretamente entre cliente e prestador, a resolucao deve ser feita entre as partes.';
  const mensagemTardia =
    ' Voce esta cancelando proximo ao horario do atendimento. Nenhuma multa sera cobrada pelo NossoZelo nesta versao, mas o cancelamento ficara registrado no historico.';

  return {
    contratacao: {
      id: contratacao.id,
      status: contratacao.status,
      data: contratacao.data,
      hora_inicio: contratacao.hora_inicio,
      hora_fim: contratacao.hora_fim,
      cancelado_por: canceladoPor,
      cancelado_em: contratacao.cancelado_em,
      motivo_cancelamento: contratacao.motivo_cancelamento,
      cancelamento_tardio: Boolean(contratacao.cancelamento_tardio),
    },
    cancelamento: {
      permitido: politica.pode_cancelar,
      houve_cobranca_plataforma: false,
      aplica_multa: false,
      valor_multa: 0,
      horas_ate_servico: politica.horas_ate_servico,
      mensagem_usuario: politica.cancelamento_tardio
        ? `${mensagemBase}${mensagemTardia}`
        : mensagemBase,
    },
  };
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
    return false;
  }
}

async function notificarCriacao(
  contratacao: ContratacaoComUsuarios,
) {
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

  return {
    cliente: emailCliente,
    prestador: emailPrestador,
  };
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
          : status === STATUS_CONTRATACAO.nao_realizado
            ? 'nao realizada'
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

  return {
    cliente: emailCliente,
    prestador: emailPrestador,
  };
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
  private static async validarPrestadorOperacional(
    prestadorId: string,
  ) {
    const podeReceberPedidos =
      await ServiceAssinatura.prestadorPodeReceberPedidos(
        prestadorId,
      );

    if (!podeReceberPedidos) {
      throw erroNegocio(
        'Seu perfil profissional esta inativo. Regularize a assinatura para usar esta funcionalidade.',
        403,
      );
    }
  }

  static async criarAgendamento(
    data: CriarAgendamentoInput,
    usuario: UsuarioAutenticado,
  ) {
    if (!usuario?.id) {
      throw erroNegocio(
        'Cliente nao identificado na sessao.',
        401,
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
      throw erroNegocio(
        'Usuario informado nao e um prestador.',
        400,
      );
    }

    if (!prestador.email_confirmado) {
      throw erroNegocio(
        'Este prestador ainda nao confirmou o e-mail.',
        403,
      );
    }

    const podeReceberPedidos =
      await ServiceAssinatura.prestadorPodeReceberPedidos(
        prestador.id,
      );

    if (!podeReceberPedidos) {
      throw erroNegocio(
        'Este prestador nao esta disponivel para receber pedidos no momento.',
        403,
      );
    }

    const servicoId = Number(data.servico_id);
    if (!servicoId || Number.isNaN(servicoId)) {
      throw erroNegocio(
        'Selecione um servico para solicitar o agendamento.',
      );
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
    const horaFim = horaFimPadrao(
      data.hora_inicio,
      data.hora_fim,
    );

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
        observacoes:
          data.observacoes || data.observacao || null,
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

    const email_status =
      await notificarCriacao(contratacao);

    return {
      ...contratacao,
      email_status,
    };
  }

  static async aceitarContratacao(
    contratacaoId: number,
    usuario: UsuarioAutenticado,
  ) {
    if (!usuario?.id) {
      throw erroNegocio('Prestador nao identificado na sessao.', 401);
    }

    const contratacaoAtual = await prisma.contratacoes.findUnique({
      where: { id: contratacaoId },
      select: {
        id: true,
        prestador_id: true,
        cliente_id: true,
        status: true,
        preco: true,
      },
    });

    if (!contratacaoAtual) {
      throw erroNegocio('Contratacao nao encontrada.', 404);
    }

    if (contratacaoAtual.prestador_id !== usuario.id) {
      throw erroNegocio(
        'Apenas o profissional deste pedido pode aceitar.',
        403,
      );
    }

    await this.validarPrestadorOperacional(usuario.id);

    if (contratacaoAtual.status !== STATUS_CONTRATACAO.pendente) {
      throw erroNegocio(
        'Somente pedidos pendentes podem ser aceitos.',
        409,
      );
    }

    const contratacao = await prisma.contratacoes.update({
      where: { id: contratacaoId },
      data: { status: STATUS_CONTRATACAO.confirmado },
    });

    const completa = await buscarContratacaoCompleta(contratacao.id);
    if (!completa) throw erroNegocio('Contratacao nao encontrada.', 404);

    const email_status = await notificarMudancaStatus(
      completa,
      STATUS_CONTRATACAO.confirmado,
    );

    return {
      ...completa,
      email_status,
      mensagem_usuario:
        'Pedido aceito. O atendimento esta confirmado. O pagamento do servico, se houver, deve ser combinado diretamente entre cliente e prestador.',
    };
  }

  static async cancelarContratacao(
    contratacaoId: number,
    usuario: UsuarioAutenticado,
    input: CancelarContratacaoInput = {},
  ) {
    if (!usuario?.id) {
      throw erroNegocio('Usuario nao identificado na sessao.', 401);
    }

    const contratacaoAtual = await buscarContratacaoCompleta(contratacaoId);

    if (!contratacaoAtual) {
      throw erroNegocio('Contratacao nao encontrada.', 404);
    }

    const ehPrestador = contratacaoAtual.prestador_id === usuario.id;
    const ehCliente = contratacaoAtual.cliente_id === usuario.id;
    const ehAdmin = usuario.tipo === 'admin';

    if (!ehPrestador && !ehCliente && !ehAdmin) {
      throw erroNegocio(
        'Apenas envolvidos neste pedido podem cancelar.',
        403,
      );
    }

    const canceladoPor = ehAdmin
      ? 'admin'
      : ehPrestador
        ? 'prestador'
        : 'cliente';

    if (contratacaoAtual.status === STATUS_CONTRATACAO.cancelado) {
      throw erroNegocio('Este pedido ja foi cancelado.', 409);
    }

    if (contratacaoAtual.status === STATUS_CONTRATACAO.concluido) {
      throw erroNegocio('Este servico ja foi concluido e nao pode ser cancelado.', 409);
    }

    if (contratacaoAtual.status === STATUS_CONTRATACAO.nao_realizado) {
      throw erroNegocio('Este atendimento ja foi marcado como nao realizado.', 409);
    }

    const politica = calcularCancelamentoMvp(contratacaoAtual);

    if (!politica.pode_cancelar) {
      throw erroNegocio(politica.motivo || 'Cancelamento nao permitido.', 409);
    }

    const contratacaoCancelada = await prisma.contratacoes.update({
      where: { id: contratacaoId },
      data: {
        status: STATUS_CONTRATACAO.cancelado,
        cancelado_por: canceladoPor,
        motivo_cancelamento: input.motivo || null,
        cancelado_em: new Date(),
        cancelamento_tardio: politica.cancelamento_tardio,
      },
    });

    return respostaCancelamento(
      contratacaoCancelada,
      politica,
      canceladoPor,
    );
  }

  static async marcarNaoRealizado(
    contratacaoId: number,
    usuario: UsuarioAutenticado,
    input: CancelarContratacaoInput = {},
  ) {
    if (!usuario?.id) {
      throw erroNegocio('Usuario nao identificado na sessao.', 401);
    }

    const contratacao = await prisma.contratacoes.findUnique({
      where: { id: contratacaoId },
    });

    if (!contratacao) {
      throw erroNegocio('Contratacao nao encontrada.', 404);
    }

    const ehPrestador = contratacao.prestador_id === usuario.id;
    const ehCliente = contratacao.cliente_id === usuario.id;
    const ehAdmin = usuario.tipo === 'admin';

    if (!ehPrestador && !ehCliente && !ehAdmin) {
      throw erroNegocio(
        'Apenas envolvidos neste pedido podem marcar como nao realizado.',
        403,
      );
    }

    if (contratacao.status !== STATUS_CONTRATACAO.confirmado) {
      throw erroNegocio('Somente atendimentos confirmados podem ser marcados como nao realizados.', 409);
    }

    const inicioServico = dataHoraInicioServico(contratacao as ContratacaoComUsuarios);
    if (new Date().getTime() < inicioServico.getTime()) {
      throw erroNegocio('Esta opcao fica disponivel apenas depois do horario de inicio do atendimento.', 409);
    }

    const motivosPermitidos = new Set([
      'prestador_nao_compareceu',
      'cliente_nao_compareceu',
      'cancelado_por_acordo',
      'problema_de_comunicacao',
      'outro',
    ]);
    const motivo = String(input.motivo || '').trim();
    const motivoFinal = motivosPermitidos.has(motivo) ? motivo : 'outro';

    const atualizada = await prisma.contratacoes.update({
      where: { id: contratacaoId },
      data: {
        status: STATUS_CONTRATACAO.nao_realizado,
        nao_realizado_motivo: motivoFinal,
        nao_realizado_em: new Date(),
      },
    });

    const completa = await buscarContratacaoCompleta(contratacaoId);
    await notificarMudancaStatus(
      completa || (atualizada as ContratacaoComUsuarios),
      STATUS_CONTRATACAO.nao_realizado,
    );

    return {
      contratacao: completa || atualizada,
      mensagem_usuario:
        'Atendimento marcado como nao realizado. Ele ficara no historico e nao podera ser avaliado.',
    };
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
      throw erroNegocio(
        'Usuario nao identificado na sessao.',
        401,
      );
    }

    if (
      !Number.isInteger(contratacaoId) ||
      contratacaoId <= 0
    ) {
      throw erroNegocio('Contratacao invalida.');
    }

    const contratacaoAtual =
      await prisma.contratacoes.findUnique({
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

      await this.validarPrestadorOperacional(usuario.id);

      if (
        contratacaoAtual.status !==
        STATUS_CONTRATACAO.pendente
      ) {
        throw erroNegocio(
          'Somente contratacoes pendentes podem ser aceitas ou negadas.',
          409,
        );
      }
    }

    if (status === STATUS_CONTRATACAO.concluido) {
      if (
        !ehPrestadorDaContratacao &&
        !ehClienteDaContratacao
      ) {
        throw erroNegocio(
          'Apenas envolvidos na contratacao podem finaliza-la.',
          403,
        );
      }

      if (
        contratacaoAtual.status !==
        STATUS_CONTRATACAO.confirmado
      ) {
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

    const contratacao =
      await buscarContratacaoCompleta(contratacaoId);
    if (!contratacao) {
      throw erroNegocio(
        'Contratacao nao encontrada apos atualizacao.',
        404,
      );
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

  static async registroManual(
    data: any,
    usuario: UsuarioAutenticado,
  ) {
    if (
      !usuario?.id ||
      !TIPOS_PRESTADOR.includes(usuario.tipo as any)
    ) {
      throw erroNegocio(
        'Apenas prestadores podem registrar atendimento manual.',
        403,
      );
    }

    await this.validarPrestadorOperacional(usuario.id);

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
        hora_fim: horaFimPadrao(
          data.hora_inicio,
          data.hora_fim,
        ),
        preco: data.preco,
        status: STATUS_CONTRATACAO.manual,
        observacoes:
          data.observacoes || data.observacao || null,
      },
    });
  }

  static async listar_agendamentos_por_tempo(
    tempoEmDias: number,
    prestadorId: string,
    usuario: UsuarioAutenticado,
  ) {
    if (
      usuario.id !== prestadorId &&
      usuario.tipo !== 'admin'
    ) {
      throw erroNegocio(
        'Voce nao tem permissao para listar esta agenda.',
        403,
      );
    }

    const dataInicial = new Date();
    dataInicial.setHours(0, 0, 0, 0);
    const dataFinal = new Date(dataInicial);
    dataFinal.setDate(dataFinal.getDate() + Math.max(tempoEmDias, 1));

    return prisma.contratacoes.findMany({
      where: {
        prestador_id: prestadorId,
        data: {
          gte: dataInicial,
          lte: dataFinal,
        },
        status: {
          in: [
            STATUS_CONTRATACAO.pendente,
            STATUS_CONTRATACAO.confirmado,
            STATUS_CONTRATACAO.manual,
          ],
        },
      },
      orderBy: [{ data: 'asc' }, { hora_inicio: 'asc' }],
      include: {
        avaliacoes: true,
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
    if (
      usuario.id !== clienteId &&
      usuario.tipo !== 'admin'
    ) {
      throw erroNegocio(
        'Voce nao tem permissao para listar estes agendamentos.',
        403,
      );
    }

    return prisma.contratacoes.findMany({
      where: { cliente_id: clienteId },
      orderBy: [{ data: 'desc' }, { hora_inicio: 'desc' }],
      include: {
        avaliacoes: true,
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
