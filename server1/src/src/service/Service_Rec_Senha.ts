import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const JWT_SECRET =
  process.env.JWT_SECRET || 'sua-chave-secreta';
const BASE_URL =
  process.env.FRONTEND_URL || 'http://localhost:3000';

export class ServiceRecuperacaoSenha {
  static async enviarEmailRecuperacao(email: string) {
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new Error(
        'Usuário com este e-mail não encontrado',
      );
    }

    const token = sign({ id: usuario.id }, JWT_SECRET, {
      expiresIn: '15m',
    });

    const linkRecuperacao = `${BASE_URL}/redefinir-senha?token=${token}`;

    const htmlPath = path.join(
      __dirname,
      '../../HTML/emails/recuperar_senha.html',
    );
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Substitui as variáveis do HTML
    html = html.replace('{{nome}}', usuario.nome);
    html = html.replace('{{link}}', linkRecuperacao);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Suporte NossoZelo" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperação de Senha - NossoZelo',
      html,
    });

    return {
      mensagem: 'E-mail de recuperação enviado com sucesso',
    };
  }
}

export default ServiceRecuperacaoSenha;
