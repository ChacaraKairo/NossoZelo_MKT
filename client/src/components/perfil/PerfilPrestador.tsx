import { useEffect, useState } from 'react';
import AbaAgendaPro from '@/components/perfil/AbaAgendaPro';
import AbaAvaliacoesPro from '@/components/perfil/AbaAvaliacoesPro';
import AbaFinanceiroPro from '@/components/perfil/AbaFinanceiroPro';
import AbaSolicitacoesPro from '@/components/perfil/AbaSolicitacoesPro';
import AlertaPerfilIncompleto from '@/components/perfil/AlertaPerfilIncompleto';
import EstadoVazio from '@/components/common/EstadoVazio';
import FormEditarPerfil from '@/components/perfil/FormEditarPerfil';
import PerfilHeader from '@/components/perfil/PerfilHeader';
import {
  ContratacaoPerfil,
  PerfilUsuario,
  ServicoPerfil,
} from '@/types/perfil';
import logger from '@/utils/logger';

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
  | 'financeiro';

const CONTEXTO = 'PerfilPrestador';
const ABAS: { id: AbaPrestador; label: string }[] = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'dados', label: 'Dados profissionais' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'solicitacoes', label: 'Solicitações' },
  { id: 'avaliacoes', label: 'Avaliações' },
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
    <div className="rounded-xl border border-slate-100 bg-white p-5">
      <span className="text-xs font-bold uppercase text-slate-400">
        {label}
      </span>
      <p className="mt-1 font-semibold text-slate-800">{texto(valor)}</p>
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

  return (
    <div className="space-y-5">
      <AlertaPerfilIncompleto
        perfil={perfil}
        tipoUsuario={usuario.tipo || perfil.perfil_tipo}
        onCompletarPerfil={onCompletar}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <CampoInfo label="Solicitações" valor={contratacoes.length} />
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
    <div className="grid gap-4 md:grid-cols-2">
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

function ServicosPrestador({ servicos }: { servicos: ServicoPerfil[] }) {
  logger.debug(CONTEXTO, 'Renderização da aba serviços', {
    total: servicos.length,
  });

  if (servicos.length === 0) {
    return (
      <EstadoVazio
        titulo="Nenhum serviço cadastrado."
        descricao="Quando seus serviços vierem da API, eles aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      {servicos.map((servico) => (
        <article
          key={servico.id}
          className="rounded-xl border border-slate-100 bg-white p-5"
        >
          <p className="font-bold text-slate-800">
            {texto(servico.nome || servico.tipo)}
          </p>
          <p className="text-sm text-slate-500">{texto(servico.descricao)}</p>
          <p className="text-sm font-semibold text-slate-700">
            Valor: {texto(servico.valor)}
          </p>
        </article>
      ))}
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
    });
    logger.info(CONTEXTO, 'Tipo profissional detectado', {
      tipoProfissional,
    });
    logger.info(CONTEXTO, 'Quantidade de serviços', {
      total: servicos.length,
    });
    logger.info(CONTEXTO, 'Quantidade de avaliações', {
      total: avaliacoes.length,
    });
    logger.info(CONTEXTO, 'Quantidade de solicitações', {
      total: contratacoes.length,
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
    conteudo = <ServicosPrestador servicos={servicos} />;
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
  } else {
    conteudo = <AbaFinanceiroPro />;
  }

  return (
    <section className="space-y-8">
      <PerfilHeader
        nome={texto(usuario.nome)}
        tipo={texto(tipoProfissional)}
        urlFoto={usuario.url_foto_perfil}
        cidade={usuario.cidade}
        estado={usuario.estado}
        avaliacaoMedia={usuario.avaliacao_media || perfil.avaliacao_media}
      />

      <div className="flex flex-wrap gap-2">
        {ABAS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selecionarAba(item.id)}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${
              aba === item.id && !editando
                ? 'bg-teal-600 text-white'
                : 'border border-slate-200 text-slate-600'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white"
        >
          Editar perfil
        </button>
      </div>

      {conteudo}
    </section>
  );
}
