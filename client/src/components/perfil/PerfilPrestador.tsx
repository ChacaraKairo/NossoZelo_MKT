import { useEffect, useState } from 'react';
import AbaAgendaPro from '@/components/perfil/AbaAgendaPro';
import AbaAvaliacoesPro from '@/components/perfil/AbaAvaliacoesPro';
import AbaFinanceiroPro from '@/components/perfil/AbaFinanceiroPro';
import AbaHistoricoPerfil from '@/components/perfil/AbaHistoricoPerfil';
import AbaSeguranca from '@/components/perfil/AbaSeguranca';
import AbaServicosOperacionais from '@/components/perfil/AbaServicosOperacionais';
import AbaSolicitacoesPro from '@/components/perfil/AbaSolicitacoesPro';
import AlertaPerfilIncompleto from '@/components/perfil/AlertaPerfilIncompleto';
import FormEditarPerfil from '@/components/perfil/FormEditarPerfil';
import PerfilHeader from '@/components/perfil/PerfilHeader';
import {
  ContratacaoPerfil,
  PerfilUsuario,
  ServicoPerfil,
} from '@/types/perfil';
import logger from '@/utils/logger';
import styles from '@/styles/components/perfil/PerfilConteudo.module.css';

interface PerfilPrestadorProps {
  perfil: PerfilUsuario;
  onPerfilAtualizado?: (perfil: PerfilUsuario) => void;
  abaInicial?: string;
  onRecarregarPerfil?: () => void;
}

type AbaPrestador =
  | 'visao'
  | 'dados'
  | 'servicos'
  | 'agenda'
  | 'solicitacoes'
  | 'avaliacoes'
  | 'historico'
  | 'seguranca'
  | 'financeiro';

const CONTEXTO = 'PerfilPrestador';
const ABAS: { id: AbaPrestador; label: string }[] = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'dados', label: 'Dados profissionais' },
  { id: 'solicitacoes', label: 'Pedidos recebidos' },
  { id: 'agenda', label: 'Minha agenda' },
  { id: 'servicos', label: 'Meus serviços' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'historico', label: 'Histórico' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'financeiro', label: 'Financeiro' },
];

function texto(valor: unknown) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }
  if (Array.isArray(valor)) {
    return valor.length > 0 ? valor.join(', ') : 'Não informado';
  }
  return String(valor);
}

function CampoInfo({ label, valor }: { label: string; valor: unknown }) {
  return (
    <div className={styles.infoCard}>
      <span className={styles.infoLabel}>
        {label}
      </span>
      <p className={styles.infoValue}>{texto(valor)}</p>
    </div>
  );
}

function VisaoGeral({
  perfil,
  onCompletar,
}: {
  perfil: PerfilUsuario;
  onCompletar: () => void;
}) {
  logger.debug(CONTEXTO, 'Renderização da aba visão geral');
  const usuario = perfil.dados_usuario || perfil;
  const contratacoes =
    perfil.contratacoes_contratacoes_prestador_idTousuarios ||
    perfil.contratacoes ||
    [];
  const avaliacoes =
    perfil.avaliacoes_recebidas ||
    perfil.avaliacoes_avaliacoes_prestador_idTousuarios ||
    [];
  const pendentes = contratacoes.filter(
    (item) => item.status === 'pendente',
  ).length;

  return (
    <div className={styles.contentStack}>
      <AlertaPerfilIncompleto
        perfil={perfil}
        tipoUsuario={usuario.tipo || perfil.perfil_tipo}
        onCompletarPerfil={onCompletar}
      />
      <div className={styles.infoGrid}>
        <CampoInfo label="Pedidos pendentes" valor={pendentes} />
        <CampoInfo label="Contratações" valor={contratacoes.length} />
        <CampoInfo label="Avaliações" valor={avaliacoes.length} />
        <CampoInfo
          label="Avaliação média"
          valor={usuario.avaliacao_media || perfil.avaliacao_media}
        />
      </div>
    </div>
  );
}

function DadosProfissionais({ perfil }: { perfil: PerfilUsuario }) {
  logger.debug(CONTEXTO, 'Renderização da aba dados profissionais');
  const profissional = perfil.dados_profissionais || perfil;
  const usuario = perfil.dados_usuario || perfil;
  const tipo = usuario.tipo || perfil.perfil_tipo;

  return (
    <div className={styles.infoGridWide}>
      <CampoInfo label="Telefone" valor={usuario.telefone} />
      <CampoInfo label="Cidade" valor={usuario.cidade} />
      <CampoInfo label="Estado" valor={usuario.estado} />
      <CampoInfo label="Bairro" valor={usuario.bairro} />
      <CampoInfo label="Endereço" valor={usuario.endereco} />
      <CampoInfo label="Bio" valor={profissional.bio} />
      {tipo === 'enfermeiro' && (
        <CampoInfo label="COREN" valor={profissional.coren} />
      )}
      <CampoInfo
        label="Anos de experiência"
        valor={profissional.anos_experiencia}
      />
      <CampoInfo label="Valor hora" valor={profissional.valor_hora} />
      <CampoInfo label="Valor diária" valor={profissional.valor_diaria} />
      <CampoInfo
        label="Disponibilidade"
        valor={profissional.disponibilidade}
      />
      <CampoInfo
        label="Especialidades"
        valor={profissional.especialidades}
      />
    </div>
  );
}

