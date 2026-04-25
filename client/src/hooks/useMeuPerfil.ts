import { useCallback, useEffect, useMemo, useState } from 'react';
import { perfilService } from '@/service/perfilService';
import { PerfilUsuario, TipoUsuario } from '@/types/perfil';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

const CONTEXTO = 'useMeuPerfil';
const TIPOS_PRESTADOR = [
  'cuidador',
  'enfermeiro',
  'acompanhante',
];

function obterTipoUsuario(
  perfil: PerfilUsuario | null,
): TipoUsuario | undefined {
  return (
    perfil?.perfil_tipo ||
    perfil?.tipo ||
    perfil?.dados_usuario?.tipo
  );
}

export function useMeuPerfil() {
  const [perfil, setPerfil] =
    useState<PerfilUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarPerfil = useCallback(async () => {
    logger.info(
      CONTEXTO,
      'Iniciando busca do perfil autenticado',
    );

    try {
      setLoading(true);
      setError(null);

      const dados = await perfilService.obterMeuPerfil();
      const tipoDetectado = obterTipoUsuario(dados);

      logger.info(CONTEXTO, 'Perfil carregado com sucesso', {
        tipoUsuario: tipoDetectado,
      });
      logger.debug(CONTEXTO, 'Tipo detectado no perfil', {
        tipoUsuario: tipoDetectado,
      });

      setPerfil(dados);
      return dados;
    } catch (err: unknown) {
      const mensagem = extrairMensagemErro(err);

      logger.error(CONTEXTO, 'Erro ao buscar perfil', err);
      setError(mensagem);
      setPerfil(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const recarregarPerfil = useCallback(() => {
    logger.info(CONTEXTO, 'Recarregando perfil autenticado');
    return carregarPerfil();
  }, [carregarPerfil]);

  const definirPerfil = useCallback(
    (perfilAtualizado: PerfilUsuario) => {
      const tipoDetectado = obterTipoUsuario(perfilAtualizado);
      logger.info(CONTEXTO, 'Perfil atualizado localmente', {
        tipoUsuario: tipoDetectado,
      });
      setPerfil(perfilAtualizado);
    },
    [],
  );

  useEffect(() => {
    carregarPerfil();
  }, [carregarPerfil]);

  const tipoUsuario = useMemo(
    () => obterTipoUsuario(perfil),
    [perfil],
  );

  const isCliente = tipoUsuario === 'cliente';
  const isPrestador = Boolean(
    tipoUsuario && TIPOS_PRESTADOR.includes(tipoUsuario),
  );

  return {
    perfil,
    loading,
    error,
    carregarPerfil,
    recarregarPerfil,
    definirPerfil,
    isCliente,
    isPrestador,
    tipoUsuario,
  };
}

export default useMeuPerfil;
