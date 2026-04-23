/**
 * @author DevHelper (ZeloArchitect AI)
 * @version 1.1
 * @date 22/04/2026
 * @description Higher-Order Component (HOC) responsável por interceptar o acesso a rotas protegidas.
 * Realiza a validação de identidade através de cookies e implementa o controle de acesso
 * baseado em funções (RBAC), garantindo a integridade da navegação no ecossistema NossoZelo.
 */

import {
  useEffect,
  useState,
  createElement,
  ComponentType,
} from 'react';
import { useRouter } from 'next/router';
import { getUsuarioDoCookie } from './auth';

console.log(
  '[LOG-FLUXO] Inicializando lógica global do HOC withAuth para proteção de rotas.',
);

interface WithAuthOptions {
  rolesPermitidas?: string[]; // Ex: ['cuidador', 'enfermeiro', 'cliente']
  redirectPath?: string; // Rota de fallback caso não esteja autenticado
}

/**
 * Componente de Ordem Superior para encapsulamento de rotas privadas.
 * @param {ComponentType<P>} WrappedComponent - O componente da página a ser protegida.
 * @param {WithAuthOptions} options - Configurações de permissões e redirecionamento.
 * @returns {Function} - Retorna o componente funcional devidamente protegido.
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {},
) {
  const { rolesPermitidas, redirectPath = '/login-user' } =
    options;

  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] =
      useState<boolean>(false);
    const [isVerifying, setIsVerifying] =
      useState<boolean>(true);

    useEffect(() => {
      console.log(
        `[LOG-FLUXO] Iniciando verificação de segurança para a rota: ${router.asPath}`,
      );

      try {
        const usuario = getUsuarioDoCookie();

        // 1. Verificação de Identidade (Sessão)
        console.log(
          '[LOG-FLUXO] Passo 1: Validando existência de token/cookie de sessão.',
        );
        if (!usuario) {
          console.error(
            `[ERRO-FLUXO] Acesso Negado: Usuário não autenticado tentando acessar ${router.asPath}. Redirecionando para ${redirectPath}.`,
          );
          router.replace(redirectPath);
          return;
        }

        // 2. Verificação de Permissão (RBAC - Role Based Access Control)
        console.log(
          `[LOG-FLUXO] Passo 2: Validando permissões para o tipo de usuário: ${usuario.tipo}`,
        );
        if (
          rolesPermitidas &&
          !rolesPermitidas.includes(usuario.tipo)
        ) {
          console.error(
            `[ERRO-FLUXO] Permissão Insuficiente: Usuário '${usuario.tipo}' tentou acessar área restrita aos papéis [${rolesPermitidas.join(', ')}].`,
          );
          router.replace('/');
          return;
        }

        // 3. Conclusão da Verificação
        console.log(
          `[LOG-FLUXO] Sucesso: Usuário ID ${usuario.id} autorizado para a rota ${router.asPath}.`,
        );
        setIsAuthorized(true);
      } catch (error: any) {
        console.error(
          `[ERRO-FLUXO] Falha crítica no processamento do HOC withAuth: ${error.message}`,
        );
        router.replace(redirectPath);
      } finally {
        setIsVerifying(false);
      }
    }, [router]);

    // Estado de transição para prevenir vazamento de conteúdo (Flicker)
    if (isVerifying || !isAuthorized) {
      console.log(
        '[LOG-FLUXO] Renderizando estado de carregamento/verificação de segurança.',
      );
      return createElement('div', {
        style: {
          display: 'flex',
          height: '100vh',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
        },
        children: createElement('div', {
          style: {
            width: '40px',
            height: '40px',
            border: '4px solid #3b82f6',
            borderBottomColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          },
        }),
      });
    }

    // Retorna o componente original após validação de fluxo bem-sucedida
    console.log(
      `[LOG-FLUXO] Liberando renderização do componente: ${WrappedComponent.displayName || WrappedComponent.name || 'ProtectedComponent'}`,
    );
    return createElement(WrappedComponent, props);
  };
}

export default withAuth;
