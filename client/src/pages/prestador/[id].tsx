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
import styles from '@/styles/VitrinePrestadorPage.module.css';

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
  const abrirContratacaoPelaUrl = router.asPath.includes(
    'acao=contratar',
  );

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

  useEffect(() => {
    if (!router.isReady) return;
    if (abrirContratacaoPelaUrl) {
      logger.info(CONTEXTO, 'Ação de contratação recebida pela URL', {
        prestadorId,
      });
      setModalContratacaoAberto(true);
    }
  }, [abrirContratacaoPelaUrl, prestadorId, router.isReady]);

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

  const fecharContratacao = () => {
    setModalContratacaoAberto(false);

    if (abrirContratacaoPelaUrl && prestadorId) {
      router.replace(`/prestador/${prestadorId}`, undefined, {
        shallow: true,
      });
    }
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
      <main className={styles.page}>
        <section className={styles.centerBox}>
          <Carregando mensagem="Carregando vitrine do prestador..." />
        </section>
      </main>
    );
  }

  if (erro) {
    return (
      <main className={styles.page}>
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
      <main className={styles.page}>
        <section className={styles.centerBox}>
          <h1 className={styles.title}>Prestador não encontrado</h1>
          <p className={styles.muted}>
            Não encontramos uma vitrine pública para este prestador.
          </p>
          <button
            type="button"
            onClick={() => router.push('/prestadores')}
            className={styles.secondaryButton}
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
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.avatarArea}>
          {prestador.url_foto_perfil ? (
            <img
              src={prestador.url_foto_perfil}
              alt={`Foto de ${prestador.nome}`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {prestador.nome?.charAt(0)?.toUpperCase() || 'P'}
            </div>
          )}
        </div>

        <div className={styles.heroContent}>
          <p className={styles.kicker}>
            {formatarTexto(prestador.tipo)}
          </p>
          <h1 className={styles.title}>{formatarTexto(prestador.nome)}</h1>
          <p className={styles.muted}>{localizacao}</p>

          <div className={styles.metrics}>
            <span className={styles.metric}>
              {rating ? `Nota ${rating}` : 'Sem avaliações'}
            </span>
            <span className={styles.metric}>
              {servicos.length} serviço
              {servicos.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleSolicitarContratacao}
            className={styles.primaryButton}
          >
            Solicitar contratação
          </button>

          {prestador.pode_ver_contato === true && (
            <button
              type="button"
              onClick={handleEntrarEmContato}
              className={styles.secondaryButton}
            >
              Entrar em contato
            </button>
          )}
        </div>
      </section>

      {mensagemAcao && (
        <p role="status" className={styles.notice}>
          {mensagemAcao}
        </p>
      )}

      {(modalContratacaoAberto || abrirContratacaoPelaUrl) && (
        <ModalContratarPrestador
          aberto
          prestadorId={prestador.id}
          tipoPrestador={prestador.tipo}
          servicos={servicos}
          onClose={fecharContratacao}
          presentation="inline"
        />
      )}

      <section className={styles.grid}>
        <article className={styles.panel}>
          <h2 className={styles.sectionTitle}>Sobre o prestador</h2>
          <p className={styles.bodyText}>{formatarTexto(prestador.bio)}</p>

          <dl className={styles.descriptionList}>
            <div>
              <dt className={styles.label}>Disponibilidade</dt>
              <dd className={styles.value}>
                {formatarTexto(prestador.disponibilidade)}
              </dd>
            </div>
            <div>
              <dt className={styles.label}>Especialidades</dt>
              <dd className={styles.value}>
                {obterEspecialidades(prestador.especialidades)}
              </dd>
            </div>
          </dl>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.sectionTitle}>Serviços</h2>
          {servicos.length > 0 ? (
            <div className={styles.list}>
              {servicos.map((servico: ServicoPerfil) => (
                <div key={servico.id} className={styles.listItem}>
                  <div>
                    <strong className={styles.itemTitle}>
                      {formatarTexto(servico.nome || servico.tipo)}
                    </strong>
                    {servico.descricao && (
                      <p className={styles.itemText}>{servico.descricao}</p>
                    )}
                  </div>
                  {formatarMoeda(servico.valor) && (
                    <span className={styles.price}>
                      {formatarMoeda(servico.valor)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>
              Este prestador ainda não cadastrou serviços públicos.
            </p>
          )}
        </article>

        <article className={styles.panel}>
          <h2 className={styles.sectionTitle}>Avaliações</h2>
          {avaliacoes.length > 0 ? (
            <div className={styles.list}>
              {avaliacoes.map((avaliacao) => (
                <div key={avaliacao.id} className={styles.listItem}>
                  <div>
                    <strong className={styles.itemTitle}>
                      Nota {avaliacao.nota ?? 'Não informada'}
                    </strong>
                    <p className={styles.itemText}>
                      {avaliacao.comentario || 'Sem comentário.'}
                    </p>
                    <span className={styles.smallText}>
                      {formatarData(avaliacao.data_avaliacao)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.muted}>
              Este prestador ainda não recebeu avaliações.
            </p>
          )}
        </article>
      </section>

    </main>
  );
};

export default PrestadorVitrinePage;