export default function PerfilPrestador({
  perfil,
  onPerfilAtualizado,
  abaInicial,
  onRecarregarPerfil,
}: PerfilPrestadorProps) {
  const [aba, setAba] = useState<AbaPrestador>('visao');
  const [editando, setEditando] = useState(false);
  const usuario = perfil.dados_usuario || perfil;
  const tipoProfissional = usuario.tipo || perfil.perfil_tipo || 'prestador';
  const servicos = perfil.servicos || [];
  const avaliacoes =
    perfil.avaliacoes_recebidas ||
    perfil.avaliacoes_avaliacoes_prestador_idTousuarios ||
    [];
  const contratacoes =
    perfil.contratacoes_contratacoes_prestador_idTousuarios ||
    perfil.contratacoes ||
    [];

  useEffect(() => {
    if (
      abaInicial &&
      ABAS.some((item) => item.id === abaInicial)
    ) {
      setAba(abaInicial as AbaPrestador);
    }
  }, [abaInicial]);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderizando PerfilPrestador', {
      usuarioId: usuario.id,
      tipoProfissional,
      totalServicos: servicos.length,
      totalAvaliacoes: avaliacoes.length,
      totalSolicitacoes: contratacoes.length,
    });
  }, [
    usuario.id,
    tipoProfissional,
    servicos.length,
    avaliacoes.length,
    contratacoes.length,
  ]);

  const selecionarAba = (novaAba: AbaPrestador) => {
    logger.info(CONTEXTO, 'Aba selecionada', { aba: novaAba });
    setEditando(false);
    setAba(novaAba);
  };

  const handlePerfilAtualizado = (perfilAtualizado: PerfilUsuario) => {
    setEditando(false);
    onPerfilAtualizado?.(perfilAtualizado);
  };

  const handleContratacaoAtualizada = (contratacao: ContratacaoPerfil) => {
    logger.info(CONTEXTO, 'Contratação atualizada pela aba', {
      contratacaoId: contratacao.id,
      status: contratacao.status,
    });
    onRecarregarPerfil?.();
  };

  const handleServicosAtualizados = (servicosAtualizados: ServicoPerfil[]) => {
    onPerfilAtualizado?.({
      ...perfil,
      servicos: servicosAtualizados,
    });
  };

  let conteudo;
  if (editando) {
    conteudo = (
      <FormEditarPerfil
        perfil={perfil}
        tipoUsuario={tipoProfissional}
        onCancel={() => setEditando(false)}
        onSave={handlePerfilAtualizado}
      />
    );
  } else if (aba === 'visao') {
    conteudo = (
      <VisaoGeral perfil={perfil} onCompletar={() => setEditando(true)} />
    );
  } else if (aba === 'dados') {
    conteudo = <DadosProfissionais perfil={perfil} />;
  } else if (aba === 'servicos') {
    conteudo = (
      <AbaServicosOperacionais
        perfil={perfil}
        onServicosAtualizados={handleServicosAtualizados}
      />
    );
  } else if (aba === 'agenda') {
    conteudo = <AbaAgendaPro perfil={perfil} />;
  } else if (aba === 'solicitacoes') {
    conteudo = (
      <AbaSolicitacoesPro
        perfil={perfil}
        onContratacaoAtualizada={handleContratacaoAtualizada}
      />
    );
  } else if (aba === 'avaliacoes') {
    conteudo = <AbaAvaliacoesPro perfil={perfil} />;
  } else if (aba === 'historico') {
    conteudo = (
      <AbaHistoricoPerfil
        contratacoes={contratacoes}
        modo="prestador"
      />
    );
  } else if (aba === 'seguranca') {
    conteudo = <AbaSeguranca />;
  } else {
    conteudo = <AbaFinanceiroPro />;
  }

  return (
    <section className={styles.profileSection}>
      <PerfilHeader
        nome={texto(usuario.nome)}
        tipo={texto(tipoProfissional)}
        urlFoto={usuario.url_foto_perfil}
        cidade={usuario.cidade}
        estado={usuario.estado}
        avaliacaoMedia={usuario.avaliacao_media || perfil.avaliacao_media}
      />

      <div className={styles.tabs}>
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selecionarAba(item.id)}
            className={`${styles.tabButton} ${
              aba === item.id && !editando
                ? styles.tabButtonActive
                : ''
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setEditando(true)}
          className={styles.editButton}
        >
          Editar perfil
        </button>
      </div>

      {conteudo}
    </section>
  );
}
