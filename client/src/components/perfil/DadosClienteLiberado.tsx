import { useEffect, useState } from 'react';
import Carregando from '@/components/common/Carregando';
import { extrairErroApi } from '@/service/api';
import { perfilService } from '@/service/perfilService';
import { PerfilClienteParaPrestador } from '@/types/perfil';
import logger from '@/utils/logger';

interface DadosClienteLiberadoProps {
  clienteId: string;
  isPrestador: boolean;
}

const CONTEXTO = 'DadosClienteLiberado';

function texto(valor?: string | null) {
  return valor || 'Não informado';
}

export default function DadosClienteLiberado({
  clienteId,
  isPrestador,
}: DadosClienteLiberadoProps) {
  const [dados, setDados] =
    useState<PerfilClienteParaPrestador | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!isPrestador || !clienteId) return;

    async function carregarCliente() {
      try {
        setLoading(true);
        setErro(null);
        logger.info(CONTEXTO, 'Tentativa de buscar dados do cliente', {
          clienteId,
        });

        const resposta = await perfilService.obterDadosCliente(clienteId);

        if (!resposta?.contato_liberado) {
          logger.warn(CONTEXTO, 'Contato negado', { clienteId });
          setDados(null);
          setErro('Contato ainda não liberado para esta contratação.');
          return;
        }

        logger.info(CONTEXTO, 'Contato liberado', {
          clienteId,
          contratacaoId: resposta.contratacao_id,
        });
        setDados(resposta);
      } catch (error: unknown) {
        const { status, mensagem } = extrairErroApi(error);
        logger.error(CONTEXTO, 'Erro ao buscar dados do cliente', {
          clienteId,
          status,
          mensagem,
        });

        if (status === 403) {
          setErro('Você não tem permissão para ver esses dados.');
        } else if (status === 404) {
          setErro('Contato ainda não liberado para esta contratação.');
        } else {
          setErro(mensagem);
        }
      } finally {
        setLoading(false);
      }
    }

    carregarCliente();
  }, [clienteId, isPrestador]);

  if (!isPrestador) return null;
  if (loading) return <Carregando mensagem="Carregando contato do cliente..." />;
  if (erro) {
    return (
      <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
        {erro}
      </p>
    );
  }
  if (!dados?.contato_liberado) return null;

  return (
    <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-slate-700">
      <p className="font-black text-slate-800">{dados.nome}</p>
      <p>
        {texto(dados.cidade)} / {texto(dados.estado)} - {texto(dados.bairro)}
      </p>
      <p>Telefone: {texto(dados.telefone)}</p>
      <p>Email: {texto(dados.email)}</p>
      <p>Endereço: {texto(dados.endereco)}</p>
      <p>Situação do pedido: {texto(dados.status_contratacao)}</p>
    </div>
  );
}
