import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaPhoneAlt,
  FaTimes,
  FaWallet,
} from 'react-icons/fa';
import DadosClienteLiberado from '@/components/perfil/DadosClienteLiberado';
import EstadoVazio from '@/components/common/EstadoVazio';
import { contratacaoService } from '@/service/contratacaoService';
import { ContratacaoPerfil, PerfilUsuario } from '@/types/perfil';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import logger from '@/utils/logger';
import styles from '@/styles/components/perfil/AbaSolicitacoesPro.module.css';

interface AbaSolicitacoesProProps {
  perfil: PerfilUsuario;
  onContratacaoAtualizada?: (
    contratacao: ContratacaoPerfil,
  ) => void;
}

const CONTEXTO = 'AbaSolicitacoesPro';

function texto(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }
  return String(valor);
}

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'Não informado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return texto(valor);
  return data.toLocaleDateString('pt-BR');
}

function formatarHora(valor?: string | Date | null) {
  if (!valor) return 'Não informado';

  const valorTexto = String(valor);
  const matchIso = valorTexto.match(/T(\d{2}:\d{2})/);
  const matchSimples = valorTexto.match(/^(\d{2}:\d{2})/);

  if (matchIso?.[1]) return matchIso[1];
  if (matchSimples?.[1]) return matchSimples[1];

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return texto(valor);

  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarMoeda(valor?: number | string | null) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }

  const numero = Number(valor);
  if (Number.isNaN(numero)) return texto(valor);

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function labelStatus(status?: string | null) {
  const normalizado = String(status || '').toLowerCase();

  if (normalizado === 'pendente') return 'Pendente';
  if (normalizado === 'confirmado' || normalizado === 'aceito') {
    return 'Aceito';
  }
  if (normalizado === 'cancelado' || normalizado === 'negado') {
    return 'Negado';
  }
  if (normalizado === 'concluido' || normalizado === 'concluida') {
    return 'Concluído';
  }

  return texto(status);
}

function statusClassName(status?: string | null) {
  const normalizado = String(status || '').toLowerCase();

  if (normalizado === 'pendente') return styles.statusPendente;
  if (normalizado === 'confirmado' || normalizado === 'aceito') {
    return styles.statusConfirmado;
  }
  if (normalizado === 'cancelado' || normalizado === 'negado') {
    return styles.statusCancelado;
  }
  if (normalizado === 'concluido' || normalizado === 'concluida') {
    return styles.statusConcluido;
  }

  return styles.statusDefault;
}

function nomeCliente(contratacao: ContratacaoPerfil) {
  return (
    contratacao.usuarios_contratacoes_cliente_idTousuarios?.nome ||
    'Cliente não informado'
  );
}

function nomeServico(contratacao: ContratacaoPerfil) {
  return (
    contratacao.servico?.nome ||
    contratacao.servicos?.nome ||
    (contratacao.tipo_prestador
      ? `Atendimento ${contratacao.tipo_prestador}`
      : null) ||
    (contratacao.servico_id
      ? `Serviço #${contratacao.servico_id}`
      : 'Serviço não informado')
  );
}

function iniciaisCliente(nome: string) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

