import { useMemo, useState } from 'react';
import EstadoVazio from '@/components/common/EstadoVazio';
import avaliacaoService from '@/service/avaliacaoService';
import { ContratacaoPerfil } from '@/types/perfil';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from './styles/PerfilOperacional.module.css';

interface AbaHistoricoPerfilProps {
  contratacoes: ContratacaoPerfil[];
  modo: 'cliente' | 'prestador';
  onAvaliacaoRegistrada?: () => void;
}

type FormAvaliacao = {
  nota: number;
  comentario: string;
};

function texto(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }
  return String(valor);
}

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'Não informado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return texto(valor);
  return data.toLocaleDateString('pt-BR');
}

function nomeRelacionado(
  contratacao: ContratacaoPerfil,
  modo: 'cliente' | 'prestador',
) {
  if (modo === 'cliente') {
    return (
      contratacao.usuarios_contratacoes_prestador_idTousuarios?.nome ||
      'Prestador não informado'
    );
  }

  return (
    contratacao.usuarios_contratacoes_cliente_idTousuarios?.nome ||
    'Cliente não informado'
  );
}

function servico(contratacao: ContratacaoPerfil) {
  return (
    contratacao.servico?.nome ||
    contratacao.servicos?.nome ||
    (contratacao.servico_id
      ? `Serviço #${contratacao.servico_id}`
      : 'Serviço não informado')
  );
}

function statusNormalizado(contratacao: ContratacaoPerfil) {
  return String(contratacao.status || '')
    .trim()
    .toLowerCase();
}

function contratacaoConcluida(contratacao: ContratacaoPerfil) {
  const status = statusNormalizado(contratacao);
  return (
    status === 'concluido' ||
    status === 'concluida' ||
    status === 'finalizado' ||
    status === 'finalizada'
  );
}

function contratacaoJaAvaliada(
  contratacao: ContratacaoPerfil,
) {
  return Boolean(contratacao.avaliacao?.id);
}

function podeAvaliar(
  contratacao: ContratacaoPerfil,
  modo: 'cliente' | 'prestador',
) {
  return (
    modo === 'cliente' &&
    contratacaoConcluida(contratacao) &&
    !contratacaoJaAvaliada(contratacao)
  );
}

