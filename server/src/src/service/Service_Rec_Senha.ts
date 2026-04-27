/**
 * @author Kairo Chácara
 * @version 1.0
 * @date 14/04/2026
 * @description Classe de serviço responsável por gerenciar o fluxo de recuperação de credenciais,
 * lidando com a validação de identidade, geração de tokens JWT e comunicação via SMTP.
 * @rota server\src\src\service\Service_Rec_Senha.ts
 */

import { sign, verify } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';


function obterJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET nao configurado. Recuperacao de senha indisponivel ate o ambiente ser corrigido.');
  }
  return jwtSecret;
}
const BASE_URL =
  process.env.FRONTEND_URL || 'http://localhost:3000';

export class ServiceRecuperacaoSenha {
  static async redefinirSenha(token: string, novaSenha: string) {
    if (
      !novaSenha ||
      novaSenha.length < 8 ||
      novaSenha.length > 72 ||
      !/[a-z]/.test(novaSenha) ||
      !/[A-Z]/.test(novaSenha) ||
      !/\d/.test(novaSenha) ||
      !/[^A-Za-z0-9]/.test(novaSenha)
    ) {
      throw new Error(
        'A nova senha deve ter 8 a 72 caracteres, com letra maiuscula, minuscula, numero e caractere especial.',
      );
    }

    const decoded = verify(token, obterJwtSecret()) as { id?: string };
    if (!decoded.id) {
      throw new Error('Token de recuperacao invalido.');
    }

    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    await prisma.usuarios.update({
      where: { id: decoded.id },
      data: { senha: senhaCriptografada },
    });

    return { mensagem: 'Senha redefinida com sucesso.' };
  }

  /**
   * Envia um e-mail de recuperação de senha com link contendo token JWT.
   * @param {string} email - Endereço de e-mail do usuário solicitante.
   * @returns {Promise<{ mensagem: string }>} - Objeto de resposta confirmando o envio.
   * @throws {Error} - Lança erro se o usuário não for encontrado ou se houver falha no transporte SMTP.
   */
  static async enviarEmailRecuperacao(email: string) {
    console.log(
      `[LOG-FLUXO] Iniciando enviarEmailRecuperacao para o e-mail alvo: ${email}`,
    );

    try {
      console.log(
        `[LOG-FLUXO] Consultando base de dados para verificar existência da conta: ${email}`,
      );

      // Busca no banco via Prisma mantendo a nomenclatura original
      // Operação assíncrona: Início da consulta
      const usuario = await prisma.usuarios.findUnique({
        where: { email },
      });
      // Operação assíncrona: Fim da consulta

      // Ramificação condicional: Verificação de existência do usuário
      if (!usuario) {
        console.error(
          `[ERRO-FLUXO] Falha na recuperação: E-mail ${email} não foi encontrado na tabela 'usuarios'.`,
        );
        throw new Error(
          'Usuário com este e-mail não encontrado',
        );
      }

      console.log(
        `[LOG-FLUXO] Usuário identificado: ${usuario.nome} (ID: ${usuario.id}). Iniciando geração de token JWT de segurança.`,
      );

      // Geração do token com payload de identificação (Expira em 15 minutos para segurança)
      const token = sign({ id: usuario.id }, obterJwtSecret(), {
        expiresIn: '15m',
      });

      const linkRecuperacao = `${BASE_URL}/redefinir-senha?token=${token}`;
      console.log(
        `[LOG-FLUXO] Link de redefinição construído com sucesso para o usuário ${usuario.id}.`,
      );

      const htmlPath = path.join(
        __dirname,
        '../../HTML/emails/recuperar_senha.html',
      );

      console.log(
        `[LOG-FLUXO] Verificando existência física do template de e-mail em: ${htmlPath}`,
      );

      // Ramificação condicional: Verificação de infraestrutura de arquivos
      if (!fs.existsSync(htmlPath)) {
        console.error(
          `[ERRO-FLUXO] Falha estrutural: Arquivo de template ausente em: ${htmlPath}`,
        );
        throw new Error(
          'Template de e-mail de recuperação ausente.',
        );
      }

      console.log(
        '[LOG-FLUXO] Lendo conteúdo do template HTML para processamento.',
      );
      let html = fs.readFileSync(htmlPath, 'utf8');

      console.log(
        '[LOG-FLUXO] Injetando variáveis dinâmicas (nome e link) no corpo do HTML.',
      );
      html = html.replace('{{nome}}', usuario.nome);
      html = html.replace('{{link}}', linkRecuperacao);

      console.log(
        `[LOG-FLUXO] Configurando transportador Nodemailer (Host: smtp.gmail.com). Usuário SMTP: ${process.env.EMAIL_USER}`,
      );
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      console.log(
        `[LOG-FLUXO] Iniciando tentativa de disparo de e-mail para ${email} via servidor SMTP.`,
      );

      // Operação assíncrona: Envio de e-mail
      await transporter.sendMail({
        from: `"Suporte NossoZelo" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Recuperação de Senha - NossoZelo',
        html,
      });

      console.log(
        `[LOG-FLUXO] Sucesso: Disparo de e-mail concluído para ${email}. Operação finalizada com êxito.`,
      );

      return {
        mensagem:
          'E-mail de recuperação enviado com sucesso',
      };
    } catch (error: any) {
      console.error(
        `[ERRO-FLUXO] Exceção capturada no fluxo de recuperação para ${email}: ${
          error.message || error
        }.`,
      );
      // Re-lançamento da exceção para tratamento no controller
      throw error;
    }
  }
}

export class ServiceRecuperacaoSenhaDefault extends ServiceRecuperacaoSenha {}
export default ServiceRecuperacaoSenha;
