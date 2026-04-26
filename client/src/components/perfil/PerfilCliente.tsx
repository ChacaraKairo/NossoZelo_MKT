import { useEffect, useState } from 'react';
import AbaHistoricoPerfil from '@/components/perfil/AbaHistoricoPerfil';
import AbaSeguranca from '@/components/perfil/AbaSeguranca';
import EstadoVazio from '@/components/common/EstadoVazio';
import FormEditarPerfil from '@/components/perfil/FormEditarPerfil';
import PerfilHeader from '@/components/perfil/PerfilHeader';
import {
  AvaliacaoPerfil,
  ContratacaoPerfil,
  PerfilUsuario,
} from '@/types/perfil';
import logger from '@/utils/logger';

interface PerfilClienteProps {
  perfil: PerfilUsuario;
  onPerfilAtualizado?: (perfil: PerfilUsuario) => void;
  abaInicial?: string;
}

type AbaCliente =
  | 'visao'
  | 'dados'
  | 'contratacoes'
  | 'avaliacoes'
  | 'historico'
  | 'seguranca';

const CONTEXTO = 'PerfilCliente';
const ABAS: { id: AbaCliente; label: string }[] = [
  { id: 'visao', label: 'Visão geral' },
  { id: 'dados', label: 'Dados pessoais' },
  { id: 'contratacoes', label: 'Meus pedidos' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'historico', label: 'Histórico' },
  { id: 'seguranca', label: 'Segurança' },
];

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
  usuario,
  contratacoes,
  avaliacoes,
}: {
  usuario: PerfilUsuario;
  contratacoes: ContratacaoPerfil[];
  avaliacoes: AvaliacaoPerfil[];
}) {
  logger.debug(CONTEXTO, 'Renderização da aba visão geral');
  const ativos = contratacoes.filter((item) =>
    ['pendente', 'confirmado'].includes(String(item.status)),
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <CampoInfo label="Telefone" valor={usuario.telefone} />
      <CampoInfo label="Pedidos ativos" valor={ativos} />
      <CampoInfo label="Contratações" valor={contratacoes.length} />
      <CampoInfo label="Avaliações feitas" valor={avaliacoes.length} />
    </div>
  );
}

function DadosPessoais({ usuario }: { usuario: PerfilUsuario }) {
  logger.debug(CONTEXTO, 'Renderização da aba dados pessoais');
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CampoInfo label="Nome" valor={usuario.nome} />
      <CampoInfo label="Telefone" valor={usuario.telefone} />
      <CampoInfo label="Cidade" valor={usuario.cidade} />
      <CampoInfo label="Estado" valor={usuario.estado} />
      <CampoInfo label="Bairro" valor={usuario.bairro} />
      <CampoInfo label="Endereço" valor={usuario.endereco} />
    </div>
  );
}

function MinhasContratacoes({
  contratacoes,
}: {
  contratacoes: ContratacaoPerfil[];
}) {
  logger.debug(CONTEXTO, 'Renderização da aba contratações', {
    total: contratacoes.length,
  });

  if (contratacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Nenhuma contratação encontrada."
        descricao="Quando você solicitar um serviço, o histórico aparecerá aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      {contratacoes.map((contratacao) => (
        <article
          key={contratacao.id}
          className="rounded-xl border border-slate-100 bg-white p-5"
        >
          <p className="font-bold text-slate-800">
            {contratacao.usuarios_contratacoes_prestador_idTousuarios
              ?.nome || `Contratação #${contratacao.id}`}
          </p>
          <p className="text-sm text-slate-500">
            Status: {texto(contratacao.status)}
          </p>
          <p className="text-sm text-slate-500">
            Data: {formatarData(contratacao.data)}
          </p>
        </article>
      ))}
    </div>
  );
}

