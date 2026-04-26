/**
 * @author ZeloArchitect AI & Kairo
 * @description Validadores de integridade de dados com algoritmos de checksum (Mod11).
 * @path client/src/utils/validators.ts
 */

/**
 * Valida CPF utilizando algoritmo de dígitos verificadores.
 */
export const cpfValido = (v: string): boolean => {
  const cpf = v.replace(/\D/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/))
    return false;

  const digits = cpf.split('').map((el) => +el);
  const rest = (count: number) =>
    ((digits
      .slice(0, count - 12)
      .reduce(
        (soma, el, index) => soma + el * (count - index),
        0,
      ) *
      10) %
      11) %
    10;

  return rest(10) === digits[9] && rest(11) === digits[10];
};

/**
 * Valida CNPJ utilizando algoritmo de dígitos verificadores.
 */
export const cnpjValido = (v: string): boolean => {
  const cnpj = v.replace(/\D/g, '');
  if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/))
    return false;

  const size = cnpj.length - 2;
  const numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);

  const calc = (n: string): number => {
    let currentSize = n.length - 7;
    if (currentSize < 2) currentSize = 9;
    let pos = size - 7;
    let sum = 0;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(n.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result;
  };

  return (
    calc(numbers) === parseInt(digits.charAt(0)) &&
    calc(numbers + digits.charAt(0)) ===
      parseInt(digits.charAt(1))
  );
};

const DDD_VALIDOS_BR = new Set([
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '21',
  '22',
  '24',
  '27',
  '28',
  '31',
  '32',
  '33',
  '34',
  '35',
  '37',
  '38',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '51',
  '53',
  '54',
  '55',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '71',
  '73',
  '74',
  '75',
  '77',
  '79',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
]);

/**
 * Valida telefone brasileiro com DDD.
 */
export const telefoneValido = (v: string): boolean => {
  const d = v.replace(/\D/g, '');
  if (!/^\d{10,11}$/.test(d) || /^(\d)\1+$/.test(d)) {
    return false;
  }

  const ddd = d.slice(0, 2);
  if (!DDD_VALIDOS_BR.has(ddd)) {
    return false;
  }

  const numero = d.slice(2);
  if (/^(\d)\1+$/.test(numero)) {
    return false;
  }

  if (d.length === 11) {
    return numero.startsWith('9');
  }

  return /^[2-5]/.test(numero);
};

/**
 * Valida CEP brasileiro (8 dígitos).
 */
export const cepValido = (v: string): boolean => {
  const d = v.replace(/\D/g, '');
  return d.length === 8;
};

/**
 * Valida formato de e-mail com Regex RFC 5322.
 */
export const emailValido = (v: string): boolean => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(v).toLowerCase());
};

/**
 * Valida força básica da senha.
 * Mínimo 6 caracteres.
 */
export const senhaValida = (v: string): boolean => {
  return v.length >= 6 && v.length <= 255;
};
