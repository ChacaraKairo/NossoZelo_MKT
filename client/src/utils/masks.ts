/**
 * @author ZeloArchitect AI & Kairo
 * @description Conjunto de máscaras de entrada de dados com formatação progressiva.
 * @path client/src/utils/masks.ts
 */

/**
 * Remove qualquer caractere que não seja dígito.
 */
const clean = (v: string) => v.replace(/\D/g, '');

export const mascaraCpf = (v: string) => {
  const value = clean(v).slice(0, 11);
  return value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const mascaraCnpj = (v: string) => {
  const value = clean(v).slice(0, 14);
  return value
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const mascaraTelefone = (v: string) => {
  const value = clean(v).slice(0, 11);
  if (value.length <= 10) {
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return value
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

export const mascaraCep = (v: string) => {
  const value = clean(v).slice(0, 8);
  return value.replace(/(\d{5})(\d)/, '$1-$2');
};

export const mascaraNumero = (v: string) => {
  return clean(v).slice(0, 10);
};

export const mascaraUf = (v: string) => {
  return v
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();
};
