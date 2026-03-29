export const mascaraCpf = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

export const mascaraTelefone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

export const mascaraCep = (v: string) =>
  v.replace(/\D/g, '').slice(0, 8)
    .replace(/(\d{5})(\d{0,3})/, '$1-$2');

export const mascaraNumero = (v: string) =>
  v.replace(/\D/g, '').slice(0, 10);

export const mascaraUf = (v: string) =>
  v.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
