import { FormEvent, useEffect, useMemo, useState } from 'react';
import Carregando from '@/components/common/Carregando';
import { contratacaoService } from '@/service/contratacaoService';
import { ServicoPerfil } from '@/types/perfil';
import { getUsuarioDoCookie } from '@/utils/auth';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import logger from '@/utils/logger';
import styles from '@/styles/components/prestador/ModalContratarPrestador.module.css';

interface ModalContratarPrestadorProps {
  aberto: boolean;
  prestadorId: string;
  tipoPrestador?: string;
  servicos?: ServicoPerfil[];
  onClose: () => void;
  presentation?: 'modal' | 'inline';
}

type FormErrors = Partial<{
  data: string;
  hora: string;
  servicoId: string;
  observacao: string;
  usuario: string;
}>;

const CONTEXTO = 'ModalContratarPrestador';
const DESCRICAO_MINIMA = 10;

function hojeIsoLocal() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarMoeda(valor?: string | number | null) {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  if (Number.isNaN(numero)) return String(valor);
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function texto(valor?: string | number | null) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Nao informado';
  }
  return String(valor);
}

export default function ModalContratarPrestador({
  aberto,
  prestadorId,
  tipoPrestador,
  servicos = [],
  onClose,
  presentation = 'modal',
}: ModalContratarPrestadorProps) {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const minDate = hojeIsoLocal();

  useEffect(() => {
    if (!aberto) return;
    logger.info(CONTEXTO, 'Abertura do modal', { prestadorId });
  }, [aberto, prestadorId]);

  const servicoSelecionado = useMemo(
    () =>
      servicos.find((servico) => String(servico.id) === servicoId),
    [servicoId, servicos],
  );

  const payload = useMemo(() => {
    const usuario = getUsuarioDoCookie();
    const [horas, minutos] = hora.split(':');
    const horaFim =
      hora && horas
        ? `${String((Number(horas) + 1) % 24).padStart(2, '0')}:${
            minutos || '00'
          }`
        : undefined;

    return {
      cliente_id: usuario?.id,
      prestador_id: prestadorId,
      tipo_prestador: tipoPrestador,
      servico_id: servicoId ? Number(servicoId) : undefined,
      data,
      hora_inicio: hora || undefined,
      hora_fim: horaFim,
      preco:
        servicoSelecionado?.valor !== undefined
          ? Number(servicoSelecionado.valor)
          : undefined,
      observacoes: observacao.trim(),
      observacao: observacao.trim(),
    };
  }, [
    data,
    hora,
    observacao,
    prestadorId,
    servicoId,
    servicoSelecionado,
    tipoPrestador,
  ]);

  if (!aberto) return null;

  const validarFormulario = () => {
    const usuario = getUsuarioDoCookie();
    const descricao = observacao.trim();
    const erros: FormErrors = {};

    if (!usuario?.id) {
      erros.usuario =
        'Entre na sua conta para enviar um pedido.';
    } else if (usuario.email_confirmado === false) {
      erros.usuario =
        'Confirme seu e-mail para pedir um atendimento.';
    }

    if (!data) {
      erros.data = 'Informe a data do atendimento.';
    } else if (data < minDate) {
      erros.data = 'Escolha uma data de hoje em diante.';
    }

    if (!hora) {
      erros.hora = 'Informe o horario desejado.';
    }

    if (servicos.length === 0) {
      erros.servicoId =
        'Este profissional ainda não possui serviços disponíveis.';
    } else if (!servicoId) {
      erros.servicoId = 'Escolha o serviço desejado.';
    }

    if (descricao.length < DESCRICAO_MINIMA) {
      erros.observacao =
        'Escreva um pouco mais sobre o que você precisa.';
    }

    setFieldErrors(erros);
    return Object.keys(erros).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setErro(null);
    setSucesso(null);

    logger.info(CONTEXTO, 'Dados preenchidos', payload);

    if (!validarFormulario()) return;

    try {
      setLoading(true);
      logger.info(CONTEXTO, 'Envio de solicitacao', payload);
      await contratacaoService.solicitarContratacao(payload);
      logger.info(CONTEXTO, 'Solicitacao criada com sucesso');
      setSucesso('Pedido enviado com sucesso.');
      setTimeout(onClose, 1100);
    } catch (error: unknown) {
      const mensagem = extrairMensagemErro(error);
      const mensagemFinal = mensagem.includes('[TODO tecnico]')
        ? 'Ainda não foi possível enviar sua solicitação. Tente novamente em alguns instantes.'
        : mensagem;
      logger.error(CONTEXTO, 'Erro ao solicitar contratacao', {
        mensagem: mensagemFinal,
      });
      setErro(mensagemFinal);
    } finally {
      setLoading(false);
    }
  };

  const content = (
      <section
        className={`${styles.modal} ${
          presentation === 'inline' ? styles.inlinePanel : ''
        }`}
        role={presentation === 'modal' ? 'dialog' : undefined}
        aria-modal={presentation === 'modal' ? true : undefined}
        aria-labelledby="modal-contratar-titulo"
      >
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>Proposta de atendimento</p>
            <h2 id="modal-contratar-titulo" className={styles.title}>
              Solicitar atendimento
            </h2>
            <p className={styles.subtitle}>
              Conte quando precisa do serviço e explique os principais cuidados
              para o profissional avaliar seu pedido.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            {presentation === 'inline' ? 'Fechar pedido' : 'Fechar'}
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {fieldErrors.usuario && (
            <p className={styles.errorBox}>{fieldErrors.usuario}</p>
          )}

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Data desejada</span>
              <input
                type="date"
                value={data}
                min={minDate}
                onChange={(event) => {
                  setData(event.target.value);
                  setFieldErrors((atual) => ({
                    ...atual,
                    data: undefined,
                  }));
                }}
                className={`${styles.input} ${
                  fieldErrors.data ? styles.inputError : ''
                }`}
              />
              {fieldErrors.data && (
                <span className={styles.fieldError}>
                  {fieldErrors.data}
                </span>
              )}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Horário desejado</span>
              <input
                type="time"
                value={hora}
                onChange={(event) => {
                  setHora(event.target.value);
                  setFieldErrors((atual) => ({
                    ...atual,
                    hora: undefined,
                  }));
                }}
                className={`${styles.input} ${
                  fieldErrors.hora ? styles.inputError : ''
                }`}
              />
              {fieldErrors.hora && (
                <span className={styles.fieldError}>
                  {fieldErrors.hora}
                </span>
              )}
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>Serviço desejado</span>
            <select
              value={servicoId}
              disabled={servicos.length === 0}
              onChange={(event) => {
                setServicoId(event.target.value);
                setFieldErrors((atual) => ({
                  ...atual,
                  servicoId: undefined,
                }));
              }}
              className={`${styles.input} ${
                fieldErrors.servicoId ? styles.inputError : ''
              }`}
            >
              <option value="">
                {servicos.length === 0
                  ? 'Nenhum servico cadastrado'
                  : 'Selecione um serviço'}
              </option>
              {servicos.map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome || servico.tipo || `Serviço ${servico.id}`}
                </option>
              ))}
            </select>
            {fieldErrors.servicoId && (
              <span className={styles.fieldError}>
                {fieldErrors.servicoId}
              </span>
            )}
          </label>

          {servicoSelecionado && (
            <div className={styles.servicePreview}>
              <div>
                <span className={styles.previewLabel}>
                  Serviço escolhido
                </span>
                <strong>
                  {texto(servicoSelecionado.nome || servicoSelecionado.tipo)}
                </strong>
                {servicoSelecionado.descricao && (
                  <p>{servicoSelecionado.descricao}</p>
                )}
              </div>
              {formatarMoeda(servicoSelecionado.valor) && (
                <span className={styles.price}>
                  {formatarMoeda(servicoSelecionado.valor)}
                </span>
              )}
            </div>
          )}

          <label className={styles.field}>
            <span className={styles.label}>O que você precisa?</span>
            <textarea
              value={observacao}
              maxLength={500}
              onChange={(event) => {
                setObservacao(event.target.value);
                setFieldErrors((atual) => ({
                  ...atual,
                  observacao: undefined,
                }));
              }}
              className={`${styles.textarea} ${
                fieldErrors.observacao ? styles.inputError : ''
              }`}
              placeholder="Descreva o atendimento desejado"
            />
            <div className={styles.helperRow}>
              {fieldErrors.observacao ? (
                <span className={styles.fieldError}>
                  {fieldErrors.observacao}
                </span>
              ) : (
                <span>
                  Informe o cuidado necessário, local, restrições ou outros
                  detalhes importantes.
                </span>
              )}
              <span>{observacao.trim().length}/500</span>
            </div>
          </label>

          {erro && <p className={styles.errorBox}>{erro}</p>}
          {sucesso && <p className={styles.successBox}>{sucesso}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={styles.secondaryButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || servicos.length === 0}
              className={styles.primaryButton}
            >
              {loading ? 'Enviando...' : 'Enviar pedido'}
            </button>
          </div>

          {loading && <Carregando mensagem="Enviando seu pedido..." />}
        </form>
      </section>
  );

  if (presentation === 'inline') {
    return content;
  }

  return (
    <div className={styles.overlay}>
      {content}
    </div>
  );
}
