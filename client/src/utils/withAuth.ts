/**
 * @author DevHelper (ZeloArchitect AI)
 * @description Higher-Order Component para proteção de rotas privadas.
 * Valida a sessão via Cookies e faz o controlo de acesso por tipo de utilizador.
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUsuarioDoCookie } from './auth';

interface WithAuthOptions {
  rolesPermitidas?: string[]; // Ex: ['cuidador', 'enfermeiro']
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: WithAuthOptions,
) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const [autorizado, setAutorizado] = useState(false);

    useEffect(() => {
      const usuario = getUsuarioDoCookie();

      // 1. Verificação de Identidade: Se não houver token, vai para o Login
      if (!usuario) {
        console.warn(
          '[BLOQUEIO] Acesso negado: Utilizador não autenticado.',
        );
        router.replace('/login-user');
        return;
      }

      // 2. Verificação de Permissão (Roles):
      // Se a página exigir um tipo específico (ex: só prestador) e o user for 'cliente'
      if (
        options?.rolesPermitidas &&
        !options.rolesPermitidas.includes(usuario.tipo)
      ) {
        console.error(
          `[BLOQUEIO] O tipo '${usuario.tipo}' não tem permissão para aceder a esta página.`,
        );
        router.replace('/'); // Redireciona para a Home
        return;
      }

      // 3. Se passou nos testes, autoriza a renderização
      setAutorizado(true);
    }, [router]);

    // Enquanto verifica, mostra um estado vazio ou loading para evitar "piscar" conteúdo privado
    if (!autorizado) {
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };
}
