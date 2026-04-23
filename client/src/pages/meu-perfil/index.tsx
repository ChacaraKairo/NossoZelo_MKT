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

// Estilização Modular
import styles from '@/styles/Perfil.module.css';

// Tipagem
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

const DashboardPerfil = () => {
  const [perfil, setPerfil] =
    useState<PerfilCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('sobre');

  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        console.log(
          '[LOG-FLUXO] Dashboard: Iniciando carga de dados via perfilService.',
        );
        const dados = await perfilService.obterMeuPerfil();
        setPerfil(dados);
      } catch (err: any) {
        console.error(
          '[ERRO-FLUXO] Falha na carga inicial do dashboard:',
          err.message,
        );
      } finally {
        setLoading(false);
      }
    };
    carregarDadosDashboard();
  }, []);

  // Estado de carregamento com consistência visual
  if (loading) {
    return (
      <div className={styles.container}>
        <div className="flex items-center justify-center h-screen text-slate-500 font-bold animate-pulse">
          Sincronizando seu painel de controle...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HeaderMain />

      <main className={styles.mainContent}>
        <div className={styles.dashboardGrid}>
          {/* COLUNA 1: IDENTIDADE & NAVEGAÇÃO VERTICAL  */}
          <aside
            className={`${styles.leftColumn} ${styles.stickySidebar} space-y-6`}
          >
            {/* Foto pequena e dados básicos de status */}
            <HeaderPro perfil={perfil} />

            {/* Menu lateral de navegação (Abas) */}
            <PerfilTabsVertical
              ativa={abaAtiva}
              setAtiva={setAbaAtiva}
              perfil={perfil}
            />
          </aside>

          {/* COLUNA 2: ÁREA DE TRABALHO CENTRAL (CONTEÚDO)  */}
          <section className={styles.centerColumn}>
            <div className={`${styles.card} min-h-[650px]`}>
              <header className="mb-8 border-b border-slate-50 pb-4">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Painel de{' '}
                  {perfil?.tipo === 'cliente'
                    ? 'Cliente'
                    : 'Gestão'}
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  Bem-vindo de volta,{' '}
                  <span className="text-blue-600">
                    {perfil?.nome.split(' ')[0]}
                  </span>
                  .
                </p>
              </header>

              {/* Renderização Dinâmica de Abas com Animação de Entrada */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {abaAtiva === 'sobre' && (
                  <AbaSobrePro perfil={perfil} />
                )}
                {abaAtiva === 'agenda' && (
                  <AbaAgendaPro perfil={perfil} />
                )}
                {abaAtiva === 'servicos' && (
                  <AbaServicosPro perfil={perfil} />
                )}

                {/* Fallback para abas em desenvolvimento */}
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

          {/* COLUNA 3: WIDGETS E MÉTRICAS LATERAIS  */}
          <aside
            className={`${styles.rightColumn} ${styles.stickySidebar}`}
          >
            <PerfilStatsWidgets perfil={perfil} />

            {/* Espaço extra para novos widgets futuros */}
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
