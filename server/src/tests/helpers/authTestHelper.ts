import jwt from 'jsonwebtoken';

export function criarTokenTeste(payload = {}) {
  return jwt.sign(
    {
      id: 'usuario-1',
      nome: 'Usuario Teste',
      tipo: 'cliente',
      ...payload,
    },
    process.env.JWT_SECRET || 'nossozelo-test-secret',
    { expiresIn: '1h' },
  );
}