function renderEstrelas(
  contratacao: ContratacaoPerfil,
  formularios: Record<number, FormAvaliacao>,
  onNotaChange: (contratacaoId: number, nota: number) => void,
) {
  const notaAtual = formularios[contratacao.id]?.nota || 5;

  return (
    <div className={styles.ratingGroup} aria-label="Nota">
      {[1, 2, 3, 4, 5].map((nota) => (
        <button
          key={nota}
          type="button"
          className={`${styles.starButton} ${
            nota <= notaAtual ? styles.starButtonActive : ''
          }`}
          onClick={() => onNotaChange(contratacao.id, nota)}
          aria-label={`${nota} estrela${nota > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function AbaHistoricoPerfil({
  contratacoes,
  modo,
  onAvaliacaoRegistrada,
}: AbaHistoricoPerfilProps) {
  const [formularios, setFormularios] = useState<
    Record<number, FormAvaliacao>
  >({});
  const [enviandoId, setEnviandoId] = useState<number | null>(
    null,
  );
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const atualizarFormulario = (
    contratacaoId: number,
    dados: Partial<FormAvaliacao>,
  ) => {
    setFormularios((atual) => ({
      ...atual,
      [contratacaoId]: {
        nota: atual[contratacaoId]?.nota || 5,
        comentario: atual[contratacaoId]?.comentario || '',
        ...dados,
      },
    }));
  };

  const contratacoesElegiveis = useMemo(
    () =>
      contratacoes.reduce<Record<number, FormAvaliacao>>(
        (acumulado, contratacao) => {
          if (!podeAvaliar(contratacao, modo)) return acumulado;

          acumulado[contratacao.id] = {
            nota: formularios[contratacao.id]?.nota || 5,
            comentario:
              formularios[contratacao.id]?.comentario || '',
          };

          return acumulado;
        },
        {},
      ),
    [contratacoes, formularios, modo],
  );

  const enviarAvaliacao = async (
    contratacao: ContratacaoPerfil,
  ) => {
    const formulario = formularios[contratacao.id] || {
      nota: 5,
      comentario: '',
    };

    if (!contratacao.prestador_id) {
      setErro('Prestador nao identificado para esta contratacao.');
      return;
    }

    setEnviandoId(contratacao.id);
    setErro(null);
    setSucesso(null);

    try {
      await avaliacaoService.registrarAvaliacao({
        contratacao_id: contratacao.id,
        prestador_id: contratacao.prestador_id,
        tipo_prestador: contratacao.tipo_prestador || undefined,
        nota: formulario.nota,
        comentario: formulario.comentario.trim() || undefined,
      });

      setSucesso('Avaliacao registrada com sucesso.');
      onAvaliacaoRegistrada?.();
    } catch (error: unknown) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEnviandoId(null);
    }
  };

  if (contratacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Histórico vazio."
        descricao={
          modo === 'cliente'
            ? 'Quando você solicitar atendimentos, eles aparecerão aqui.'
            : 'Quando clientes solicitarem ou concluírem atendimentos, eles aparecerão aqui.'
        }
      />
    );
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Histórico</h2>
          <p className={styles.subtitle}>
            Serviços passados, ativos e solicitações em andamento.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {erro && <div className={styles.error}>{erro}</div>}
        {sucesso && <div className={styles.success}>{sucesso}</div>}

        {contratacoes.map((contratacao) => (
          <article key={contratacao.id} className={styles.card}>
            <h3 className={styles.cardTitle}>
              {nomeRelacionado(contratacao, modo)}
            </h3>
            <p className={styles.muted}>{servico(contratacao)}</p>
            <div className={styles.meta}>
              <span className={styles.badge}>
                {texto(contratacao.status)}
              </span>
              <span className={styles.badge}>
                {formatarData(contratacao.data)}
              </span>
              {contratacaoJaAvaliada(contratacao) && (
                <span className={styles.badgeSuccess}>
                  Nota {contratacao.avaliacao.nota ?? '-'}
                </span>
              )}
            </div>

            {modo === 'cliente' &&
              !contratacaoConcluida(contratacao) && (
                <p className={styles.hint}>
                  A avaliacao fica disponivel apos a conclusao do atendimento.
                </p>
              )}

            {modo === 'cliente' && contratacaoJaAvaliada(contratacao) && (
              <p className={styles.hint}>
                Avaliacao enviada em{' '}
                {formatarData(contratacao.avaliacao.data_avaliacao)}.
              </p>
            )}

            {podeAvaliar(contratacao, modo) && (
                <div className={styles.inlineForm}>
                  <p className={styles.hint}>
                    Avalie este atendimento para registrar sua experiencia com o prestador.
                  </p>
                  <label className={styles.label}>Nota</label>
                  {renderEstrelas(
                    contratacao,
                    contratacoesElegiveis,
                    (contratacaoId, nota) =>
                      atualizarFormulario(contratacaoId, { nota }),
                  )}

                  <label className={styles.label}>
                    Comentario
                  </label>
                  <textarea
                    className={styles.textarea}
                    maxLength={500}
                    placeholder="Conte como foi o atendimento."
                    value={
                      formularios[contratacao.id]?.comentario || ''
                    }
                    onChange={(event) =>
                      atualizarFormulario(contratacao.id, {
                        comentario: event.target.value,
                      })
                    }
                  />

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      disabled={enviandoId === contratacao.id}
                      onClick={() => enviarAvaliacao(contratacao)}
                    >
                      {enviandoId === contratacao.id
                        ? 'Enviando...'
                        : 'Enviar avaliacao'}
                    </button>
                  </div>
                </div>
              )}
          </article>
        ))}
      </div>
    </section>
  );
}
