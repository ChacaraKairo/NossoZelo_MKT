/**
 * @author DevHelper (ZeloArchitect AI)
 * @description Dashboard de Perfil Profissional Completo - Estilo Rede Social.
 * Integra: Identidade, Agenda, Pedidos em Espera e Gestão de Dados.
 */

import React, { useEffect, useState } from 'react';
import { withAuth } from '@/utils/withAuth';
import { perfilService } from '@/service/perfilService';
import HeaderMain from '@/components/header/HeaderMain';
import Footer from '@/components/footer/Footer';
import Button from '@/components/btn/Button';
import {
  FaCheckCircle,
  FaStar,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUserFriends,
  FaCamera,
} from 'react-icons/fa';

const MeuPerfilCompleto = () => {
  const [perfil, setPerfil] = useState<any>(null);
  const [abaAtiva, setAbaAtiva] = useState('sobre');
  const [loading, setLoading] = useState(true);

  // Mocks para visualização (Estes dados virão do teu Service_Agendamento futuramente)
  const [pedidosPendentes, setPedidosPendentes] = useState([
    {
      id: 1,
      cliente: 'Dona Maria Oliveira',
      servico: 'Cuidador - Pós Operatório',
      data: '20/04/2026',
      hora: '08:00',
      valor: 150.0,
    },
    {
      id: 2,
      cliente: 'Sr. Roberto Silva',
      servico: 'Acompanhamento Exame',
      data: '22/04/2026',
      hora: '14:30',
      valor: 80.0,
    },
  ]);

  const [agendaHoje, setAgendaHoje] = useState([
    {
      id: 101,
      cliente: 'Ana Costa',
      hora: '10:00',
      local: 'Indaiatuba, SP',
      status: 'Confirmado',
    },
  ]);

  useEffect(() => {
    const carregarTudo = async () => {
      try {
        const dados = await perfilService.obterMeuPerfil();
        setPerfil(dados);
      } catch (err) {
        console.error(
          'Erro ao carregar perfil social:',
          err,
        );
      } finally {
        setLoading(false);
      }
    };
    carregarTudo();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium">
            A organizar o teu consultório digital...
          </p>
        </div>
      </div>
    );

  const dadosProfissionais =
    perfil?.cuidadores ||
    perfil?.enfermeiros ||
    perfil?.acompanhantes;

  const handleAceitarPedido = (id: number) => {
    // Lógica futura: disparar agendamentoService.aceitarServico(id)
    setPedidosPendentes((prev) =>
      prev.filter((p) => p.id !== id),
    );
    alert(
      'Pedido aceite! O contacto do cliente foi libertado na tua agenda.',
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans">
      <HeaderMain />

      <main className="flex-1 mt-[80px] pb-10">
        {/* --- CABEÇALHO DO PERFIL (FACEBOOK STYLE) --- */}
        <div className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto">
            {/* Capa */}
            <div className="h-48 md:h-80 bg-gradient-to-r from-blue-600 to-cyan-500 relative rounded-b-xl">
              <button className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm font-bold flex items-center gap-2 hover:bg-gray-100 transition">
                <FaCamera /> Editar Capa
              </button>
            </div>

            {/* Avatar e Nome */}
            <div className="px-8 pb-4 flex flex-col md:flex-row items-end -mt-16 md:-mt-20 gap-6">
              <div className="relative group">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-xl">
                  <img
                    src={
                      perfil.url_foto_perfil ||
                      '/logos/OnlyLogo.png'
                    }
                    alt="Foto de Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-full flex items-center justify-center cursor-pointer">
                  <FaCamera className="text-white text-2xl" />
                </div>
              </div>

              <div className="flex-1 mb-2 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                  {perfil.nome}
                  <FaCheckCircle
                    className="text-blue-500 text-xl"
                    title="Perfil Verificado"
                  />
                </h1>
                <p className="text-gray-500 font-semibold text-lg capitalize">
                  {perfil.tipo}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-1 mt-1 text-orange-500 font-bold">
                  <FaStar />{' '}
                  <span>
                    {perfil.avaliacao_media?.toFixed(1) ||
                      'Novo'}
                  </span>
                  <span className="text-gray-400 font-normal text-sm ml-2">
                    (12 avaliações)
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Button
                  variant="primary"
                  className="shadow-lg px-8"
                >
                  Editar Perfil
                </Button>
              </div>
            </div>

            {/* Menu de Abas */}
            <div className="border-t mx-4 flex justify-center md:justify-start gap-2 md:gap-8">
              {['sobre', 'agenda', 'documentos'].map(
                (aba) => (
                  <button
                    key={aba}
                    onClick={() => setAbaAtiva(aba)}
                    className={`py-5 px-4 font-bold capitalize transition-all border-b-4 ${
                      abaAtiva === aba
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {aba}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* --- CONTEÚDO PRINCIPAL (GRID) --- */}
        <div className="max-w-5xl mx-auto mt-6 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Esquerda: Intro & Stats (4 colunas) */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-extrabold text-gray-800 mb-4">
                Apresentação
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                "
                {dadosProfissionais?.bio ||
                  'Bem-vindo ao meu perfil profissional no Nosso Zelo.'}
                "
              </p>
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-700">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span className="text-sm font-medium">
                    {perfil.cidade}, {perfil.estado}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FaUserFriends className="text-gray-400" />
                  <span className="text-sm font-medium">
                    Membro desde Abril de 2026
                  </span>
                </div>
              </div>
            </section>

            {/* Widget de Agenda Rápida */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />{' '}
                Agenda de Hoje
              </h3>
              {agendaHoje.length > 0 ? (
                <div className="space-y-4">
                  {agendaHoje.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-4 border-emerald-500 pl-4 py-1"
                    >
                      <p className="text-xs font-bold text-gray-400">
                        {item.hora}
                      </p>
                      <h4 className="text-sm font-bold text-gray-800">
                        {item.cliente}
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        {item.local}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Nenhum serviço para hoje.
                </p>
              )}
            </section>
          </div>

          {/* Coluna Central/Direita: Conteúdo Dinâmico (8 colunas) */}
          <div className="lg:col-span-8 space-y-6">
            {/* COMPONENTE: PEDIDOS EM ESPERA (Sempre visível no topo da área de conteúdo) */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-extrabold text-gray-800">
                  Novas Solicitações
                </h3>
                <span className="bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full animate-pulse">
                  {pedidosPendentes.length} PENDENTES
                </span>
              </div>
              <div className="p-6">
                {pedidosPendentes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pedidosPendentes.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex flex-col justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-orange-600 uppercase mb-1">
                            {pedido.servico}
                          </p>
                          <h4 className="font-bold text-gray-900">
                            {pedido.cliente}
                          </h4>
                          <div className="flex items-center gap-3 text-gray-500 text-xs mt-2">
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt />{' '}
                              {pedido.data}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock /> {pedido.hora}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between">
                          <span className="font-extrabold text-gray-800">
                            R$ {pedido.valor.toFixed(2)}
                          </span>
                          <button
                            onClick={() =>
                              handleAceitarPedido(pedido.id)
                            }
                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 transition shadow-sm"
                          >
                            Aceitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm">
                      Nenhum pedido novo no momento. Fica
                      atento!
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ABAS DINÂMICAS */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              {abaAtiva === 'sobre' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                    Informações de Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        E-mail Privado
                      </label>
                      <p className="text-gray-900 font-medium">
                        {perfil.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        Telemóvel / WhatsApp
                      </label>
                      <p className="text-gray-900 font-medium">
                        {perfil.telefone}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase">
                        Endereço de Residência
                      </label>
                      <p className="text-gray-900 font-medium">
                        {perfil.endereco}, {perfil.bairro}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'agenda' && (
                <div className="text-center py-10">
                  <FaCalendarAlt className="text-gray-200 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Calendário de Serviços
                  </h3>
                  <p className="text-gray-500">
                    A tua agenda completa está a ser
                    processada.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6"
                  >
                    Ver em ecrã inteiro
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default withAuth(MeuPerfilCompleto);
