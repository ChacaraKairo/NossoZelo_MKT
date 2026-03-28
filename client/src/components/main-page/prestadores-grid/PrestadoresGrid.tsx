import React, { useState, useEffect } from 'react';
import UserCard from '@/components/main-page/prestadores-grid/card/UserCard';
import Style from '@/styles/PrestadoresPage.module.css';

const PrestadoresGrid = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // 1. Puxando o token dos cookies para extrair o ID do usuário
        const tokenCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('token='))
          ?.split('=')[1];

        if (!tokenCookie) {
          throw new Error('Usuário não está logado.');
        }

        // 2. Decodificando o payload do JWT para acessar o ID
        const payloadBase64 = tokenCookie.split('.')[1];
        const base64 = payloadBase64
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        const decodedJson = decodeURIComponent(
          atob(base64)
            .split('')
            .map(
              (c) =>
                '%' +
                ('00' + c.charCodeAt(0).toString(16)).slice(
                  -2,
                ),
            )
            .join(''),
        );
        const decoded = JSON.parse(decodedJson);

        const idUsuario = decoded.id;
        if (!idUsuario) {
          throw new Error('ID de usuário inválido.');
        }

        // 3. Consultar no banco de dados (Ajuste a porta 3333 para a porta correta do seu backend)
        // Estamos usando 'cuidador' por padrão no momento.
        const tipo = 'cuidador';
        const response = await fetch(
          `http://localhost:3333/localizacao/mais-proximos/${idUsuario}/${tipo}`,
        );

        if (!response.ok) {
          throw new Error(
            'Erro ao buscar os prestadores mais próximos.',
          );
        }

        const data = await response.json();
        setProviders(data); // Define os dados no state
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Renderiza um contêiner para manter a estrutura do layout intacta
  const renderFallback = (content: React.ReactNode) => (
    <section
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.2rem',
      }}
    >
      {content}
    </section>
  );

  if (loading)
    return renderFallback(
      'Buscando prestadores próximos a você...',
    );
  if (error)
    return renderFallback(
      <span style={{ color: 'red', fontWeight: 500 }}>
        {error}
      </span>,
    );
  if (providers.length === 0)
    return renderFallback(
      'Nenhum prestador encontrado próximo a sua região.',
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

export default PrestadoresGrid;
