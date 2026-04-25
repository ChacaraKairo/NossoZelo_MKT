import {
  ComponentType,
  createElement,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { getUsuarioDoCookie } from './auth';
import logger from '@/utils/logger';

interface WithAuthOptions {
  rolesPermitidas?: string[];
  redirectPath?: string;
}

const CONTEXTO = 'withAuth';

export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {},
) {
  const { rolesPermitidas, redirectPath = '/login-user' } = options;

  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
      logger.debug(CONTEXTO, 'Iniciando verificacao de seguranca', {
        rota: router.asPath,
      });

      try {
        const usuario = getUsuarioDoCookie();

        if (!usuario) {
          logger.warn(CONTEXTO, 'Usuario nao autenticado', {
            rota: router.asPath,
            redirectPath,
          });
          router.replace(redirectPath);
          return;
        }

        if (
          rolesPermitidas &&
          !rolesPermitidas.includes(usuario.tipo)
        ) {
          logger.warn(CONTEXTO, 'Permissao insuficiente', {
            tipoUsuario: usuario.tipo,
            rolesPermitidas,
          });
          router.replace('/');
          return;
        }

        logger.debug(CONTEXTO, 'Usuario autorizado', {
          usuarioId: usuario.id,
          rota: router.asPath,
        });
        setIsAuthorized(true);
      } catch (error: unknown) {
        logger.error(CONTEXTO, 'Falha no processamento do HOC', error);
        router.replace(redirectPath);
      } finally {
        setIsVerifying(false);
      }
    }, [router]);

    if (isVerifying || !isAuthorized) {
      return createElement(
        'div',
        {
          style: {
            display: 'flex',
            height: '100vh',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
          },
        },
        createElement('div', {
          style: {
            width: '40px',
            height: '40px',
            border: '4px solid #3b82f6',
            borderBottomColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          },
        }),
      );
    }

    return createElement(WrappedComponent, props);
  };
}

export default withAuth;
