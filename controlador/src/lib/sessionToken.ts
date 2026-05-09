import { jwtVerify, SignJWT } from "jose";

export type AdminTokenPayload = {
  id: string;
  nome: string;
  email: string;
  tipo: "admin";
};

export const ADMIN_SESSION_COOKIE = "controlador_session";

const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_ADMIN_SECRET;
  if (!secret || secret.length < 32 || secret === "troque-por-uma-chave-forte") {
    throw new Error("JWT_ADMIN_SECRET ausente ou fraco. Use pelo menos 32 caracteres.");
  }
  return encoder.encode(secret);
}

export async function gerarTokenAdmin(payload: AdminTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecret());
}

export async function validarTokenAdmin(token?: string): Promise<AdminTokenPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.tipo !== "admin" || typeof payload.id !== "string") return null;

    return {
      id: payload.id,
      nome: String(payload.nome ?? ""),
      email: String(payload.email ?? ""),
      tipo: "admin"
    };
  } catch {
    return null;
  }
}
