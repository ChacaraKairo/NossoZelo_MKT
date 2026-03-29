// src/components/ProviderGrid.tsx
import React, { useState, useEffect } from 'react';
import UserCard from '@/components/main-page/prestadores-grid/card/UserCard';
import Style from '@/styles/PrestadoresPage.module.css';
import { useBuscaStore } from '@/utils/useBuscaStore';
import { getUsuarioDoCookie } from '@/utils/auth'; // Aquele utilitário que criamos na resposta anterior!

const ProvidersGrid = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pega todos os estados da Store
  const {
    searchLocation,
    searchService,
    categoria,
    distancia,
    precoMax,
  } = useBuscaStore();

  useEffect(() => {
    // 🔥 DEBOUNCE: Aguarda 800ms antes de fazer a busca
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const usuarioLogado = getUsuarioDoCookie();
        const idUsuario = usuarioLogado?.id || '';

        const queryParams = new URLSearchParams();
        if (idUsuario)
          queryParams.append('idUsuario', idUsuario);
        if (searchService)
          queryParams.append('nome', searchService);
        if (searchLocation)
          queryParams.append('localizacao', searchLocation);
        if (categoria)
          queryParams.append(
            'tipo',
            categoria.toLowerCase(),
          );
        if (precoMax)
          queryParams.append('precoMax', precoMax);
        if (distancia)
          queryParams.append(
            'raioKm',
            distancia.toString(),
          );

        // Altere a porta se necessário (3333 ou 4000)
        const response = await fetch(
          `http://localhost:3333/api/localizacao/prestadores?${queryParams.toString()}`,
        );

        if (!response.ok)
          throw new Error('Falha ao carregar prestadores.');

        const data = await response.json();
        setProviders(data);
      } catch (err: any) {
        setError(
          err.message || 'Erro inesperado ao buscar dados.',
        );
      } finally {
        setLoading(false);
      }
    }, 800); // Fim do delay de 800ms

    // Limpa o timeout se o usuário digitar algo novo antes dos 800ms
    return () => clearTimeout(timeoutId);
  }, [
    searchLocation,
    searchService,
    categoria,
    distancia,
    precoMax,
  ]);

  // Renderizações de status
  if (loading)
    return (
      <div className="flex-1 flex justify-center mt-10 text-gray-500">
        Buscando...
      </div>
    );
  if (error)
    return (
      <div className="flex-1 flex justify-center mt-10 text-red-500">
        {error}
      </div>
    );
  if (providers.length === 0)
    return (
      <div className="flex-1 flex justify-center mt-10 text-gray-500">
        Nenhum prestador encontrado.
      </div>
    );

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
      {providers.map((user, index) => (
        <UserCard key={index} user={user} />
      ))}
    </section>
  );
};

export default ProvidersGrid;
