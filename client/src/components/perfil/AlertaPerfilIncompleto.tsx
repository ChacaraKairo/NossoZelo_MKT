import { useEffect, useMemo } from 'react';
import { PerfilUsuario, TipoUsuario } from '@/types/perfil';
import logger from '@/utils/logger';

interface AlertaPerfilIncompletoProps {
  perfil: PerfilUsuario;
  tipoUsuario?: TipoUsuario;
  onCompletarPerfil: () => void;
}

const CONTEXTO = 'AlertaPerfilIncompleto';
const TIPOS_PRESTADOR = ['cuidador', 'enfermeiro', 'acompanhante'];

function vazio(valor: unknown) {
  if (Array.isArray(valor)) return valor.length === 0;
  return valor === null || valor === undefined || valor === '';
}

function calcularCamposAusentes(
  perfil: PerfilUsuario,
  tipoUsuario?: TipoUsuario,
) {
  const usuario = perfil.dados_usuario || perfil;
  const profissional = perfil.dados_profissionais || perfil;
  const tipo = String(tipoUsuario || usuario.tipo || perfil.perfil_tipo || '');
  const campos: string[] = [];

  if (vazio(usuario.nome)) campos.push('nome');
  if (vazio(usuario.telefone)) campos.push('telefone');
  if (vazio(usuario.cidade)) campos.push('cidade');
  if (vazio(usuario.estado)) campos.push('estado');

  if (TIPOS_PRESTADOR.includes(tipo)) {
    if (vazio(profissional.bio)) campos.push('bio');
    if (vazio(profissional.valor_hora) && vazio(profissional.valor_diaria)) {
      campos.push('valor por hora ou diária');
    }
    if (vazio(profissional.disponibilidade)) campos.push('disponibilidade');
    if (vazio(profissional.especialidades)) campos.push('especialidades');
  }

  return campos;
}

export default function AlertaPerfilIncompleto({
  perfil,
  tipoUsuario,
  onCompletarPerfil,
}: AlertaPerfilIncompletoProps) {
  const camposAusentes = useMemo(
    () => calcularCamposAusentes(perfil, tipoUsuario),
    [perfil, tipoUsuario],
  );

  useEffect(() => {
    logger.info(CONTEXTO, 'Campos faltantes detectados', {
      camposAusentes,
    });
  }, [camposAusentes]);

  if (camposAusentes.length === 0) return null;

  const handleCompletar = () => {
    logger.info(CONTEXTO, 'Clique em completar perfil', {
      camposAusentes,
    });
    onCompletarPerfil();
  };

  return (
    <section className="rounded-xl border border-amber-100 bg-amber-50 p-5">
      <h2 className="text-lg font-black text-amber-900">
        Complete seu perfil
      </h2>
      <p className="mt-1 text-sm text-amber-800">
        Alguns dados essenciais ainda não foram preenchidos.
      </p>
      <ul className="mt-3 list-disc pl-5 text-sm font-semibold text-amber-900">
        {camposAusentes.map((campo) => (
          <li key={campo}>{campo}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleCompletar}
        className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
      >
        Completar perfil
      </button>
    </section>
  );
}