export default function AbaSolicitacoesPro({
  perfil,
  onContratacaoAtualizada,
}: AbaSolicitacoesProProps) {
  const solicitacoesIniciais = useMemo(
    () =>
      perfil.contratacoes_contratacoes_prestador_idTousuarios ||
      perfil.contratacoes ||
      [],
    [
      perfil.contratacoes_contratacoes_prestador_idTousuarios,
      perfil.contratacoes,
    ],
  );
  const prestadorId = perfil.dados_usuario?.id || perfil.id;
  const [solicitacoes, setSolicitacoes] = useState<
    ContratacaoPerfil[]
  >(solicitacoesIniciais);
  const [processandoId, setProcessandoId] = useState<number | null>(
    null,
  );
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [clienteContatoAberto, setClienteContatoAberto] = useState<
    string | null
  >(null);

  useEffect(() => {
    setSolicitacoes(solicitacoesIniciais);
  }, [solicitacoesIniciais]);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderizacao da aba', {
      perfilId: perfil.dados_usuario?.id || perfil.id,
    });
    logger.info(CONTEXTO, 'Quantidade de solicitacoes', {
      total: solicitacoes.length,
    });
  }, [perfil, solicitacoes.length]);

  useEffect(() => {
    if (!prestadorId) return;

    contratacaoService
      .listarSolicitacoesPrestador(prestadorId)
      .then((dados) => {
        setSolicitacoes(dados);
        logger.info(CONTEXTO, 'Solicitacoes completas carregadas', {
          total: dados.length,
        });
      })
      .catch((error) => {
        logger.warn(CONTEXTO, 'Nao foi possivel carregar lista completa', {
          mensagem: extrairMensagemErro(error),
        });
      });
  }, [prestadorId]);

  const executarAcao = async (
    tipoAcao: 'aceitar' | 'negar',
    contratacao: ContratacaoPerfil,
  ) => {
    const statusEnviado =
      tipoAcao === 'aceitar' ? 'confirmado' : 'cancelado';

    logger.info(CONTEXTO, `Clique em ${tipoAcao}`, {
      contratacaoId: contratacao.id,
    });
    logger.info(CONTEXTO, 'Acao escolhida', {
      contratacaoId: contratacao.id,
      acao: tipoAcao,
      statusEnviado,
    });

    setErroAcao(null);
    setProcessandoId(contratacao.id);

    try {
      const resultado =
        await contratacaoService.atualizarStatusContratacao(
          contratacao.id,
          statusEnviado,
        );

      logger.info(CONTEXTO, `Sucesso ao ${tipoAcao}`, {
        contratacaoId: contratacao.id,
        statusEnviado,
      });
      setSolicitacoes((atuais) =>
        atuais.map((item) =>
          item.id === resultado.id ? { ...item, ...resultado } : item,
        ),
      );
      onContratacaoAtualizada?.(resultado);
    } catch (error: unknown) {
      const mensagem = extrairMensagemErro(error);
      logger.error(CONTEXTO, `Falha ao ${tipoAcao}`, {
        contratacaoId: contratacao.id,
        statusEnviado,
        mensagem,
      });
      setErroAcao(mensagem);
    } finally {
      setProcessandoId(null);
    }
  };

  if (solicitacoes.length === 0) {
    return (
      <section className={styles.container}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Pedidos Recebidos</h2>
            <p className={styles.subtitle}>
              Contratações recebidas pelos clientes.
            </p>
          </div>
        </header>
        <EstadoVazio
          titulo="Você ainda não recebeu solicitações."
          descricao="Quando um cliente solicitar seu serviço, ele aparecerá aqui."
        />
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Pedidos Recebidos</h2>
          <p className={styles.subtitle}>
            Analise os detalhes do pedido antes de aceitar ou negar.
          </p>
        </div>
        <span className={styles.counter}>
          {solicitacoes.length} pedido
          {solicitacoes.length === 1 ? '' : 's'}
        </span>
      </header>

      {erroAcao && <div className={styles.errorBox}>{erroAcao}</div>}

      <div className={styles.list}>
        {solicitacoes.map((contratacao) => {
          const pendente = contratacao.status === 'pendente';
          const contatoPodeSerConsultado = [
            'confirmado',
            'aceito',
            'concluido',
            'concluida',
          ].includes(String(contratacao.status));
          const processando = processandoId === contratacao.id;
          const cliente = nomeCliente(contratacao);
          const fotoCliente =
            contratacao.usuarios_contratacoes_cliente_idTousuarios
              ?.url_foto_perfil;

          return (
            <article key={contratacao.id} className={styles.requestCard}>
              <div className={styles.cardTop}>
                <div className={styles.clientBlock}>
                  {fotoCliente ? (
                    <img
                      src={fotoCliente}
                      alt={`Foto de ${cliente}`}
                      className={styles.avatar}
                    />
                  ) : (
                    <span
                      className={`${styles.avatar} ${styles.avatarFallback}`}
                      aria-hidden="true"
                    >
                      {iniciaisCliente(cliente) || 'CL'}
                    </span>
                  )}

                  <div>
                    <p className={styles.eyebrow}>Pedido #{contratacao.id}</p>
                    <h3 className={styles.clientName}>{cliente}</h3>
                    <p className={styles.serviceName}>
                      {nomeServico(contratacao)}
                    </p>
                  </div>
                </div>

                <span
                  className={`${styles.statusBadge} ${statusClassName(
                    contratacao.status,
                  )}`}
                >
                  {labelStatus(contratacao.status)}
                </span>
              </div>

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>
                    <FaCalendarAlt aria-hidden="true" />
                  </span>
                  <span>
                    <span className={styles.metaLabel}>Data</span>
                    <span className={styles.metaValue}>
                      {formatarData(contratacao.data)}
                    </span>
                  </span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>
                    <FaClock aria-hidden="true" />
                  </span>
                  <span>
                    <span className={styles.metaLabel}>Horário</span>
                    <span className={styles.metaValue}>
                      {formatarHora(contratacao.hora_inicio)} -{' '}
                      {formatarHora(contratacao.hora_fim)}
                    </span>
                  </span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>
                    <FaWallet aria-hidden="true" />
                  </span>
                  <span>
                    <span className={styles.metaLabel}>Valor</span>
                    <span className={styles.metaValue}>
                      {formatarMoeda(contratacao.preco)}
                    </span>
                  </span>
                </div>

                <div className={styles.metaItem}>
                  <span className={styles.metaIcon}>
                    <FaCheck aria-hidden="true" />
                  </span>
                  <span>
                    <span className={styles.metaLabel}>Status</span>
                    <span className={styles.metaValue}>
                      {labelStatus(contratacao.status)}
                    </span>
                  </span>
                </div>
              </div>

              <div className={styles.notes}>
                <span className={styles.notesLabel}>Descrição do pedido</span>
                <p className={styles.notesText}>
                  {texto(contratacao.observacoes)}
                </p>
              </div>

              <div className={styles.actions}>
                {pendente && (
                  <>
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => executarAcao('aceitar', contratacao)}
                      className={`${styles.actionButton} ${styles.acceptButton}`}
                    >
                      <FaCheck aria-hidden="true" />
                      {processando ? 'Processando...' : 'Aceitar pedido'}
                    </button>
                    <button
                      type="button"
                      disabled={processando}
                      onClick={() => executarAcao('negar', contratacao)}
                      className={`${styles.actionButton} ${styles.denyButton}`}
                    >
                      <FaTimes aria-hidden="true" />
                      Negar pedido
                    </button>
                  </>
                )}

                {contatoPodeSerConsultado && (
                  <button
                    type="button"
                    onClick={() =>
                      setClienteContatoAberto((atual) =>
                        atual === contratacao.cliente_id
                          ? null
                          : contratacao.cliente_id,
                      )
                    }
                    className={`${styles.actionButton} ${styles.contactButton}`}
                  >
                    <FaPhoneAlt aria-hidden="true" />
                    {clienteContatoAberto === contratacao.cliente_id
                      ? 'Ocultar contato'
                      : 'Ver contato'}
                  </button>
                )}
              </div>

              {clienteContatoAberto === contratacao.cliente_id && (
                <div className={styles.contactPanel}>
                  <DadosClienteLiberado
                    clienteId={contratacao.cliente_id}
                    isPrestador
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
