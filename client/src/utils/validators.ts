export const cpfValido = (v: string) =>
  v.replace(/\D/g, '').length === 11;

export const telefoneValido = (v: string) => {
  const d = v.replace(/\D/g, '');
  return d.length === 10 || d.length === 11;
};

export const cepValido = (v: string) =>
  v.replace(/\D/g, '').length === 8;

export const emailValido = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const senhaValida = (v: string) =>
  v.length >= 6 && v.length <= 255;
