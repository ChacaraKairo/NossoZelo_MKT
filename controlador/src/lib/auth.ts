import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, gerarTokenAdmin, validarTokenAdmin } from "@/lib/sessionToken";

export type AdminSession = {
  id: string;
  nome: string;
  email: string;
  tipo: "admin";
};

export function adminEhMestre(admin: AdminSession | null | undefined) {
  const emailMestre = process.env.MASTER_ADMIN_EMAIL;
  if (!emailMestre && process.env.NODE_ENV === "production") {
    throw new Error("MASTER_ADMIN_EMAIL precisa estar configurado em producao.");
  }
  return admin?.email.toLowerCase() === (emailMestre || "master@master.master").toLowerCase();
}

export async function autenticarAdmin(login: string, senha: string) {
  const usuario = await prisma.usuarios.findFirst({
    where: {
      OR: [{ email: login }, { cpf: login }]
    },
    select: {
      id: true,
      nome: true,
      email: true,
      senha: true,
      tipo: true
    }
  });

  if (!usuario) return null;
  const senhaValida = await compare(senha, usuario.senha);
  if (!senhaValida || usuario.tipo !== "admin") return null;

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: "admin" as const
  };
}

export async function obterSessaoAdmin(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const sessao = await validarTokenAdmin(token);
  if (!sessao) return null;

  const usuario = await prisma.usuarios.findUnique({
    where: { id: sessao.id },
    select: { id: true, nome: true, email: true, tipo: true }
  });

  if (!usuario || usuario.tipo !== "admin") return null;
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: "admin"
  };
}

export async function exigirAdminPagina() {
  const admin = await obterSessaoAdmin();
  if (!admin) redirect("/login");
  return admin;
}

export async function exigirAdminApi() {
  const admin = await obterSessaoAdmin();
  if (!admin) {
    return {
      admin: null,
      response: NextResponse.json({ error: "Nao autorizado." }, { status: 401 })
    };
  }
  return { admin, response: null };
}

export function aplicarCookieSessao(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function limparCookieSessao(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export { gerarTokenAdmin, validarTokenAdmin };
