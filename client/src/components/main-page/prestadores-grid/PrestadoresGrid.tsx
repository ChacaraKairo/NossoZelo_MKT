import React, { useCallback, useEffect, useState } from 'react';
import UserCard from '@/components/main-page/prestadores-grid/card/UserCard';
import ErroComRetry from '@/components/common/ErroComRetry';
import EstadoVazio from '@/components/common/EstadoVazio';
import SkeletonPrestadorCard from './SkeletonPrestadorCard';
import ResultadosHeader from './ResultadosHeader';
import { useBuscaStore } from '@/store/useBuscaStore';
import { getUsuarioDoCookie } from '@/utils/auth';
import logger from '@/utils/logger';
import {
  buscarPrestadores,
  PrestadorCardData,
} from '@/service/acharPrestadoresService';
import styles from './PrestadoresGrid.module.css';

const CONTEXTO = 'PrestadoresGrid';
const DEBOUNCE_BUSCA_MS = 800;
const SKELETON_COUNT = 6;

const PrestadoresGrid = () => {
  const [providers, setProviders] = useState<PrestadorCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const {
    searchLocation,
    searchService,
    categoria,
    distancia,
    precoMax,
    limparBuscaCompleta,
    setDistancia,
  } = useBuscaStore();

  const carregarPrestadores = useCallback(async () => {
    setLoading(true);
    setError(null);

    const usuarioLogado = getUsuarioDoCookie();
    const filtros = {
      idUsuario: usuarioLogado?.id || undefined,
      nome: searchService,
      localizacao: searchLocation,
      categoria,
      distancia,
      precoMax,
    };

    logger.info(CONTEXTO, 'Iniciando busca', filtros);

    try {
      const dados = await buscarPrestadores(filtros);
      logger.info(CONTEXTO, 'Quantidade de prestadores recebidos', {
        total: dados.length,
      });
      setProviders(dados);
    } catch (err: unknown) {
      const mensagem =
        err instanceof Error
          ? err.message
          : 'Erro inesperado ao buscar dados.';
      logger.error(CONTEXTO, 'Falha ao buscar prestadores', {
        mensagem,
        filtros,
      });
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  }, [categoria, distancia, precoMax, searchLocation, searchService]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      carregarPrestadores();
    }, DEBOUNCE_BUSCA_MS);

    return () => clearTimeout(timeoutId);
  }, [carregarPrestadores, retryNonce]);

  if (loading) {
    return (
      <section className={styles.wrapper} aria-busy="true">
        <ResultadosHeader
          total={providers.length}
          categoria={categoria}
          localizacao={searchLocation}
          distancia={distancia}
          precoMax={precoMax}
        />
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <SkeletonPrestadorCard key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.wrapper}>
        <ErroComRetry
          titulo="Não foi possível buscar prestadores"
          mensagem="Tente novamente para carregar os profissionais disponíveis."
          detalhes={error}
          onRetry={() => setRetryNonce((valor) => valor + 1)}
        />
      </section>
    );
  }

  if (providers.length === 0) {
    return (
      <section className={styles.wrapper}>
        <ResultadosHeader
          total={0}
          categoria={categoria}
          localizacao={searchLocation}
          distancia={distancia}
          precoMax={precoMax}
        />
        <EstadoVazio
          titulo="Nenhum prestador encontrado"
          descricao="Tente ajustar os filtros ou ampliar a distância de busca."
          acaoTexto="Limpar filtros"
          onAcao={limparBuscaCompleta}
        />
        <button
          type="button"
          className="w-fit rounded-lg border border-teal-100 px-4 py-2 text-sm font-bold text-teal-700"
          onClick={() => setDistancia(Math.min(100, distancia + 25))}
        >
          Aumentar distância
        </button>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <ResultadosHeader
        total={providers.length}
        categoria={categoria}
        localizacao={searchLocation}
        distancia={distancia}
        precoMax={precoMax}
      />
      <div className={styles.grid}>
        {providers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </section>
  );
};

export default PrestadoresGrid;
