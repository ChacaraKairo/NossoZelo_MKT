import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePerfilEditor } from '@/hooks/usePerfilEditor';
import { PerfilUsuario, TipoUsuario } from '@/types/perfil';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import logger from '@/utils/logger';
import styles from '@/styles/components/perfil/FormEditarPerfil.module.css';

interface FormEditarPerfilProps {
  perfil: PerfilUsuario;
  tipoUsuario?: TipoUsuario;
  onCancel: () => void;
  onSave: (perfil: PerfilUsuario) => void;
}

type CampoTextoProps = {
  label: string;
  campo: string;
  valor: unknown;
  placeholder?: string;
  onChange: (campo: string, valor: string) => void;
  erro?: string;
  aviso?: string;
  wide?: boolean;
  type?: string;
};

const CONTEXTO = 'FormEditarPerfil';

function valorCampo(valor: unknown) {
  if (valor === null || valor === undefined) return '';
  if (Array.isArray(valor)) return valor.join(', ');
  return String(valor);
}

function CampoTexto({
  label,
  campo,
  valor,
  placeholder,
  onChange,
  erro,
  aviso,
  wide = false,
  type = 'text',
}: CampoTextoProps) {
  return (
    <label className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        className={`${styles.input} ${erro ? styles.inputInvalid : ''}`}
        value={valorCampo(valor)}
        placeholder={placeholder}
        onChange={(event) => onChange(campo, event.target.value)}
      />
      {erro && <p className={styles.helperError}>{erro}</p>}
      {!erro && aviso && <p className={styles.helperWarning}>{aviso}</p>}
    </label>
  );
}

export default function FormEditarPerfil({
  perfil,
  tipoUsuario,
  onCancel,
  onSave,
}: FormEditarPerfilProps) {
  const editor = usePerfilEditor();
  const { iniciarEdicao } = editor;
  const [errosValidacao, setErrosValidacao] = useState<
    Record<string, string>
  >({});
  const [avisosValidacao, setAvisosValidacao] = useState<
    Record<string, string>
  >({});
  const [feedbackLocal, setFeedbackLocal] = useState<string | null>(null);

  const tipo = useMemo(
    () =>
      tipoUsuario ||
      perfil.perfil_tipo ||
      perfil.tipo ||
      perfil.dados_usuario?.tipo,
    [perfil, tipoUsuario],
  );
  const isPrestador = ['cuidador', 'enfermeiro', 'acompanhante'].includes(
    String(tipo),
  );

  useEffect(() => {
    logger.info(CONTEXTO, 'Abertura do formulario', {
      tipoUsuario: tipo,
    });
    iniciarEdicao(perfil);
  }, [iniciarEdicao, perfil, tipo]);

  const alterarCampo = (campo: string, valor: string) => {
    logger.debug(CONTEXTO, 'Alteracao de campo', { campo });
    editor.alterarCampo(campo, valor);
  };

  const validar = () => {
    logger.info(CONTEXTO, 'Validacao iniciada', { tipoUsuario: tipo });

    const erros: Record<string, string> = {};
    const avisos: Record<string, string> = {};
    const nome = valorCampo(editor.form.nome).trim();
    const telefone = valorCampo(editor.form.telefone).trim();
    const cidade = valorCampo(editor.form.cidade).trim();
    const estado = valorCampo(editor.form.estado).trim();
    const bairro = valorCampo(editor.form.bairro).trim();
    const endereco = valorCampo(editor.form.endereco).trim();

    if (!nome) erros.nome = 'Nome e obrigatorio.';
    if (telefone && telefone.replace(/\D/g, '').length < 8) {
      erros.telefone = 'Informe um telefone com pelo menos 8 numeros.';
    }
    if (!cidade) avisos.cidade = 'Cidade e recomendada.';
    if (!estado) {
      avisos.estado = 'Estado e recomendado.';
    } else if (estado.length > 2) {
      avisos.estado = 'Use a UF para manter o endereco padronizado.';
    }
    if (!bairro) avisos.bairro = 'Bairro ajuda clientes e prestadores.';
    if (!endereco) avisos.endereco = 'Endereco completo ajuda nos atendimentos.';

    setErrosValidacao(erros);
    setAvisosValidacao(avisos);

    if (Object.keys(erros).length > 0) {
      logger.warn(CONTEXTO, 'Campos invalidos', { erros });
      return false;
    }

    logger.info(CONTEXTO, 'Formulario valido', { avisos });
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFeedbackLocal(null);

    if (!validar()) return;

    logger.info(CONTEXTO, 'Envio do formulario', {
      tipoUsuario: tipo,
    });

    try {
      const perfilAtualizado = await editor.salvarAlteracoes();

      if (perfilAtualizado) {
        setFeedbackLocal('Alteracoes salvas. Atualizando a tela...');
        window.setTimeout(() => {
          onSave(perfilAtualizado);
        }, 900);
      }
    } catch (error: unknown) {
      logger.error(CONTEXTO, 'Erro no envio do formulario', {
        mensagem: extrairMensagemErro(error),
      });
    }
  };

  const handleCancel = () => {
    logger.info(CONTEXTO, 'Cancelamento do formulario', {
      tipoUsuario: tipo,
    });
    editor.cancelarEdicao();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Dados principais</span>
          <h2 className={styles.title}>Editar perfil</h2>
          <p className={styles.subtitle}>
            Atualize seus dados principais. As informacoes profissionais ficam
            nas outras abas do perfil.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        <CampoTexto
          label="Nome"
          campo="nome"
          valor={editor.form.nome}
          placeholder="Informe seu nome"
          erro={errosValidacao.nome}
          onChange={alterarCampo}
        />
        <CampoTexto
          label="Telefone"
          campo="telefone"
          valor={editor.form.telefone}
          placeholder="Informe seu telefone"
          erro={errosValidacao.telefone}
          onChange={alterarCampo}
        />
        <CampoTexto
          label="Cidade"
          campo="cidade"
          valor={editor.form.cidade}
          placeholder="Informe sua cidade"
          aviso={avisosValidacao.cidade}
          onChange={alterarCampo}
        />
        <CampoTexto
          label="Estado"
          campo="estado"
          valor={editor.form.estado}
          placeholder="UF"
          aviso={avisosValidacao.estado}
          onChange={alterarCampo}
        />
        <CampoTexto
          label="Bairro"
          campo="bairro"
          valor={editor.form.bairro}
          placeholder="Informe seu bairro"
          aviso={avisosValidacao.bairro}
          onChange={alterarCampo}
        />
        <CampoTexto
          label="Endereco"
          campo="endereco"
          valor={editor.form.endereco}
          placeholder="Rua, numero e complemento"
          aviso={avisosValidacao.endereco}
          wide
          onChange={alterarCampo}
        />
      </div>

      {isPrestador && (
        <p className={styles.statusInfo}>
          Bio, experiencia, valores, disponibilidade e especialidades nao
          ficam nesta tela para evitar mudancas por engano. Use as abas de
          servicos e dados profissionais quando precisar revisar essas
          informacoes.
        </p>
      )}

      {editor.erro && (
        <p className={styles.statusError}>{editor.erro}</p>
      )}
      {(editor.sucesso || feedbackLocal) && (
        <p className={styles.statusSuccess}>
          {feedbackLocal || editor.sucesso}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={editor.salvando}
          className={styles.primaryButton}
        >
          {editor.salvando ? 'Salvando...' : 'Salvar alteracoes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={editor.salvando}
          className={styles.secondaryButton}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
