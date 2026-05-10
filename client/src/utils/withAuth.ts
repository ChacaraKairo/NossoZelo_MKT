import {
  ComponentType,
  createElement,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { loginService } from '@/service/Login';
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
    const { asPath, replace } = router;
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
      let cancelado = false;
      logger.debug(CONTEXTO, 'Iniciando verificacao de seguranca', {
        rota: asPath,
      });

      async function verificarSessao() {
        try {
          const sessao = await loginService.me();
          if (cancelado) return;
          const usuario = sessao.user || sessao.usuario;

          if (!usuario) {
            logger.warn(CONTEXTO, 'Usuario nao autenticado', {
              rota: asPath,
              redirectPath,
            });
            replace(redirectPath);
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
            replace('/');
            return;
          }

          if (usuario.email_confirmado === false) {
            logger.warn(CONTEXTO, 'E-mail pendente de confirmacao', {
              usuarioId: usuario.id,
              rota: asPath,
            });
            replace('/confirmar-email?pendente=1');
            return;
          }

          logger.debug(CONTEXTO, 'Usuario autorizado', {
            usuarioId: usuario.id,
            rota: asPath,
          });
          setIsAuthorized(true);
        } catch (error: unknown) {
          logger.error(CONTEXTO, 'Falha no processamento do HOC', error);
          replace(redirectPath);
        } finally {
          if (!cancelado) setIsVerifying(false);
        }
      }

      verificarSessao();
      return () => {
        cancelado = true;
      };
    }, [asPath, replace]);

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
