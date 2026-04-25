import { FormEvent, useEffect, useState } from 'react';
import { usePerfilEditor } from '@/hooks/usePerfilEditor';
import { PerfilUsuario, TipoUsuario } from '@/types/perfil';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import logger from '@/utils/logger';

interface FormEditarPerfilProps {
  perfil: PerfilUsuario;
  tipoUsuario?: TipoUsuario;
  onCancel: () => void;
  onSave: (perfil: PerfilUsuario) => void;
}

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
  type = 'text',
}: {
  label: string;
  campo: string;
  valor: unknown;
  placeholder?: string;
  onChange: (campo: string, valor: string) => void;
  erro?: string;
  aviso?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-slate-500">
        {label}
      </span>
      <input
        type={type}
        className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500 ${
          erro ? 'border-red-300' : 'border-slate-200'
        }`}
        value={valorCampo(valor)}
        placeholder={placeholder}
        onChange={(event) => onChange(campo, event.target.value)}
      />
      {erro && (
        <p className="mt-1 text-xs font-semibold text-red-600">{erro}</p>
      )}
      {!erro && aviso && (
        <p className="mt-1 text-xs font-semibold text-amber-600">{aviso}</p>
      )}
    </label>
  );
}

function CampoArea({
  label,
  campo,
  valor,
  placeholder,
  onChange,
}: {
  label: string;
  campo: string;
  valor: unknown;
  placeholder?: string;
  onChange: (campo: string, valor: string) => void;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="text-xs font-bold uppercase text-slate-500">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-[110px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-500"
        value={valorCampo(valor)}
        placeholder={placeholder}
        onChange={(event) => onChange(campo, event.target.value)}
      />
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
  const [errosValidacao, setErrosValidacao] = useState<
    Record<string, string>
  >({});
  const [avisosValidacao, setAvisosValidacao] = useState<
    Record<string, string>
  >({});
  const tipo =
    tipoUsuario ||
    perfil.perfil_tipo ||
    perfil.tipo ||
    perfil.dados_usuario?.tipo;
  const isPrestador = ['cuidador', 'enfermeiro', 'acompanhante'].includes(
    String(tipo),
  );
  const isEnfermeiro = tipo === 'enfermeiro';

  useEffect(() => {
    logger.info(CONTEXTO, 'Abertura do formulário', {
      tipoUsuario: tipo,
    });
    editor.iniciarEdicao(perfil);
  }, [perfil]);

  const alterarCampo = (campo: string, valor: string) => {
    logger.debug(CONTEXTO, 'Alteração de campo', { campo });
    editor.alterarCampo(campo, valor);
  };

  const validar = () => {
    logger.info(CONTEXTO, 'Validação iniciada', { tipoUsuario: tipo });

    const erros: Record<string, string> = {};
    const avisos: Record<string, string> = {};
    const nome = valorCampo(editor.form.nome).trim();
    const telefone = valorCampo(editor.form.telefone).trim();
    const cidade = valorCampo(editor.form.cidade).trim();
    const estado = valorCampo(editor.form.estado).trim();
    const valorHora = valorCampo(editor.form.valor_hora).trim();
    const valorDiaria = valorCampo(editor.form.valor_diaria).trim();
    const anosExperiencia = valorCampo(editor.form.anos_experiencia).trim();

    if (!nome) erros.nome = 'Nome é obrigatório.';
    if (telefone && telefone.replace(/\D/g, '').length < 8) {
      erros.telefone = 'Informe um telefone com pelo menos 8 números.';
    }
    if (!cidade) avisos.cidade = 'Cidade é recomendada.';
    if (!estado) avisos.estado = 'Estado é recomendado.';
    if (valorHora && Number(valorHora) <= 0) {
      erros.valor_hora = 'Valor hora deve ser positivo.';
    }
    if (valorDiaria && Number(valorDiaria) <= 0) {
      erros.valor_diaria = 'Valor diária deve ser positivo.';
    }
    if (anosExperiencia && Number(anosExperiencia) < 0) {
      erros.anos_experiencia =
        'Anos de experiência deve ser maior ou igual a zero.';
    }
    if (isEnfermeiro && isPrestador && !valorCampo(editor.form.coren).trim()) {
      erros.coren = 'COREN é obrigatório para enfermeiros.';
    }

    setErrosValidacao(erros);
    setAvisosValidacao(avisos);

    if (Object.keys(erros).length > 0) {
      logger.warn(CONTEXTO, 'Campos inválidos', { erros });
      return false;
    }

    logger.info(CONTEXTO, 'Formulário válido', { avisos });
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validar()) return;

    logger.info(CONTEXTO, 'Envio do formulário', {
      tipoUsuario: tipo,
    });

    try {
      const perfilAtualizado = await editor.salvarAlteracoes();

      if (perfilAtualizado) {
        onSave(perfilAtualizado);
      }
    } catch (error: unknown) {
      logger.error(CONTEXTO, 'Erro no envio do formulário', {
        mensagem: extrairMensagemErro(error),
      });
    }
  };

  const handleCancel = () => {
    logger.info(CONTEXTO, 'Cancelamento do formulário', {
      tipoUsuario: tipo,
    });
    editor.cancelarEdicao();
    onCancel();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-teal-100 bg-teal-50/40 p-5"
    >
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-800">Editar perfil</h2>
        <p className="text-sm text-slate-500">
          Atualize apenas os dados que deseja alterar.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
          placeholder="UF ou estado"
          aviso={avisosValidacao.estado}
          onChange={alterarCampo}
        />
        <CampoTexto
          label="Bairro"
          campo="bairro"
          valor={editor.form.bairro}
          placeholder="Informe seu bairro"
          onChange={alterarCampo}
        />
        <CampoTexto
          label="Endereço"
          campo="endereco"
          valor={editor.form.endereco}
          placeholder="Informe seu endereço"
          onChange={alterarCampo}
        />
        <CampoTexto
          label="URL da foto de perfil"
          campo="url_foto_perfil"
          valor={editor.form.url_foto_perfil}
          placeholder="Cole a URL da sua foto"
          onChange={alterarCampo}
        />

        {isPrestador && (
          <>
            <CampoArea
              label="Bio"
              campo="bio"
              valor={editor.form.bio}
              placeholder="Conte sobre sua experiência profissional"
              onChange={alterarCampo}
            />
            <CampoTexto
              label="Anos de experiência"
              campo="anos_experiencia"
              valor={editor.form.anos_experiencia}
              placeholder="Informe a quantidade de anos"
              type="number"
              erro={errosValidacao.anos_experiencia}
              onChange={alterarCampo}
            />
            <CampoTexto
              label="Valor hora"
              campo="valor_hora"
              valor={editor.form.valor_hora}
              placeholder="Informe o valor por hora"
              type="number"
              erro={errosValidacao.valor_hora}
              onChange={alterarCampo}
            />
            <CampoTexto
              label="Valor diária"
              campo="valor_diaria"
              valor={editor.form.valor_diaria}
              placeholder="Informe o valor da diária"
              type="number"
              erro={errosValidacao.valor_diaria}
              onChange={alterarCampo}
            />
            <CampoTexto
              label="Disponibilidade"
              campo="disponibilidade"
              valor={editor.form.disponibilidade}
              placeholder="Informe sua disponibilidade"
              onChange={alterarCampo}
            />
            <CampoTexto
              label="Especialidades"
              campo="especialidades"
              valor={editor.form.especialidades}
              placeholder="Separe especialidades por vírgula"
              onChange={alterarCampo}
            />
          </>
        )}

        {isEnfermeiro && (
          <CampoTexto
            label="COREN"
            campo="coren"
            valor={editor.form.coren}
            placeholder="Informe seu COREN"
            erro={errosValidacao.coren}
            onChange={alterarCampo}
          />
        )}
      </div>

      {editor.erro && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {editor.erro}
        </p>
      )}
      {editor.sucesso && (
        <p className="mt-4 text-sm font-semibold text-teal-700">
          {editor.sucesso}
        </p>
      )}

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={editor.salvando}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {editor.salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
