// client/src/pages/meu-perfil/hooks/usePerfilEditor.ts

import { useState, useEffect } from 'react';
import { perfilService } from '@/service/perfilService';

export const usePerfilEditor = (
  perfilInicial: any,
  setPerfilGlobal: any,
) => {
  const [editandoId, setEditandoId] = useState<
    string | null
  >(null);
  const [tempData, setTempData] = useState<any>(
    perfilInicial || {},
  );

  // Mantém o dado temporário sincronizado se o perfil carregar depois do hook
  useEffect(() => {
    if (perfilInicial) {
      setTempData({ ...perfilInicial });
    }
  }, [perfilInicial]);

  const iniciarEdicao = (campo: string) => {    setEditandoId(campo);
    setTempData({ ...perfilInicial }); // Reset para o valor original do banco
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
  };

  const salvarEdicao = async (campo: string) => {
    try {
      const valor = tempData[campo];      // 1. Chama o service (Back-end)
      const perfilAtualizado =
        await perfilService.atualizarDadosPerfil({
          [campo]: valor,
        });

      // 2. Atualiza o estado global com o retorno real do servidor
      // Isso garante que se o back-end formatar algo (ex: máscara), a UI reflete o correto
      setPerfilGlobal((prev: any) => ({
        ...prev,
        ...perfilAtualizado,
      }));

      setEditandoId(null);    } catch (err: any) {      alert(
        'Não foi possível salvar a alteração. Verifique sua conexão.',
      );
    }
  };

  const handleInputChange = (
    campo: string,
    valor: string,
  ) => {
    setTempData((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return {
    editandoId,
    tempData,
    iniciarEdicao,
    cancelarEdicao,
    salvarEdicao,
    handleInputChange,
  };
};
