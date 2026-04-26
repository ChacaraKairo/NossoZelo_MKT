export {};

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      nome?: string;
      email?: string;
      tipo: string;
      iat?: number;
      exp?: number;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
