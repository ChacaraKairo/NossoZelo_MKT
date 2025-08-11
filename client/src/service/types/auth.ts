export interface LoginRequestBody {
  identificador: string;
  senha: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  tipo: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
