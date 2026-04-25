interface PerfilHeaderProps {
  nome: string;
  tipo: string;
  urlFoto?: string | null;
  cidade?: string | null;
  estado?: string | null;
  avaliacaoMedia?: number | string | null;
  subtitulo?: string;
}

function texto(valor: unknown, fallback = 'Não informado') {
  if (valor === null || valor === undefined || valor === '') {
    return fallback;
  }

  return String(valor);
}

function inicialNome(nome: string) {
  return nome.trim().charAt(0).toUpperCase() || 'N';
}

function formatarAvaliacao(valor?: number | string | null) {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const nota = Number(valor);
  if (Number.isNaN(nota)) return null;

  return nota.toFixed(1);
}

export default function PerfilHeader({
  nome,
  tipo,
  urlFoto,
  cidade,
  estado,
  avaliacaoMedia,
  subtitulo,
}: PerfilHeaderProps) {
  const localizacao =
    cidade || estado
      ? `${texto(cidade)} / ${texto(estado)}`
      : 'Localização não informada';
  const nota = formatarAvaliacao(avaliacaoMedia);

  return (
    <header className="flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {urlFoto ? (
          <img
            src={urlFoto}
            alt={nome}
            className="h-20 w-20 rounded-full border border-slate-100 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-teal-50 text-2xl font-black text-teal-700">
            {inicialNome(nome)}
          </div>
        )}

        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {texto(nome)}
          </h1>
          <p className="text-sm font-semibold capitalize text-slate-500">
            {texto(tipo)}
          </p>
          {subtitulo && (
            <p className="text-sm text-slate-400">
              {subtitulo}
            </p>
          )}
          <p className="text-sm text-slate-400">
            {localizacao}
          </p>
          {nota && (
            <p className="mt-1 text-sm font-bold text-amber-500">
              Avaliação média: {nota}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
