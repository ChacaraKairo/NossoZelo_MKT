import { useCallback, useMemo, useState } from 'react';
import { perfilService } from '@/service/perfilService';
import {
  AtualizarPerfilPayload,
  PerfilUsuario,
} from '@/types/perfil';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';

type ValorCampo =
  | string
  | number
  | boolean
  | string[]
  | null
  | undefined;

type FormPerfil = Record<string, ValorCampo>;

const CONTEXTO = 'usePerfilEditor';
const CAMPOS_PROTEGIDOS = new Set([
  'id',
  'email',
  'senha',
  'cpf',
  'tipo',
  'role',
  'admin',
  'avaliacao_media',
  'criado_em',
  'updated_at',
]);
const CAMPOS_EDITAVEIS = new Set([
  'nome',
  'telefone',
  'cidade',
  'estado',
  'bairro',
  'endereco',
  'url_foto_perfil',
  'bio',
  'coren',
  'anos_experiencia',
  'valor_hora',
  'valor_diaria',
  'disponibilidade',
  'especialidades',
]);

function extrairCamposEditaveis(
  perfil: PerfilUsuario,
): FormPerfil {
  const origem = {
    ...perfil.dados_usuario,
    ...perfil.dados_profissionais,
    ...perfil,
  } as unknown as Record<string, unknown>;

  const form: FormPerfil = {};

  for (const [campo, valor] of Object.entries(origem)) {
    if (
      CAMPOS_EDITAVEIS.has(campo) &&
      !CAMPOS_PROTEGIDOS.has(campo)
    ) {
      form[campo] = valor as ValorCampo;
    }
  }

  return form;
}

function montarPayloadAlterado(
  original: FormPerfil,
  atual: FormPerfil,
): AtualizarPerfilPayload {
  const payload: AtualizarPerfilPayload = {};

  for (const [campo, valor] of Object.entries(atual)) {
    if (
      CAMPOS_PROTEGIDOS.has(campo) ||
      !CAMPOS_EDITAVEIS.has(campo)
    ) {
      continue;
    }

    if (JSON.stringify(original[campo]) !== JSON.stringify(valor)) {
      (payload as Record<string, ValorCampo>)[campo] = valor;
    }
  }

  return payload;
}

export function usePerfilEditor() {
  const [form, setForm] = useState<FormPerfil>({});
  const [formOriginal, setFormOriginal] = useState<FormPerfil>({});
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const iniciarEdicao = useCallback((perfil: PerfilUsuario) => {
    const formInicial = extrairCamposEditaveis(perfil);

    logger.info(CONTEXTO, 'Iniciando edição de perfil', {
      campos: Object.keys(formInicial),
    });

    setForm(formInicial);
    setFormOriginal(formInicial);
    setErro(null);
    setSucesso(null);
    setEditando(true);
  }, []);

  const alterarCampo = useCallback(
    (campo: string, valor: ValorCampo) => {
      if (CAMPOS_PROTEGIDOS.has(campo)) {
        logger.warn(
          CONTEXTO,
          'Tentativa de alterar campo protegido ignorada',
          { campo },
        );
        return;
      }

      logger.debug(CONTEXTO, 'Campo alterado', { campo });

      setForm((atual) => ({
        ...atual,
        [campo]: valor,
      }));
    },
    [],
  );

  const payloadAlterado = useMemo(
    () => montarPayloadAlterado(formOriginal, form),
    [formOriginal, form],
  );

  const salvarAlteracoes =
    useCallback(async (): Promise<PerfilUsuario | null> => {
      const payload = montarPayloadAlterado(formOriginal, form);

      logger.info(CONTEXTO, 'Payload final enviado', {
        campos: Object.keys(payload),
      });

      if (Object.keys(payload).length === 0) {
        setSucesso('Nenhuma alteração para salvar.');
        return null;
      }

      try {
        setSalvando(true);
        setErro(null);
        setSucesso(null);

        const perfilAtualizado =
          await perfilService.atualizarDadosPerfil(payload);

        logger.info(CONTEXTO, 'Update de perfil concluído', {
          tipoUsuario: perfilAtualizado.perfil_tipo,
        });

        const novoForm =
          extrairCamposEditaveis(perfilAtualizado);
        setForm(novoForm);
        setFormOriginal(novoForm);
        setEditando(false);
        setSucesso('Perfil atualizado com sucesso.');

        return perfilAtualizado;
      } catch (err: unknown) {
        const mensagem = extrairMensagemErro(err);

        logger.error(CONTEXTO, 'Erro do update de perfil', err);
        setErro(mensagem);
        return null;
      } finally {
        setSalvando(false);
      }
    }, [form, formOriginal]);

  const cancelarEdicao = useCallback(() => {
    logger.info(CONTEXTO, 'Edição de perfil cancelada');
    setForm(formOriginal);
    setErro(null);
    setSucesso(null);
    setEditando(false);
  }, [formOriginal]);

  return {
    form,
    editando,
    salvando,
    erro,
    sucesso,
    payloadAlterado,
    iniciarEdicao,
    alterarCampo,
    salvarAlteracoes,
    cancelarEdicao,
  };
}

export default usePerfilEditor;
