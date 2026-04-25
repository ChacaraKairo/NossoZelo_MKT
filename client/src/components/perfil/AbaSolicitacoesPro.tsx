import { useEffect, useState } from 'react';
import DadosClienteLiberado from '@/components/perfil/DadosClienteLiberado';
import EstadoVazio from '@/components/common/EstadoVazio';
import { contratacaoService } from '@/service/contratacaoService';
import { ContratacaoPerfil, PerfilUsuario } from '@/types/perfil';
import { extrairMensagemErro } from '@/utils/tratarErroApi';
import logger from '@/utils/logger';

interface AbaSolicitacoesProProps {
  perfil: PerfilUsuario;
  onContratacaoAtualizada?: (
    contratacao: ContratacaoPerfil,
  ) => void;
}

const CONTEXTO = 'AbaSolicitacoesPro';

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

function nomeCliente(contratacao: ContratacaoPerfil) {
  return (
    contratacao.usuarios_contratacoes_cliente_idTousuarios?.nome ||
    'Cliente não informado'
  );
}

function nomeServico(contratacao: ContratacaoPerfil) {
  return (
    contratacao.servico?.nome ||
    contratacao.servicos?.nome ||
    (contratacao.servico_id
      ? `Serviço #${contratacao.servico_id}`
      : 'Serviço não informado')
  );
}

export default function AbaSolicitacoesPro({
  perfil,
  onContratacaoAtualizada,
}: AbaSolicitacoesProProps) {
  const solicitacoes =
    perfil.contratacoes_contratacoes_prestador_idTousuarios ||
    perfil.contratacoes ||
    [];
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [clienteContatoAberto, setClienteContatoAberto] = useState<
    string | null
  >(null);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderização da aba', {
      perfilId: perfil.dados_usuario?.id || perfil.id,
    });
    logger.info(CONTEXTO, 'Quantidade de solicitações', {
      total: solicitacoes.length,
    });
  }, [perfil, solicitacoes.length]);

  const executarAcao = async (
    tipoAcao: 'aceitar' | 'negar',
    contratacao: ContratacaoPerfil,
  ) => {
    const statusEnviado = tipoAcao === 'aceitar' ? 'confirmado' : 'cancelado';

    logger.info(CONTEXTO, `Clique em ${tipoAcao}`, {
      contratacaoId: contratacao.id,
    });
    logger.info(CONTEXTO, 'Ação escolhida', {
      contratacaoId: contratacao.id,
      acao: tipoAcao,
      statusEnviado,
    });

    setErroAcao(null);
    setProcessandoId(contratacao.id);

    try {
      // TODO técnico: o frontend apenas chama aceitar/negar; email/Telegram devem ser disparados no backend após mudança de status.
      const resultado =
        tipoAcao === 'aceitar'
          ? await contratacaoService.atualizarStatusContratacao(
              contratacao.id,
              statusEnviado,
            )
          : await contratacaoService.atualizarStatusContratacao(
              contratacao.id,
              statusEnviado,
            );

      logger.info(CONTEXTO, `Sucesso ao ${tipoAcao}`, {
        contratacaoId: contratacao.id,
        statusEnviado,
      });
      onContratacaoAtualizada?.(resultado);
    } catch (error: unknown) {
      const mensagem = extrairMensagemErro(error);
      logger.error(CONTEXTO, `Falha ao ${tipoAcao}`, {
        contratacaoId: contratacao.id,
        statusEnviado,
        mensagem,
      });
      setErroAcao(mensagem);
    } finally {
      setProcessandoId(null);
    }
  };

  if (solicitacoes.length === 0) {
    return (
      <section className="space-y-5">
        <header>
          <h2 className="text-xl font-black text-slate-800">Solicitações</h2>
          <p className="text-sm text-slate-500">
            Contratações recebidas pelos clientes.
          </p>
        </header>
        <EstadoVazio
          titulo="Você ainda não recebeu solicitações."
          descricao="Quando um cliente solicitar seu serviço, ele aparecerá aqui."
        />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-xl font-black text-slate-800">Solicitações</h2>
        <p className="text-sm text-slate-500">
          Contratações recebidas pelos clientes.
        </p>
      </header>

      {erroAcao && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {erroAcao}
        </div>
      )}

      <div className="space-y-3">
        {solicitacoes.map((contratacao) => {
          const pendente = contratacao.status === 'pendente';
          const contatoPodeSerConsultado = [
            'confirmado',
            'aceito',
            'concluido',
            'concluida',
          ].includes(String(contratacao.status));
          const processando = processandoId === contratacao.id;

          return (
            <article
              key={contratacao.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-bold text-slate-800">
                    {nomeCliente(contratacao)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Serviço: {nomeServico(contratacao)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Data: {formatarData(contratacao.data)}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    Status: {texto(contratacao.status)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pendente && (
                    <>
                      <button
                        type="button"
                        disabled={processando}
                        onClick={() => executarAcao('aceitar', contratacao)}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                      >
                        {processando ? 'Processando...' : 'Aceitar'}
                      </button>
                      <button
                        type="button"
                        disabled={processando}
                        onClick={() => executarAcao('negar', contratacao)}
                        className="rounded-lg border border-red-100 px-4 py-2 text-sm font-bold text-red-600 disabled:opacity-60"
                      >
                        Negar
                      </button>
                    </>
                  )}

                  {contatoPodeSerConsultado && (
                    <button
                      type="button"
                      onClick={() =>
                        setClienteContatoAberto((atual) =>
                          atual === contratacao.cliente_id
                            ? null
                            : contratacao.cliente_id,
                        )
                      }
                      className="rounded-lg border border-teal-100 px-4 py-2 text-sm font-bold text-teal-700"
                    >
                      Ver contato
                    </button>
                  )}
                </div>
              </div>

              {clienteContatoAberto === contratacao.cliente_id && (
                <DadosClienteLiberado
                  clienteId={contratacao.cliente_id}
                  isPrestador
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
