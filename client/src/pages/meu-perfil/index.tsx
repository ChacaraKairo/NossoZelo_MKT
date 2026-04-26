/**
 * @author DevHelper & Sócio
 * @description Dashboard "Clean Slate" consolidado com arquitetura Pro.
 * Integração de Header, Navegação Vertical, Widgets de Métricas e Conteúdo Dinâmico.
 */

import React, { useEffect, useState } from 'react';
import { withAuth } from '@/utils/withAuth';
import { perfilService } from '@/service/perfilService';
import HeaderMain from '@/components/header/HeaderMain';
import Footer from '@/components/footer/Footer';
import ErroComRetry from '@/components/common/ErroComRetry';

// Estilização Modular
import styles from '@/styles/Perfil.module.css';

// Tipagem Estrita
import { PerfilCompleto } from '@/components/perfil/types/types';

// Componentes de Identidade e Navegação (Coluna 1)
import HeaderPro from '@/components/perfil/HeaderPro';
import PerfilTabsVertical from '@/components/perfil/PerfilTabsVertical';

// Componentes de Métricas (Coluna 3)
import PerfilStatsWidgets from '@/components/perfil/PerfilStatsWidgets';

// Componentes de Conteúdo Dinâmico (Coluna 2 - Abas)
import AbaSobrePro from '@/components/perfil/Abas/AbaSobrePro';
import AbaAgendaPro from '@/components/perfil/Abas/AbaAgendaPro';
import AbaServicosPro from '@/components/perfil/Abas/AbaServicosPro';
import AbaAvaliacoesPro from '@/components/perfil/Abas/AbaAvaliacoesPro'; // 🚀 Nova Importação
import AbaSolicitacoesPro from '@/components/perfil/AbaSolicitacoesPro';

function normalizarPerfilDashboard(dados: any): PerfilCompleto {
  const usuario = dados?.dados_usuario || {};
  const profissional = dados?.dados_profissionais || {};

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
      console.log(
        '[LOG-FLUXO] Dashboard: Iniciando carga de dados.',
      );
      const dados = await perfilService.obterMeuPerfil();
      setPerfil(normalizarPerfilDashboard(dados));
    } catch (err: any) {
      console.error(
        '[ERRO-FLUXO] Falha na carga do dashboard:',
        err.message,
      );
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
        <div className="flex items-center justify-center h-screen text-slate-500 font-bold animate-pulse">
          Sincronizando seu painel de controle...
        </div>
      </div>
    );
  }

  // Fallback de segurança caso o perfil não carregue
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
          {/* COLUNA 1: IDENTIDADE & NAVEGAÇÃO VERTICAL */}
          <aside
            className={`${styles.leftColumn} ${styles.stickySidebar} space-y-6`}
          >
            <HeaderPro perfil={perfil} />
            <PerfilTabsVertical
              ativa={abaAtiva}
              setAtiva={setAbaAtiva}
              perfil={perfil}
            />
          </aside>

          {/* COLUNA 2: ÁREA DE TRABALHO CENTRAL (CONTEÚDO DINÂMICO) */}
          <section className={styles.centerColumn}>
            <div className={`${styles.card} min-h-[650px]`}>
              <header className="mb-8 border-b border-slate-50 pb-4">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Painel de{' '}
                  {perfil.tipo === 'cliente'
                    ? 'Cliente'
                    : 'Gestão'}
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  Bem-vindo de volta,{' '}
                  <span className="text-blue-600">
                    {primeiroNome}
                  </span>
                  .
                </p>
              </header>

              {/* Renderização Dinâmica de Abas */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {abaAtiva === 'sobre' && (
                  <AbaSobrePro
                    perfil={perfil}
                    setPerfil={setPerfilCompat}
                  />
                )}
                {abaAtiva === 'agenda' && (
                  <AbaAgendaPro perfil={perfil} />
                )}
                {abaAtiva === 'servicos' && (
                  <AbaServicosPro perfil={perfil} />
                )}
                {abaAtiva === 'solicitacoes' && (
                  <AbaSolicitacoesPro
                    perfil={perfil}
                    onContratacaoAtualizada={() =>
                      carregarDadosDashboard()
                    }
                  />
                )}
                {abaAtiva === 'avaliacoes' && (
                  <AbaAvaliacoesPro perfil={perfil} />
                )}

                {/* Fallback para segurança */}
                {abaAtiva === 'seguranca' && (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                      Módulo de Segurança em Breve
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* COLUNA 3: WIDGETS E MÉTRICAS LATERAIS */}
          <aside
            className={`${styles.rightColumn} ${styles.stickySidebar}`}
          >
            <PerfilStatsWidgets
              perfil={perfil}
              setAtiva={setAbaAtiva} // 🎯 Permite que os widgets troquem a aba central
            />

            <div className="mt-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg shadow-blue-100 hidden lg:block">
              <p className="text-white font-bold text-sm mb-2">
                Dica de Performance
              </p>
              <p className="text-blue-100 text-[11px] leading-relaxed">
                Perfis com fotos profissionais e descrições
                detalhadas recebem até{' '}
                <strong>4x mais visualizações</strong>.
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
