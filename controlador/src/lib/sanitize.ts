export function mascararEmail(email?: string | null) {
  if (!email) return "";
  const [nome, dominio] = email.split("@");
  if (!dominio) return "***";
  const prefixo = nome.slice(0, 2);
  return `${prefixo}${"*".repeat(Math.max(3, nome.length - 2))}@${dominio}`;
}

export function mascararDocumento(documento?: string | null) {
  if (!documento) return "";
  const digitos = documento.replace(/\D/g, "");
  if (digitos.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, digitos.length - 4))}${digitos.slice(-4)}`;
}

export function mascararTelefone(telefone?: string | null) {
  if (!telefone) return "";
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, digitos.length - 4))}${digitos.slice(-4)}`;
}

export function normalizarBusca(valor: string | null) {
  const texto = valor?.trim();
  return texto && texto.length > 0 ? texto : undefined;
}

export function paginaAtual(valor: string | null) {
  const page = Number(valor ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function limitePagina(valor: string | null) {
  const limit = Number(valor ?? "20");
  if (!Number.isFinite(limit) || limit < 1) return 20;
  return Math.min(Math.floor(limit), 100);
}
