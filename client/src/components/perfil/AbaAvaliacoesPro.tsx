import { useEffect } from 'react';
import { FaRegStar, FaStar, FaUserCircle } from 'react-icons/fa';
import EstadoVazio from '@/components/common/EstadoVazio';
import { AvaliacaoPerfil, PerfilUsuario } from '@/types/perfil';
import logger from '@/utils/logger';

interface AbaAvaliacoesProProps {
  perfil: PerfilUsuario;
}

const CONTEXTO = 'AbaAvaliacoesPro';

function obterAvaliacoes(perfil: PerfilUsuario) {
  return (
    perfil.avaliacoes_recebidas ||
    perfil.avaliacoes_avaliacoes_prestador_idTousuarios ||
    []
  );
}

function formatarData(valor?: string | Date | null) {
  if (!valor) return 'Não informado';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Não informado';

  return data.toLocaleDateString('pt-BR');
}

function renderEstrelas(nota: number | null) {
  const notaSegura = Math.max(0, Math.min(5, Number(nota) || 0));

  return Array.from({ length: 5 }, (_, index) =>
    index < notaSegura ? (
      <FaStar key={index} className="text-amber-400" />
    ) : (
      <FaRegStar key={index} className="text-slate-200" />
    ),
  );
}

function obterCliente(avaliacao: AvaliacaoPerfil) {
  return (
    avaliacao.cliente ||
    avaliacao.usuarios_avaliacoes_cliente_idTousuarios
  );
}

export default function AbaAvaliacoesPro({
  perfil,
}: AbaAvaliacoesProProps) {
  const avaliacoes = obterAvaliacoes(perfil);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderização da aba de avaliações', {
      perfilId: perfil.dados_usuario?.id || perfil.id,
    });
    logger.info(CONTEXTO, 'Quantidade de avaliações', {
      total: avaliacoes.length,
    });
  }, [perfil, avaliacoes.length]);

  try {
    if (avaliacoes.length === 0) {
      return (
        <EstadoVazio
          titulo="Você ainda não recebeu avaliações."
          descricao="Quando um cliente avaliar seu atendimento, o feedback aparecerá aqui."
        />
      );
    }

    return (
      <section className="space-y-5">
        <header>
          <h2 className="text-xl font-black text-slate-800">
            Avaliações recebidas
          </h2>
          <p className="text-sm text-slate-500">
            Feedbacks reais enviados pelos clientes.
          </p>
        </header>

        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => {
            const cliente = obterCliente(avaliacao);
            const nomeCliente =
              cliente?.nome || 'Cliente não identificado';
            const fotoCliente = cliente?.url_foto_perfil;

            return (
              <article
                key={avaliacao.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {fotoCliente ? (
                      <img
                        src={fotoCliente}
                        alt={nomeCliente}
                        className="h-11 w-11 rounded-full border border-slate-100 object-cover"
                      />
                    ) : (
                      <FaUserCircle className="h-11 w-11 text-slate-200" />
                    )}
                    <div>
                      <p className="font-bold text-slate-800">
                        {nomeCliente}
                      </p>
                      <p className="text-xs font-semibold text-slate-400">
                        {formatarData(avaliacao.data_avaliacao)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-0.5 text-sm">
                    {renderEstrelas(avaliacao.nota)}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {avaliacao.comentario ||
                    'Comentário não informado.'}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    );
  } catch (error) {
    logger.error(
      CONTEXTO,
      'Erro ao carregar avaliações',
      error,
    );

    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center">
        <p className="font-bold text-red-700">
          Não foi possível exibir as avaliações.
        </p>
      </div>
    );
  }
}