function AvaliacoesCliente({
  avaliacoes,
}: {
  avaliacoes: AvaliacaoPerfil[];
}) {
  logger.debug(CONTEXTO, 'Renderização da aba avaliações', {
    total: avaliacoes.length,
  });

  if (avaliacoes.length === 0) {
    return (
      <EstadoVazio
        titulo="Nenhuma avaliação feita."
        descricao="Quando você avaliar um prestador, a avaliação aparecerá aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      {avaliacoes.map((avaliacao) => (
        <article
          key={avaliacao.id}
          className="rounded-xl border border-slate-100 bg-white p-5"
        >
          <p className="font-bold text-slate-800">
            Nota: {texto(avaliacao.nota)}
          </p>
          <p className="text-sm text-slate-500">
            {texto(avaliacao.comentario)}
          </p>
          <p className="text-xs text-slate-400">
            {formatarData(avaliacao.data_avaliacao)}
          </p>
        </article>
      ))}
    </div>
  );
}

export default function PerfilCliente({
  perfil,
  onPerfilAtualizado,
  abaInicial,
}: PerfilClienteProps) {
  const [aba, setAba] = useState<AbaCliente>('visao');
  const [editando, setEditando] = useState(false);
  const usuario = (perfil.dados_usuario || perfil) as PerfilUsuario;
  const contratacoes =
    perfil.contratacoes_contratacoes_cliente_idTousuarios ||
    perfil.contratacoes ||
    [];
  const avaliacoes = perfil.avaliacoes_feitas || [];

  useEffect(() => {
    if (
      abaInicial &&
      ABAS.some((item) => item.id === abaInicial)
    ) {
      setAba(abaInicial as AbaCliente);
    }
  }, [abaInicial]);

  useEffect(() => {
    logger.info(CONTEXTO, 'Renderizando PerfilCliente', {
      usuarioId: usuario.id,
      totalContratacoes: contratacoes.length,
      totalAvaliacoes: avaliacoes.length,
    });
  }, [usuario.id, contratacoes.length, avaliacoes.length]);

  const selecionarAba = (novaAba: AbaCliente) => {
    logger.info(CONTEXTO, 'Aba selecionada', { aba: novaAba });
    setEditando(false);
    setAba(novaAba);
  };

  const handlePerfilAtualizado = (perfilAtualizado: PerfilUsuario) => {
    logger.info(CONTEXTO, 'Salvamento concluído', {
      usuarioId: perfilAtualizado.dados_usuario?.id || perfilAtualizado.id,
    });
    setEditando(false);
    onPerfilAtualizado?.(perfilAtualizado);
  };

  let conteudo;
  if (editando) {
    conteudo = (
      <FormEditarPerfil
        perfil={perfil}
        tipoUsuario={usuario.tipo || perfil.perfil_tipo}
        onCancel={() => setEditando(false)}
        onSave={handlePerfilAtualizado}
      />
    );
  } else if (aba === 'visao') {
    conteudo = (
      <VisaoGeral
        usuario={usuario}
        contratacoes={contratacoes}
        avaliacoes={avaliacoes}
      />
    );
  } else if (aba === 'dados') {
    conteudo = <DadosPessoais usuario={usuario} />;
  } else if (aba === 'contratacoes') {
    conteudo = <MinhasContratacoes contratacoes={contratacoes} />;
  } else if (aba === 'avaliacoes') {
    conteudo = <AvaliacoesCliente avaliacoes={avaliacoes} />;
  } else if (aba === 'historico') {
    conteudo = (
      <AbaHistoricoPerfil contratacoes={contratacoes} modo="cliente" />
    );
  } else {
    conteudo = <AbaSeguranca />;
  }

  return (
    <section className="space-y-8">
      <PerfilHeader
        nome={texto(usuario.nome)}
        tipo={texto(usuario.tipo || perfil.perfil_tipo)}
        urlFoto={usuario.url_foto_perfil}
        cidade={usuario.cidade}
        estado={usuario.estado}
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
          onClick={() => {
            logger.info(CONTEXTO, 'Clique em editar perfil', {
              usuarioId: usuario.id,
            });
            setEditando(true);
          }}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white"
        >
          Editar perfil
        </button>
      </div>

      {conteudo}
    </section>
  );
}
