import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Carregando from '@/components/common/Carregando';
import ErroComRetry from '@/components/common/ErroComRetry';
import ModalContratarPrestador from '@/components/prestador/ModalContratarPrestador';
import { extrairErroApi } from '@/service/api';
import { perfilService } from '@/service/perfilService';
import {
  AvaliacaoPerfil,
  PerfilPrestadorPublico,
  ServicoPerfil,
} from '@/types/perfil';
import logger from '@/utils/logger';

const CONTEXTO = 'PrestadorVitrinePage';

type VitrinePrestador = PerfilPrestadorPublico & {
  bio?: string | null;
  disponibilidade?: string | null;
  especialidades?: string[] | string | null;
  avaliacoes?: AvaliacaoPerfil[];
  avaliacoes_recebidas?: AvaliacaoPerfil[];
  avaliacoes_avaliacoes_prestador_idTousuarios?: AvaliacaoPerfil[];
};

function normalizarId(id: string | string[] | undefined) {
  if (Array.isArray(id)) return id[0];
  return id;
}

function formatarTexto(valor?: string | number | null) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }

  return String(valor);
}

function formatarMoeda(valor?: string | number | null) {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const numero = Number(valor);
  if (Number.isNaN(numero)) return String(valor);

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'Data não informada';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Data não informada';

  return data.toLocaleDateString('pt-BR');
}

function obterAvaliacoes(prestador: VitrinePrestador | null) {
  if (!prestador) return [];

  if (Array.isArray(prestador.avaliacoes)) {
    return prestador.avaliacoes;
  }

  if (Array.isArray(prestador.avaliacoes_recebidas)) {
    return prestador.avaliacoes_recebidas;
  }

  if (
    Array.isArray(
      prestador.avaliacoes_avaliacoes_prestador_idTousuarios,
    )
  ) {
    return prestador.avaliacoes_avaliacoes_prestador_idTousuarios;
  }

  return [];
}

function obterEspecialidades(
  especialidades?: string[] | string | null,
) {
  if (Array.isArray(especialidades)) {
    return especialidades.filter(Boolean).join(', ');
  }

  return formatarTexto(especialidades);
}

