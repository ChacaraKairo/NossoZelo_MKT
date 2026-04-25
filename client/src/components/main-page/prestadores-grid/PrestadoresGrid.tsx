// src/components/main-page/prestadores-grid/PrestadoresGrid.tsx
import React, { useState, useEffect } from 'react';
import CardPrestador from '@/components/prestador/CardPrestador';
import Style from '@/styles/PrestadoresPage.module.css';
import { useBuscaStore } from '@/store/useBuscaStore';
import { getUsuarioDoCookie } from '@/utils/auth';
import ErroComRetry from '@/components/common/ErroComRetry';

// SERVIÇO DE BUSCA
import {
  buscarPrestadores,
  PrestadorCardData,
} from '@/service/acharPrestadoresService';

const ProvidersGrid = () => {
  const [providers, setProviders] = useState<
    PrestadorCardData[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Pega todos os estados da Store de Filtros
  const {
    searchLocation,
    searchService,
    categoria,
    distancia,
    precoMax,
  } = useBuscaStore();

  useEffect(() => {
    // 🔥 DEBOUNCE: Aguarda 800ms antes de fazer a busca na API
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const usuarioLogado = getUsuarioDoCookie();
        const idUsuario = usuarioLogado?.id || undefined;

        // Chamada limpa e elegante usando o nosso Serviço Sênior
        const dados = await buscarPrestadores({
          idUsuario,
          nome: searchService,
          localizacao: searchLocation,
          categoria,
          distancia,
          precoMax,
        });

        setProviders(dados);
      } catch (err: any) {
        setError(
          err.message || 'Erro inesperado ao buscar dados.',
        );
      } finally {
        setLoading(false);
      }
    }, 800);

    // Limpa o timeout se o usuário digitar algo novo antes dos 800ms
    return () => clearTimeout(timeoutId);
  }, [
    searchLocation,
    searchService,
    categoria,
    distancia,
    precoMax,
    retryNonce,
  ]);

  // ==========================================
  // RENDERIZAÇÕES DE STATUS
  // ==========================================
  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          marginTop: '40px',
          color: '#666',
        }}
      >
        Buscando prestadores na sua região...
      </div>
    );
  }

  if (error) {
    return (
      <ErroComRetry
        titulo="Não foi possível buscar prestadores"
        mensagem="Tente novamente para carregar os profissionais disponíveis."
        detalhes={error}
        onRetry={() => setRetryNonce((valor) => valor + 1)}
      />
    );
  }

  if (providers.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          marginTop: '40px',
          color: '#666',
        }}
      >
        Nenhum prestador encontrado com estes filtros.
      </div>
    );
  }

  // ==========================================
  // RENDERIZAÇÃO DO GRID DE CARDS
  // ==========================================
  return (
    <section
      className={Style.grid}
      style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
      }}
    >
      {providers.map((user) => (
        // Usamos user.id como key, que é a melhor prática no React
        <CardPrestador key={user.id} prestador={user} />
      ))}
    </section>
  );
};

export default ProvidersGrid;
