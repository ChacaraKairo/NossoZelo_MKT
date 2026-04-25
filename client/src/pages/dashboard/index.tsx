import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import HeaderMain from '@/components/header/HeaderMain';
import Footer from '@/components/footer/Footer';
import Carregando from '@/components/common/Carregando';
import ErroComRetry from '@/components/common/ErroComRetry';
import EstadoVazio from '@/components/common/EstadoVazio';
import AlertaPerfilIncompleto from '@/components/perfil/AlertaPerfilIncompleto';
import AbaAgendaPro from '@/components/perfil/AbaAgendaPro';
import AbaAvaliacoesPro from '@/components/perfil/AbaAvaliacoesPro';
import { useMeuPerfil } from '@/hooks/useMeuPerfil';
import { ContratacaoPerfil } from '@/types/perfil';
import { withAuth } from '@/utils/withAuth';
import logger from '@/utils/logger';

const CONTEXTO = 'DashboardPage';

function CardResumo({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5">
      <p className="text-xs font-bold uppercase text-slate-400">{titulo}</p>
      <p className="mt-2 text-2xl font-black text-slate-800">{valor}</p>
    </div>
  );
}

function ListaContratacoes({
  contratacoes,
}: {
  contratacoes: ContratacaoPerfil[];
}) {
  if (contratacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Nenhuma contratação recente."
        descricao="Quando houver contratações reais, elas aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      {contratacoes.slice(0, 5).map((contratacao) => (
        <article
          key={contratacao.id}
          className="rounded-xl border border-slate-100 bg-white p-4"
        >
          <p className="font-bold text-slate-800">
            Contratação #{contratacao.id}
          </p>
          <p className="text-sm text-slate-500">
            Status: {contratacao.status || 'Não informado'}
          </p>
        </article>
      ))}
    </div>
  );
}

function DashboardPage() {
  const router = useRouter();
  const {
    perfil,
    loading,
    error,
    recarregarPerfil,
    isCliente,
    isPrestador,
    tipoUsuario,
  } = useMeuPerfil();

  useEffect(() => {
    logger.info(CONTEXTO, 'Carregamento do dashboard');
  }, []);

  useEffect(() => {
    if (!tipoUsuario) return;
    logger.info(CONTEXTO, 'Tipo detectado', { tipoUsuario });
  }, [tipoUsuario]);

  if (loading) {
    return (
      <div>
        <HeaderMain />
        <main className="mx-auto max-w-6xl px-5 py-12">
          <Carregando mensagem="Carregando dashboard..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !perfil) {
    logger.error(CONTEXTO, 'Erros no dashboard', { error });
    return (
      <div>
        <HeaderMain />
        <main className="mx-auto max-w-6xl px-5 py-12">
          <ErroComRetry
            titulo="Não foi possível carregar o dashboard"
            mensagem="Tente novamente para buscar seus dados atualizados."
            detalhes={error || 'Perfil não encontrado.'}
            onRetry={recarregarPerfil}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const contratacoesCliente =
    perfil.contratacoes_contratacoes_cliente_idTousuarios ||
    perfil.contratacoes ||
    [];
  const contratacoesPrestador =
    perfil.contratacoes_contratacoes_prestador_idTousuarios ||
    perfil.contratacoes ||
    [];
  const pendentes = contratacoesPrestador.filter(
    (contratacao) => contratacao.status === 'pendente',
  );

  if (isPrestador) {
    logger.info(CONTEXTO, 'Blocos renderizados', {
      tipo: 'prestador',
      pendentes: pendentes.length,
    });
  }

  if (isCliente) {
    logger.info(CONTEXTO, 'Blocos renderizados', {
      tipo: 'cliente',
      contratacoes: contratacoesCliente.length,
    });
  }

  return (
    <div>
      <HeaderMain />
      <main className="mx-auto max-w-6xl space-y-8 px-5 py-12">
        <header>
          <h1 className="text-3xl font-black text-slate-800">Dashboard</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Dados carregados do seu perfil real.
          </p>
        </header>

        {isCliente && (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <Link
                href="/prestadores"
                className="rounded-xl border border-teal-100 bg-teal-50 p-5 font-black text-teal-800"
              >
                Buscar prestadores
              </Link>
              <CardResumo
                titulo="Contratações"
                valor={contratacoesCliente.length}
              />
              <CardResumo titulo="Avaliações pendentes" valor="-" />
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-800">
                Contratações recentes
              </h2>
              <ListaContratacoes contratacoes={contratacoesCliente} />
            </section>
          </>
        )}

        {isPrestador && (
          <>
            <AlertaPerfilIncompleto
              perfil={perfil}
              tipoUsuario={tipoUsuario}
              onCompletarPerfil={() => {
                logger.info(CONTEXTO, 'Clique no alerta do dashboard');
                router.push('/perfil');
              }}
            />

            <section className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-amber-900">
                    Solicitações pendentes
                    <span className="ml-2 rounded-full bg-amber-600 px-2 py-0.5 text-sm text-white">
                      {pendentes.length}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-amber-800">
                    Telegram/email devem ser disparados no backend após mudança de status da contratação.
                  </p>
                </div>
                <Link
                  href="/perfil?aba=solicitacoes"
                  onClick={() =>
                    logger.info(CONTEXTO, 'Clique no alerta', {
                      pendentes: pendentes.length,
                    })
                  }
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white"
                >
                  Ver solicitações
                </Link>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <CardResumo titulo="Pendentes" valor={pendentes.length} />
              <CardResumo
                titulo="Contratações"
                valor={contratacoesPrestador.length}
              />
              <CardResumo
                titulo="Avaliação média"
                valor={perfil.avaliacao_media || 'Não informado'}
              />
            </section>

            <AbaAgendaPro perfil={perfil} />
            <AbaAvaliacoesPro perfil={perfil} />
          </>
        )}

        {!isCliente && !isPrestador && (
          <EstadoVazio
            titulo="Tipo de usuário não reconhecido."
            descricao="Não foi possível decidir quais blocos do dashboard exibir."
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default withAuth(DashboardPage);
