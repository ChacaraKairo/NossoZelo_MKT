import React, { useEffect, useState } from 'react';
import { withAuth } from '@/utils/withAuth';
import { perfilService } from '@/service/perfilService';
import HeaderMain from '@/components/header/HeaderMain';
import Footer from '@/components/footer/Footer';
import ErroComRetry from '@/components/common/ErroComRetry';
import styles from '@/styles/Perfil.module.css';
import { PerfilCompleto } from '@/components/perfil/types/types';
import HeaderPro from '@/components/perfil/HeaderPro';
import PerfilTabsVertical from '@/components/perfil/PerfilTabsVertical';
import PerfilStatsWidgets from '@/components/perfil/PerfilStatsWidgets';
import AbaSobrePro from '@/components/perfil/Abas/AbaSobrePro';
import AbaAgendaPro from '@/components/perfil/Abas/AbaAgendaPro';
import AbaServicosPro from '@/components/perfil/Abas/AbaServicosPro';
import AbaAvaliacoesPro from '@/components/perfil/Abas/AbaAvaliacoesPro';
import AbaSolicitacoesPro from '@/components/perfil/AbaSolicitacoesPro';
import AbaHistoricoPerfil from '@/components/perfil/AbaHistoricoPerfil';
import AbaSeguranca from '@/components/perfil/AbaSeguranca';

function normalizarPerfilDashboard(dados: any): PerfilCompleto {
  const usuario = dados?.dados_usuario || {};
  const profissional = dados?.dados_profissionais || {};
  const contratacoes =
    dados?.contratacoes ||
    dados?.contratacoes_contratacoes_prestador_idTousuarios ||
    dados?.contratacoes_contratacoes_cliente_idTousuarios ||
    [];
  const contratacoesNormalizadas = Array.isArray(contratacoes)
    ? contratacoes.map((contratacao: any) => ({
        ...contratacao,
        status: contratacao?.status ?? null,
      }))
    : [];

  return {
    ...dados,
    ...usuario,
    ...profissional,
    id: usuario.id || dados?.id || '',
    nome: usuario.nome || dados?.nome || 'Usuário',
    email: usuario.email || dados?.email || '',
    tipo:
      usuario.tipo ||
      dados?.perfil_tipo ||
      dados?.tipo ||
      'cliente',
    telefone: usuario.telefone || dados?.telefone,
    endereco: usuario.endereco || dados?.endereco,
    bairro: usuario.bairro || dados?.bairro,
    cidade: usuario.cidade || dados?.cidade,
    estado: usuario.estado || dados?.estado,
    url_foto_perfil:
      usuario.url_foto_perfil || dados?.url_foto_perfil,
    avaliacao_media:
      Number(usuario.avaliacao_media || dados?.avaliacao_media) ||
      0,
    servicos: dados?.servicos || [],
    agenda: dados?.agenda || [],
    avaliacoes_avaliacoes_prestador_idTousuarios:
      dados?.avaliacoes_avaliacoes_prestador_idTousuarios ||
      dados?.avaliacoes_recebidas ||
      [],
    contratacoes: contratacoesNormalizadas,
    contratacoes_contratacoes_prestador_idTousuarios:
      dados?.contratacoes_contratacoes_prestador_idTousuarios ||
      contratacoesNormalizadas,
    contratacoes_contratacoes_cliente_idTousuarios:
      dados?.contratacoes_contratacoes_cliente_idTousuarios ||
      contratacoesNormalizadas,
    avaliacoes_feitas: dados?.avaliacoes_feitas || [],
    bio: profissional.bio || dados?.bio,
    anos_experiencia:
      profissional.anos_experiencia || dados?.anos_experiencia,
    coren: profissional.coren || dados?.coren,
  } as PerfilCompleto;
}

const DashboardPerfil = () => {
  const [perfil, setPerfil] =
    useState<PerfilCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState('sobre');

  const carregarDadosDashboard = async () => {
    try {
      setLoading(true);
      setErro(null);
      const dados = await perfilService.obterMeuPerfil();
      setPerfil(normalizarPerfilDashboard(dados));
    } catch (err: any) {
      setErro(
        err.message || 'Não foi possível carregar seu perfil.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosDashboard();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          Sincronizando seu painel de controle...
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className={styles.container}>
        <HeaderMain />
        <main className={styles.mainContent}>
          <ErroComRetry
            titulo="Não foi possível carregar o perfil"
            mensagem="Tente novamente para sincronizar seus dados com o servidor."
            detalhes={erro}
            onRetry={carregarDadosDashboard}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!perfil) return null;

  const primeiroNome = perfil.nome?.split(' ')[0] || 'usuário';
  const setPerfilCompat: React.Dispatch<
    React.SetStateAction<PerfilCompleto | null>
  > = (valor) => {
    setPerfil((perfilAtual) => {
      const proximoValor =
        typeof valor === 'function'
          ? valor(perfilAtual)
          : valor;

      return proximoValor
        ? normalizarPerfilDashboard(proximoValor)
        : null;
    });
  };

  return (
    <div className={styles.container}>
      <HeaderMain />

      <main className={styles.mainContent}>
        <div className={styles.dashboardGrid}>
          <aside
            className={`${styles.leftColumn} ${styles.stickySidebar} ${styles.stack}`}
          >
            <HeaderPro perfil={perfil} />
            <PerfilTabsVertical
              ativa={abaAtiva}
              setAtiva={setAbaAtiva}
              perfil={perfil}
            />
          </aside>

          <section className={styles.centerColumn}>
            <div className={`${styles.card} ${styles.profileCard}`}>
              <header className={styles.contentHeader}>
                <h2 className={styles.contentTitle}>
                  Bem-vindo ao Nosso Zelo
                </h2>
                <p className={styles.contentSubtitle}>
                  Olá,{' '}
                  <span className={styles.highlightName}>
                    {primeiroNome}
                  </span>
                  . Gerencie seus dados, agenda e solicitações.
                </p>
              </header>

              <div className={styles.tabContent}>
                {abaAtiva === 'sobre' && (
                  <AbaSobrePro
                    perfil={perfil}
                    setPerfil={setPerfilCompat}
                  />
                )}
                {abaAtiva === 'agenda' && (
                  <AbaAgendaPro perfil={perfil as any} />
                )}
                {abaAtiva === 'servicos' && (
                  <AbaServicosPro perfil={perfil as any} />
                )}
                {abaAtiva === 'solicitacoes' && (
                  <AbaSolicitacoesPro
                    perfil={perfil as any}
                    onContratacaoAtualizada={carregarDadosDashboard as any}
                  />
                )}
                {abaAtiva === 'avaliacoes' && (
                  <AbaAvaliacoesPro perfil={perfil as any} />
                )}
                {abaAtiva === 'historico' && (
                  <AbaHistoricoPerfil
                    contratacoes={(perfil as any).contratacoes || []}
                    modo={
                      perfil.tipo === 'cliente' ? 'cliente' : 'prestador'
                    }
                  />
                )}
                {abaAtiva === 'seguranca' && <AbaSeguranca />}
              </div>
            </div>
          </section>

          <aside
            className={`${styles.rightColumn} ${styles.stickySidebar}`}
          >
            <PerfilStatsWidgets
              perfil={perfil}
              setAtiva={setAbaAtiva}
            />

            <div className={styles.performanceTip}>
              <p className={styles.performanceTipTitle}>
                Dica de Performance
              </p>
              <p className={styles.performanceTipText}>
                Perfis com fotos profissionais e descrições detalhadas
                recebem até <strong>4x mais visualizações</strong>.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default withAuth(DashboardPerfil);