const PrestadorVitrinePage: React.FC = () => {
  const router = useRouter();
  const prestadorId = normalizarId(router.query.id);

  const [prestador, setPrestador] =
    useState<VitrinePrestador | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [mensagemAcao, setMensagemAcao] = useState<string | null>(
    null,
  );
  const [modalContratacaoAberto, setModalContratacaoAberto] =
    useState(false);

  const carregarVitrine = useCallback(async () => {
    if (!router.isReady || !prestadorId) return;

    setLoading(true);
    setErro(null);
    setNaoEncontrado(false);
    setMensagemAcao(null);

    logger.info(CONTEXTO, 'Início da busca da vitrine', {
      prestadorId,
    });

    try {
      const dados =
        await perfilService.obterVitrinePrestador(prestadorId);

      if (!dados) {
        logger.warn(CONTEXTO, 'Prestador não encontrado', {
          prestadorId,
        });
        setPrestador(null);
        setNaoEncontrado(true);
        return;
      }

      logger.info(CONTEXTO, 'Vitrine carregada com sucesso', {
        prestadorId,
      });
      setPrestador(dados as VitrinePrestador);
    } catch (error: unknown) {
      const { status, mensagem } = extrairErroApi(error);

      logger.error(CONTEXTO, 'Erro ao carregar vitrine', {
        prestadorId,
        status,
        mensagem,
      });

      setPrestador(null);

      if (status === 404) {
        setNaoEncontrado(true);
        return;
      }

      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }, [prestadorId, router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;

    logger.info(CONTEXTO, 'ID recebido pela URL', {
      prestadorId,
    });
    carregarVitrine();
  }, [carregarVitrine, prestadorId, router.isReady]);

  const avaliacoes = useMemo(
    () => obterAvaliacoes(prestador),
    [prestador],
  );

  const rating = useMemo(() => {
    const valor =
      prestador?.rating ?? prestador?.avaliacao_media ?? null;

    if (valor === null || valor === undefined) return null;

    const numero = Number(valor);
    return Number.isNaN(numero) ? null : numero.toFixed(1);
  }, [prestador]);

  const handleSolicitarContratacao = () => {
    logger.info(CONTEXTO, 'Clique em solicitar contratação', {
      prestadorId,
    });
    setModalContratacaoAberto(true);
  };

  const handleEntrarEmContato = () => {
    logger.info(CONTEXTO, 'Clique em entrar em contato', {
      prestadorId,
    });
    setMensagemAcao(
      'Contato liberado pelo backend. O fluxo de contato será conectado na próxima etapa.',
    );
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <section style={styles.centerBox}>
          <Carregando mensagem="Carregando vitrine do prestador..." />
        </section>
      </main>
    );
  }

  if (erro) {
    return (
      <main style={styles.page}>
        <ErroComRetry
          titulo="Não foi possível carregar a vitrine"
          mensagem="Tente novamente em alguns instantes."
          detalhes={erro}
          onRetry={carregarVitrine}
        />
      </main>
    );
  }

  if (naoEncontrado || !prestador) {
    return (
      <main style={styles.page}>
        <section style={styles.centerBox}>
          <h1 style={styles.title}>Prestador não encontrado</h1>
          <p style={styles.muted}>
            Não encontramos uma vitrine pública para este prestador.
          </p>
          <button
            type="button"
            onClick={() => router.push('/prestadores')}
            style={styles.secondaryButton}
          >
            Voltar para prestadores
          </button>
        </section>
      </main>
    );
  }

  const localizacao =
    prestador.cidade || prestador.estado
      ? `${prestador.cidade ?? ''}${
          prestador.cidade && prestador.estado ? ' / ' : ''
        }${prestador.estado ?? ''}`
      : 'Localização não informada';

  const servicos = Array.isArray(prestador.servicos)
    ? prestador.servicos
    : [];

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.avatarArea}>
          {prestador.url_foto_perfil ? (
            <img
              src={prestador.url_foto_perfil}
              alt={`Foto de ${prestador.nome}`}
              style={styles.avatarImage}
            />
          ) : (
            <div style={styles.avatarFallback}>
              {prestador.nome?.charAt(0)?.toUpperCase() || 'P'}
            </div>
          )}
        </div>

        <div style={styles.heroContent}>
          <p style={styles.kicker}>
            {formatarTexto(prestador.tipo)}
          </p>
          <h1 style={styles.title}>{formatarTexto(prestador.nome)}</h1>
          <p style={styles.muted}>{localizacao}</p>

          <div style={styles.metrics}>
            <span style={styles.metric}>
              {rating ? `Nota ${rating}` : 'Sem avaliações'}
            </span>
            <span style={styles.metric}>
              {servicos.length} serviço
              {servicos.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleSolicitarContratacao}
            style={styles.primaryButton}
          >
            Solicitar contratação
          </button>

          {prestador.pode_ver_contato === true && (
            <button
              type="button"
              onClick={handleEntrarEmContato}
              style={styles.secondaryButton}
            >
              Entrar em contato
            </button>
          )}
        </div>
      </section>

      {mensagemAcao && (
        <p role="status" style={styles.notice}>
          {mensagemAcao}
        </p>
      )}

      <section style={styles.grid}>
        <article style={styles.panel}>
          <h2 style={styles.sectionTitle}>Sobre o prestador</h2>
          <p style={styles.bodyText}>{formatarTexto(prestador.bio)}</p>

          <dl style={styles.descriptionList}>
            <div>
              <dt style={styles.label}>Disponibilidade</dt>
              <dd style={styles.value}>
                {formatarTexto(prestador.disponibilidade)}
              </dd>
            </div>
            <div>
              <dt style={styles.label}>Especialidades</dt>
              <dd style={styles.value}>
                {obterEspecialidades(prestador.especialidades)}
              </dd>
            </div>
          </dl>
        </article>

        <article style={styles.panel}>
          <h2 style={styles.sectionTitle}>Serviços</h2>
          {servicos.length > 0 ? (
            <div style={styles.list}>
              {servicos.map((servico: ServicoPerfil) => (
                <div key={servico.id} style={styles.listItem}>
                  <div>
                    <strong style={styles.itemTitle}>
                      {formatarTexto(servico.nome || servico.tipo)}
                    </strong>
                    {servico.descricao && (
                      <p style={styles.itemText}>{servico.descricao}</p>
                    )}
                  </div>
                  {formatarMoeda(servico.valor) && (
                    <span style={styles.price}>
                      {formatarMoeda(servico.valor)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>
              Este prestador ainda não cadastrou serviços públicos.
            </p>
          )}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.sectionTitle}>Avaliações</h2>
          {avaliacoes.length > 0 ? (
            <div style={styles.list}>
              {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id} style={styles.listItem}>
                  <div>
                    <strong style={styles.itemTitle}>
                      Nota {avaliacao.nota ?? 'Não informada'}
                    </strong>
                    <p style={styles.itemText}>
                      {avaliacao.comentario || 'Sem comentário.'}
                    </p>
                    <span style={styles.smallText}>
                      {formatarData(avaliacao.data_avaliacao)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.muted}>
              Este prestador ainda não recebeu avaliações.
            </p>
          )}
        </article>
      </section>

      <ModalContratarPrestador
        aberto={modalContratacaoAberto}
        prestadorId={prestador.id}
        servicos={servicos}
        onClose={() => setModalContratacaoAberto(false)}
      />
    </main>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    minHeight: '100vh',
    padding: '40px 20px',
    background: '#f8fafc',
    color: '#0f172a',
  },
  centerBox: {
    width: '100%',
    maxWidth: '640px',
    margin: '80px auto',
    padding: '32px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#ffffff',
    textAlign: 'center',
  },
  spinner: {
    width: '36px',
    height: '36px',
    margin: '0 auto 16px',
    border: '4px solid #ccfbf1',
    borderTopColor: '#0f766e',
    borderRadius: '999px',
  },
  hero: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto 18px',
    padding: '28px',
    display: 'grid',
    gridTemplateColumns: '120px 1fr auto',
    gap: '24px',
    alignItems: 'center',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#ffffff',
  },
  avatarArea: {
    width: '120px',
    height: '120px',
  },
  avatarImage: {
    width: '120px',
    height: '120px',
    borderRadius: '999px',
    objectFit: 'cover',
    border: '3px solid #ccfbf1',
  },
  avatarFallback: {
    width: '120px',
    height: '120px',
    borderRadius: '999px',
    display: 'grid',
    placeItems: 'center',
    background: '#ccfbf1',
    color: '#0f766e',
    fontSize: '42px',
    fontWeight: 800,
  },
  heroContent: {
    minWidth: 0,
  },
  kicker: {
    margin: '0 0 6px',
    color: '#0f766e',
    fontSize: '13px',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '30px',
    lineHeight: 1.15,
  },
  muted: {
    margin: 0,
    color: '#64748b',
    lineHeight: 1.6,
  },
  metrics: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '14px',
  },
  metric: {
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#ecfeff',
    color: '#155e75',
    fontSize: '13px',
    fontWeight: 700,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  primaryButton: {
    padding: '11px 16px',
    border: 0,
    borderRadius: '8px',
    background: '#0f766e',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  secondaryButton: {
    padding: '11px 16px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    background: '#ffffff',
    color: '#0f172a',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  notice: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto 18px',
    padding: '12px 16px',
    borderRadius: '8px',
    background: '#ecfeff',
    color: '#155e75',
    fontWeight: 700,
  },
  grid: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
  },
  panel: {
    padding: '22px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#ffffff',
  },
  sectionTitle: {
    margin: '0 0 14px',
    fontSize: '20px',
  },
  bodyText: {
    margin: '0 0 18px',
    color: '#334155',
    lineHeight: 1.7,
  },
  descriptionList: {
    display: 'grid',
    gap: '12px',
    margin: 0,
  },
  label: {
    marginBottom: '4px',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  value: {
    margin: 0,
    color: '#0f172a',
  },
  list: {
    display: 'grid',
    gap: '12px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    padding: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#f8fafc',
  },
  itemTitle: {
    display: 'block',
    color: '#0f172a',
  },
  itemText: {
    margin: '6px 0 0',
    color: '#475569',
    lineHeight: 1.5,
  },
  smallText: {
    display: 'block',
    marginTop: '6px',
    color: '#64748b',
    fontSize: '12px',
  },
  price: {
    color: '#0f766e',
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
};

export default PrestadorVitrinePage;
