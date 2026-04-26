import { FormEvent, useEffect, useMemo, useState } from 'react';
import EstadoVazio from '@/components/common/EstadoVazio';
import {
  servicoService,
  ServicoPayload,
} from '@/service/servicoService';
import { PerfilUsuario, ServicoPerfil } from '@/types/perfil';
import logger from '@/utils/logger';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from './styles/PerfilOperacional.module.css';

const CONTEXTO = 'AbaServicosOperacionais';

interface AbaServicosOperacionaisProps {
  perfil: PerfilUsuario;
  onServicosAtualizados?: (servicos: ServicoPerfil[]) => void;
}

const FORM_INICIAL: ServicoPayload = {
  nome: '',
  descricao: '',
  valor: 0,
  tipo_cobranca: 'hora',
};

function formatarValor(valor?: number | string | null) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 'Valor não informado';
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function validarForm(form: ServicoPayload) {
  if (form.nome.trim().length < 3) {
    return 'Informe um nome de serviço com pelo menos 3 caracteres.';
  }
  if (form.descricao.trim().length < 10) {
    return 'Descreva o serviço com pelo menos 10 caracteres.';
  }
  if (!Number.isFinite(Number(form.valor)) || Number(form.valor) < 10) {
    return 'Informe um valor a partir de R$ 10.';
  }
  if (!['hora', 'dia'].includes(form.tipo_cobranca)) {
    return 'Selecione um tipo de cobrança válido.';
  }
  return null;
}

export default function AbaServicosOperacionais({
  perfil,
  onServicosAtualizados,
}: AbaServicosOperacionaisProps) {
  const servicosIniciais = useMemo(
    () => perfil.servicos || [],
    [perfil.servicos],
  );
  const [servicos, setServicos] =
    useState<ServicoPerfil[]>(servicosIniciais);
  const [form, setForm] = useState<ServicoPayload>(FORM_INICIAL);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    setServicos(servicosIniciais);
  }, [servicosIniciais]);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderizando serviços operacionais', {
      total: servicos.length,
    });
  }, [servicos.length]);

  const sincronizarServicos = (proximos: ServicoPerfil[]) => {
    setServicos(proximos);
    onServicosAtualizados?.(proximos);
  };

  const carregarServicos = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const dados = await servicoService.listarMeus();
      sincronizarServicos(dados);
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  };

  const cancelarEdicao = () => {
    setForm(FORM_INICIAL);
    setEditandoId(null);
    setErro(null);
  };

  const salvarServico = async (event: FormEvent) => {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    const erroValidacao = validarForm(form);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setCarregando(true);
      const payload = {
        ...form,
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        valor: Number(form.valor),
      };

      const salvo = editandoId
        ? await servicoService.atualizar(editandoId, payload)
        : await servicoService.criar(payload);

      const proximos = editandoId
        ? servicos.map((servico) =>
            servico.id === salvo.id ? salvo : servico,
          )
        : [salvo, ...servicos];

      sincronizarServicos(proximos);
      setSucesso(
        editandoId
          ? 'Serviço atualizado com sucesso.'
          : 'Serviço criado com sucesso.',
      );
      cancelarEdicao();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  };

  const editarServico = (servico: ServicoPerfil) => {
    logger.info(CONTEXTO, 'Editando serviço', { servicoId: servico.id });
    setEditandoId(servico.id);
    setForm({
      nome: servico.nome || '',
      descricao: servico.descricao || '',
      valor: Number(servico.valor) || 0,
      tipo_cobranca:
        servico.tipo_cobranca === 'dia' ? 'dia' : 'hora',
    });
    setErro(null);
    setSucesso(null);
  };

  const removerServico = async (servicoId: number) => {
    const confirmou = window.confirm(
      'Remover este serviço? Ele não poderá ser usado em novas solicitações.',
    );
    if (!confirmou) return;

    try {
      setCarregando(true);
      setErro(null);
      await servicoService.remover(servicoId);
      sincronizarServicos(
        servicos.filter((servico) => servico.id !== servicoId),
      );
      setSucesso('Serviço removido com sucesso.');
    } catch (error) {
      setErro(extrairMensagemErro(error));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Meus Serviços</h2>
          <p className={styles.subtitle}>
            Configure atendimentos reais que clientes poderão solicitar.
          </p>
        </div>
        <button
          type="button"
          className={styles.ghostButton}
          onClick={carregarServicos}
          disabled={carregando}
        >
          Atualizar lista
        </button>
      </header>

      {erro && <div className={styles.error}>{erro}</div>}
      {sucesso && <div className={styles.success}>{sucesso}</div>}

      <form className={styles.form} onSubmit={salvarServico}>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.label}>Nome</span>
            <input
              className={styles.input}
              value={form.nome}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  nome: event.target.value,
                }))
              }
              placeholder="Ex: Plantão de acompanhamento"
              disabled={carregando}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Valor</span>
            <input
              className={styles.input}
              type="number"
              min={10}
              step="0.01"
              value={form.valor || ''}
              onChange={(event) =>
                setForm((atual) => ({
                  ...atual,
                  valor: Number(event.target.value),
                }))
              }
              disabled={carregando}
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Descrição</span>
          <textarea
            className={styles.textarea}
            value={form.descricao}
            onChange={(event) =>
              setForm((atual) => ({
                ...atual,
                descricao: event.target.value,
              }))
            }
            placeholder="Explique o que está incluso neste atendimento."
            disabled={carregando}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Cobrança</span>
          <select
            className={styles.select}
            value={form.tipo_cobranca}
            onChange={(event) =>
              setForm((atual) => ({
                ...atual,
                tipo_cobranca: event.target.value as 'hora' | 'dia',
              }))
            }
            disabled={carregando}
          >
            <option value="hora">Por hora</option>
            <option value="dia">Por dia</option>
          </select>
        </label>

        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={carregando}
          >
            {editandoId ? 'Salvar alterações' : 'Criar serviço'}
          </button>
          {editandoId && (
            <button
              type="button"
              className={styles.ghostButton}
              onClick={cancelarEdicao}
              disabled={carregando}
            >
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      {servicos.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum serviço cadastrado."
          descricao="Crie seu primeiro serviço para que clientes possam solicitar agendamentos reais."
        />
      ) : (
        <div className={styles.grid}>
          {servicos.map((servico) => (
            <article key={servico.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{servico.nome}</h3>
              <p className={styles.muted}>{servico.descricao}</p>
              <div className={styles.meta}>
                <span className={styles.badge}>
                  {formatarValor(servico.valor)}
                </span>
                <span className={styles.badge}>
                  por {servico.tipo_cobranca === 'dia' ? 'dia' : 'hora'}
                </span>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => editarServico(servico)}
                  disabled={carregando}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => removerServico(servico.id)}
                  disabled={carregando}
                >
                  Remover
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
