import { useMemo, useState } from 'react';
import EstadoVazio from '@/components/common/EstadoVazio';
import avaliacaoService from '@/service/avaliacaoService';
import contratacaoService from '@/service/contratacaoService';
import { AvaliacaoPerfil, ContratacaoPerfil } from '@/types/perfil';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import styles from '@/styles/components/perfil/PerfilOperacional.module.css';

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
    return 'Nao informado';
  }
  return String(valor);
}

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'Nao informado';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return texto(valor);
  return data.toLocaleDateString('pt-BR');
}

function formatarHora(valor?: string | Date | null) {
  if (!valor) return 'A combinar';
  const valorTexto = String(valor);
  const matchIso = valorTexto.match(/T(\d{2}:\d{2})/);
  const matchSimples = valorTexto.match(/^(\d{2}:\d{2})/);
  if (matchIso?.[1]) return matchIso[1];
  if (matchSimples?.[1]) return matchSimples[1];

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return texto(valor);
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarMoeda(valor?: string | number | null) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 'Valor nao informado';
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function nomeRelacionado(
  contratacao: ContratacaoPerfil,
  modo: 'cliente' | 'prestador',
) {
  if (modo === 'cliente') {
    return (
      contratacao.usuarios_contratacoes_prestador_idTousuarios?.nome ||
      'Profissional nao informado'
    );
  }

  return (
    contratacao.usuarios_contratacoes_cliente_idTousuarios?.nome ||
    'Cliente nao informado'
  );
}

function servico(contratacao: ContratacaoPerfil) {
  return (
    contratacao.servico?.nome ||
    contratacao.servicos?.nome ||
    (contratacao.servico_id
      ? `Servico ${contratacao.servico_id}`
      : 'Servico nao informado')
  );
}

function statusNormalizado(contratacao: ContratacaoPerfil) {
  return String(contratacao.status || '').trim().toLowerCase();
}

function dataHoraFim(contratacao: ContratacaoPerfil) {
  if (!contratacao.data || !contratacao.hora_fim) return null;
  const data = new Date(contratacao.data);
  const hora = new Date(contratacao.hora_fim);
  if (Number.isNaN(data.getTime()) || Number.isNaN(hora.getTime())) {
    return null;
  }
  const fim = new Date(data);
  fim.setUTCHours(hora.getUTCHours(), hora.getUTCMinutes(), 0, 0);
  return fim;
}

function avaliacaoDoUsuario(
  contratacao: ContratacaoPerfil,
  modo: 'cliente' | 'prestador',
): AvaliacaoPerfil | null {
  const tipo =
    modo === 'cliente'
      ? 'cliente_para_prestador'
      : 'prestador_para_cliente';
  return (
    contratacao.avaliacoes?.find(
      (avaliacao) => avaliacao.tipo_avaliacao === tipo,
    ) ||
    (contratacao.avaliacao?.tipo_avaliacao === tipo
      ? contratacao.avaliacao
      : null)
  );
}

function estadoAvaliacao(
  contratacao: ContratacaoPerfil,
  modo: 'cliente' | 'prestador',
) {
  const status = statusNormalizado(contratacao);
  const enviada = avaliacaoDoUsuario(contratacao, modo);
  if (enviada) return { pode: false, texto: 'Avaliacao enviada.' };
  if (status === 'cancelado') {
    return {
      pode: false,
      texto: 'Atendimento cancelado nao pode ser avaliado.',
    };
  }
  if (status === 'nao_realizado') {
    return {
      pode: false,
      texto: 'Atendimento nao realizado nao pode ser avaliado.',
    };
  }
  if (!['confirmado', 'concluido'].includes(status)) {
    return {
      pode: false,
      texto: 'A avaliacao fica disponivel apos o atendimento confirmado.',
    };
  }

  const fim = dataHoraFim(contratacao);
  if (!fim || new Date() <= fim) {
    return {
      pode: false,
      texto: 'A avaliacao ficara disponivel apos o horario final do atendimento.',
    };
  }

  return {
    pode: true,
    texto:
      modo === 'cliente'
        ? 'Disponivel para avaliar o profissional.'
        : 'Disponivel para avaliar o cliente.',
  };
}

function renderEstrelas(
  contratacao: ContratacaoPerfil,
  formulario: FormAvaliacao,
  onNotaChange: (contratacaoId: number, nota: number) => void,
) {
  return (
    <div className={styles.ratingGroup} aria-label="Nota">
      {[1, 2, 3, 4, 5].map((nota) => (
        <button
          key={nota}
          type="button"
          className={`${styles.starButton} ${
            nota <= formulario.nota ? styles.starButtonActive : ''
          }`}
          onClick={() => onNotaChange(contratacao.id, nota)}
          aria-label={`${nota} estrela${nota > 1 ? 's' : ''}`}
        >
          *
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
  const [enviandoId, setEnviandoId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const formulariosComPadrao = useMemo(() => {
    const mapa: Record<number, FormAvaliacao> = {};
    contratacoes.forEach((contratacao) => {
      mapa[contratacao.id] = formularios[contratacao.id] || {
        nota: 5,
        comentario: '',
      };
    });
    return mapa;
  }, [contratacoes, formularios]);

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

  const enviarAvaliacao = async (contratacao: ContratacaoPerfil) => {
    const formulario = formulariosComPadrao[contratacao.id];

    setEnviandoId(contratacao.id);
    setErro(null);
    setSucesso(null);

    try {
      await avaliacaoService.registrarAvaliacao({
        contratacao_id: contratacao.id,
        nota: formulario.nota,
        comentario: formulario.comentario.trim() || undefined,
      });

      setSucesso('Avaliacao enviada com sucesso.');
      onAvaliacaoRegistrada?.();
    } catch (error: unknown) {
      setErro(extrairMensagemErro(error));
    } finally {
      setEnviandoId(null);
    }
  };

  const cancelar = async (contratacao: ContratacaoPerfil) => {
    const motivo =
      window.prompt('Conte rapidamente o motivo do cancelamento.') || '';

    const avisoPagamento =
      'O NossoZelo nao processa o pagamento deste atendimento. Nenhuma multa sera cobrada pela plataforma. Caso algum valor tenha sido combinado diretamente entre cliente e prestador, a resolucao deve ser feita entre as partes.';

    if (!window.confirm(`${avisoPagamento}\n\nConfirmar cancelamento?`)) {
      return;
    }

    try {
      setErro(null);
      setSucesso(null);
      const resposta = await contratacaoService.cancelarContratacao(
        contratacao.id,
        motivo,
      );
      setSucesso(resposta.cancelamento.mensagem_usuario);
      onAvaliacaoRegistrada?.();
    } catch (error) {
      setErro(extrairMensagemErro(error));
    }
  };

  if (contratacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Historico vazio."
        descricao={
          modo === 'cliente'
            ? 'Quando voce solicitar atendimentos, eles aparecerao aqui.'
            : 'Quando clientes solicitarem ou concluirem atendimentos, eles aparecerao aqui.'
        }
      />
    );
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Historico</h2>
          <p className={styles.subtitle}>
            Pedidos, cancelamentos e avaliacoes.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        {erro && <div className={styles.error}>{erro}</div>}
        {sucesso && <div className={styles.success}>{sucesso}</div>}

        {contratacoes.map((contratacao) => {
          const avaliacao = avaliacaoDoUsuario(contratacao, modo);
          const estado = estadoAvaliacao(contratacao, modo);
          const podeCancelar = ![
            'cancelado',
            'concluido',
            'nao_realizado',
          ].includes(statusNormalizado(contratacao));
          const formulario = formulariosComPadrao[contratacao.id];

          return (
            <article key={contratacao.id} className={styles.card}>
              <h3 className={styles.cardTitle}>
                {nomeRelacionado(contratacao, modo)}
              </h3>
              <p className={styles.muted}>{servico(contratacao)}</p>
              <div className={styles.meta}>
                <span className={styles.badge}>
                  Situacao: {texto(contratacao.status)}
                </span>
                <span className={styles.badge}>
                  {formatarData(contratacao.data)} -{' '}
                  {formatarHora(contratacao.hora_inicio)} ate{' '}
                  {formatarHora(contratacao.hora_fim)}
                </span>
                <span className={styles.badge}>
                  Valor: {formatarMoeda(contratacao.preco)}
                </span>
                {avaliacao && (
                  <span className={styles.badgeSuccess}>
                    Nota enviada: {avaliacao.nota ?? '-'}
                  </span>
                )}
              </div>

              <p className={styles.hint}>{estado.texto}</p>
              {contratacao.motivo_cancelamento && (
                <p className={styles.hint}>
                  Motivo do cancelamento: {contratacao.motivo_cancelamento}
                </p>
              )}
              {contratacao.cancelamento_tardio && (
                <p className={styles.hint}>
                  Cancelamento proximo ao horario do atendimento.
                </p>
              )}

              {podeCancelar && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => cancelar(contratacao)}
                  >
                    Cancelar pedido
                  </button>
                </div>
              )}

              {estado.pode && (
                <div className={styles.inlineForm}>
                  <p className={styles.hint}>
                    {modo === 'cliente'
                      ? 'Avalie o profissional deste atendimento.'
                      : 'Avalie o cliente deste atendimento.'}
                  </p>
                  <label className={styles.label}>Nota</label>
                  {renderEstrelas(
                    contratacao,
                    formulario,
                    (contratacaoId, nota) =>
                      atualizarFormulario(contratacaoId, { nota }),
                  )}

                  <label className={styles.label}>Comentario</label>
                  <textarea
                    className={styles.textarea}
                    maxLength={500}
                    placeholder="Conte como foi a experiencia."
                    value={formulario.comentario}
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
                        : modo === 'cliente'
                          ? 'Avaliar prestador'
                          : 'Avaliar cliente'}
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
